import { chromium } from '@playwright/test';
import crypto from 'crypto';
import type { InventoryInspectionItem } from '../../src/types';

export interface ScrapedProduct {
  sku: string;
  name: string;
  price: string;
  imageUrl: string;
  imageStatus: number | null;
  imageHash: string | null;
}

export interface ScraperOptions {
  persona: string;
  plp: boolean;
  pdp: boolean;
  hash: boolean;
}

export interface ScraperLogLine {
  time: string;
  text: string;
}

export interface ScraperResult {
  products: ScrapedProduct[];
  logs: ScraperLogLine[];
  durationMs: number;
  brokenAssetSkus: string[];
  duplicateGroups: string[][]; // groups of SKUs that share an identical image asset
  zeroPriceSkus: string[];
}

function ts() {
  return new Date().toLocaleTimeString('en-US', { hour12: false });
}

/**
 * Logs in as the given SauceDemo persona, walks the inventory grid (and
 * optionally each product detail page), and inspects every rendered
 * product image for real HTTP failures and duplicate-asset reuse - this
 * is the actual, well known SauceDemo `problem_user` bug (every product
 * renders the same placeholder image) rather than a simulated one.
 */
export async function runContentScrape(opts: ScraperOptions): Promise<ScraperResult> {
  const start = Date.now();
  const logs: ScraperLogLine[] = [];
  const log = (text: string) => logs.push({ time: ts(), text });

  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({
      userAgent: 'Playwright-Agent-SauceDemo/QA-Agent-Hub',
      viewport: { width: 1920, height: 1080 },
    });
    const page = await context.newPage();

    log('[CRAWLER] Chromium headless launched (Playwright)');

    await page.goto('https://www.saucedemo.com/', { waitUntil: 'domcontentloaded' });
    await page.fill('#user-name', opts.persona);
    await page.fill('#password', 'secret_sauce');
    await page.click('#login-button');

    const loginError = await page
      .locator('[data-test="error"]')
      .textContent({ timeout: 2_000 })
      .catch(() => null);

    if (loginError) {
      log(`[AUTH] FAIL: ${loginError.trim()}`);
      return {
        products: [],
        logs,
        durationMs: Date.now() - start,
        brokenAssetSkus: [],
        duplicateGroups: [],
        zeroPriceSkus: [],
      };
    }

    await page.waitForURL('**/inventory.html', { timeout: 10_000 });
    log(`[AUTH] Authenticated session for persona: ${opts.persona}`);

    const products: ScrapedProduct[] = [];

    if (opts.plp) {
      const cards = await page.$$eval('.inventory_item', (nodes) =>
        nodes.map((n, idx) => ({
          idx,
          name: n.querySelector('.inventory_item_name')?.textContent?.trim() ?? `Item ${idx}`,
          price: n.querySelector('.inventory_item_price')?.textContent?.trim() ?? '$0.00',
          imageUrl: n.querySelector('img')?.getAttribute('src') ?? '',
        }))
      );
      log(`[DOM SCAN] Ingested ${cards.length} inventory cards from /inventory.html`);

      for (const card of cards) {
        const sku = slugify(card.name);
        const absoluteUrl = new URL(card.imageUrl, page.url()).toString();
        products.push({
          sku,
          name: card.name,
          price: card.price,
          imageUrl: absoluteUrl,
          imageStatus: null,
          imageHash: null,
        });
      }
    }

    if (opts.pdp && products.length > 0) {
      // Deep-scan the first product's PDP route as a representative sample,
      // matching the "PDP Scan" scope toggle in the UI.
      await page.click('.inventory_item_name >> nth=0');
      await page.waitForURL('**/inventory-item.html**', { timeout: 8_000 }).catch(() => null);
      const pdpPrice = await page.locator('.inventory_details_price').textContent().catch(() => null);
      if (pdpPrice) {
        log(`[DEEP SCAN PDP] Route ${page.url()} price parsed as "${pdpPrice.trim()}"`);
        if (products[0]) products[0].price = pdpPrice.trim();
      }
      await page.goBack({ waitUntil: 'domcontentloaded' }).catch(() => null);
    }

    // Real HTTP + hash check against every unique image URL.
    const uniqueUrls = [...new Set(products.map((p) => p.imageUrl))].filter(Boolean);
    const statusByUrl = new Map<string, number | null>();
    const hashByUrl = new Map<string, string | null>();

    for (const url of uniqueUrls) {
      try {
        const resp = await page.request.get(url);
        const status = resp.status();
        statusByUrl.set(url, status);
        if (opts.hash) {
          const buf = await resp.body();
          hashByUrl.set(url, crypto.createHash('sha256').update(buf).digest('hex').slice(0, 12));
        }
        if (status >= 400) {
          log(`[ASSET ${status}] FAIL: GET ${url} -> HTTP ${status} Not Found`);
        }
      } catch (err) {
        statusByUrl.set(url, null);
        log(`[ASSET ERROR] FAIL: GET ${url} -> ${(err as Error).message.split('\n')[0]}`);
      }
    }

    for (const p of products) {
      p.imageStatus = statusByUrl.get(p.imageUrl) ?? null;
      p.imageHash = hashByUrl.get(p.imageUrl) ?? null;
    }

    // Duplicate-asset detection: products that render an identical image.
    const bySrc = new Map<string, ScrapedProduct[]>();
    for (const p of products) {
      const key = opts.hash && p.imageHash ? p.imageHash : p.imageUrl;
      if (!bySrc.has(key)) bySrc.set(key, []);
      bySrc.get(key)!.push(p);
    }
    const duplicateGroups: string[][] = [];
    for (const group of bySrc.values()) {
      if (group.length > 1) {
        duplicateGroups.push(group.map((p) => p.sku));
        log(
          `[HASH COLLISION] WARN: ${group.map((p) => p.name).join(', ')} render an identical image asset (${
            group.length
          } products)`
        );
      }
    }

    const brokenAssetSkus = products.filter((p) => (p.imageStatus ?? 200) >= 400).map((p) => p.sku);
    const zeroPriceSkus = products
      .filter((p) => parseFloat(p.price.replace(/[^0-9.]/g, '')) <= 0 || !p.price.includes('$'))
      .map((p) => p.sku);

    const durationMs = Date.now() - start;
    log(
      `[AUDIT SUMMARY] Scrape completed in ${(durationMs / 1000).toFixed(2)}s. ` +
        `${brokenAssetSkus.length} broken assets, ${zeroPriceSkus.length} price glitches, ` +
        `${duplicateGroups.length} hash collision group(s).`
    );

    return { products, logs, durationMs, brokenAssetSkus, duplicateGroups, zeroPriceSkus };
  } finally {
    await browser.close();
  }
}

/** Maps raw scrape output onto the InventoryInspectionItem shape the UI cards render. */
export function toInventoryItems(result: ScraperResult, opts: ScraperOptions): InventoryInspectionItem[] {
  const scope = opts.plp && opts.pdp ? 'PLP + PDP' : opts.pdp ? 'PDP Route Impacted' : 'PLP Viewport';

  return result.products.map((p) => {
    const isBroken = result.brokenAssetSkus.includes(p.sku);
    const dupGroup = result.duplicateGroups.find((g) => g.includes(p.sku));
    const isDup = Boolean(dupGroup && dupGroup.length > 1);
    const isZeroPrice = result.zeroPriceSkus.includes(p.sku);
    const isGlitchOr404 = isBroken || isDup || isZeroPrice;

    let statusBadge: string;
    let statusBadgeType: InventoryInspectionItem['statusBadgeType'];
    let glitchLabel: string | undefined;
    let severity: string;

    if (isBroken) {
      statusBadge = `HTTP ${p.imageStatus}`;
      statusBadgeType = 'error';
      glitchLabel = `${shortUrl(p.imageUrl)} - Target asset returned status code ${p.imageStatus}`;
      severity = 'High / Critical';
    } else if (isDup) {
      const others = result.products
        .filter((o) => dupGroup!.includes(o.sku) && o.sku !== p.sku)
        .map((o) => o.name);
      statusBadge = 'Asset Reused';
      statusBadgeType = 'tertiary';
      glitchLabel = `Identical image asset shared with ${others.join(', ') || 'another product'} (${dupGroup!.length} products, hash ${p.imageHash ?? 'n/a'})`;
      severity = 'Low / Glitch';
    } else if (isZeroPrice) {
      statusBadge = 'High Severity';
      statusBadgeType = 'error';
      glitchLabel = `PDP price parsed as ${p.price} (expected a positive value)`;
      severity = 'High / Critical';
    } else {
      statusBadge = 'Clean / Pass';
      statusBadgeType = 'success';
      glitchLabel = `${shortUrl(p.imageUrl)} ${p.imageStatus ?? 200} OK`;
      severity = 'Clean';
    }

    const jiraKey = `${p.sku.replace('SAUCE-', '')}-${isBroken ? 'HTTP' : isDup ? 'HASH' : isZeroPrice ? 'PRICE' : 'PASS'}`;

    return {
      sku: p.sku,
      name: p.name,
      statusBadge,
      statusBadgeType,
      image: p.imageUrl,
      imageAlt: `${p.name} product asset`,
      isGlitchOr404,
      glitchLabel,
      livePrice: p.price,
      priceNote: isZeroPrice ? '(Zero Price)' : '(Valid)',
      secondaryLabel: opts.hash ? 'SHA256 Hash' : 'HTTP Status',
      secondaryValue: opts.hash ? `${p.imageHash ?? 'n/a'}${isDup ? ' (DUP)' : ''}` : `${p.imageStatus ?? 'n/a'}`,
      severity,
      scope,
      jiraKey,
      snippetText: `h2. SauceDemo Asset Audit: ${p.name}\n*Persona*: ${opts.persona}\n*URL*: ${p.imageUrl}\n*Status*: ${statusBadge}\n*Detail*: ${glitchLabel}`,
    };
  });
}

function shortUrl(url: string): string {
  try {
    return new URL(url).pathname.split('/').pop() ?? url;
  } catch {
    return url;
  }
}

function slugify(name: string): string {
  const words = name
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toUpperCase()
    .split('-')
    .filter((w) => w && w !== 'SAUCE' && w !== 'LABS');

  return 'SAUCE-' + words.map((w) => w.slice(0, 3)).join('-').slice(0, 20);
}
