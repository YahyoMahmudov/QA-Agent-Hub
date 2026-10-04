import { Router } from 'express';
import { supabase, nowIso, assertNoError } from '../db';
import { runContentScrape, toInventoryItems, type ScraperOptions } from '../services/scraper.service';

export const scraperRouter = Router();

scraperRouter.post('/run', async (req, res) => {
  const body = req.body ?? {};
  const opts: ScraperOptions = {
    persona: body.persona || 'problem_user',
    plp: body.plp !== false,
    pdp: body.pdp !== false,
    hash: body.hash !== false,
  };

  try {
    const result = await runContentScrape(opts);
    const items = toInventoryItems(result, opts);

    const runId = `SCR-${Date.now().toString(36).toUpperCase()}`;
    const { error: runError } = await supabase.from('scrape_runs').insert({
      id: runId,
      persona: opts.persona,
      plp_checked: opts.plp,
      pdp_checked: opts.pdp,
      hash_checked: opts.hash,
      total_items: items.length,
      broken_assets: result.brokenAssetSkus.length,
      hash_collisions: result.duplicateGroups.length,
      price_anomalies: result.zeroPriceSkus.length,
      duration_ms: result.durationMs,
      logs: JSON.stringify(result.logs.map((l) => `[${l.time}] ${l.text}`)),
      created_at: nowIso(),
    });
    assertNoError(runError, 'Failed to create scrape run');

    if (items.length > 0) {
      const { error: itemsError } = await supabase.from('scrape_items').insert(
        items.map((item) => ({
          sku: item.sku,
          run_id: runId,
          name: item.name,
          status_badge: item.statusBadge,
          status_badge_type: item.statusBadgeType,
          image: item.image,
          image_alt: item.imageAlt,
          is_glitch: item.isGlitchOr404,
          glitch_label: item.glitchLabel ?? null,
          live_price: item.livePrice,
          price_note: item.priceNote ?? null,
          secondary_label: item.secondaryLabel,
          secondary_value: item.secondaryValue,
          severity: item.severity,
          scope: item.scope,
          jira_key: item.jiraKey,
          snippet_text: item.snippetText,
        }))
      );
      assertNoError(itemsError, 'Failed to insert scrape items');
    }

    res.json({
      runId,
      items,
      logs: result.logs.map((l) => `[${l.time}] ${l.text}`),
      summary: {
        totalItems: items.length,
        brokenAssets: result.brokenAssetSkus.length,
        hashCollisions: result.duplicateGroups.length,
        priceAnomalies: result.zeroPriceSkus.length,
        durationMs: result.durationMs,
      },
    });
  } catch (err) {
    res.status(502).json({ error: `Scrape failed: ${(err as Error).message}` });
  }
});

scraperRouter.get('/latest', async (_req, res, next) => {
  try {
    const { data: run, error: runError } = await supabase
      .from('scrape_runs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    assertNoError(runError, 'Failed to load latest scrape run');
    if (!run) return res.json(null);

    const { data: items, error: itemsError } = await supabase.from('scrape_items').select('*').eq('run_id', run.id);
    assertNoError(itemsError, 'Failed to load scrape items');

    res.json({
      runId: run.id,
      persona: run.persona,
      logs: JSON.parse(run.logs),
      items: (items ?? []).map((row) => ({
        sku: row.sku,
        name: row.name,
        statusBadge: row.status_badge,
        statusBadgeType: row.status_badge_type,
        image: row.image,
        imageAlt: row.image_alt,
        isGlitchOr404: !!row.is_glitch,
        glitchLabel: row.glitch_label ?? undefined,
        livePrice: row.live_price,
        priceNote: row.price_note ?? undefined,
        secondaryLabel: row.secondary_label,
        secondaryValue: row.secondary_value,
        severity: row.severity,
        scope: row.scope,
        jiraKey: row.jira_key,
        snippetText: row.snippet_text,
      })),
      summary: {
        totalItems: run.total_items,
        brokenAssets: run.broken_assets,
        hashCollisions: run.hash_collisions,
        priceAnomalies: run.price_anomalies,
        durationMs: run.duration_ms,
      },
    });
  } catch (err) {
    next(err);
  }
});

scraperRouter.post('/push-defects', async (req, res, next) => {
  try {
    const { runId } = req.body ?? {};
    const runQuery = supabase.from('scrape_runs').select('*');
    const { data: run, error: runError } = await (runId
      ? runQuery.eq('id', runId).maybeSingle()
      : runQuery.order('created_at', { ascending: false }).limit(1).maybeSingle());
    assertNoError(runError, 'Failed to load scrape run');

    if (!run) return res.status(404).json({ error: 'No scrape run found' });
    if (run.defects_pushed) {
      return res.status(200).json({ created: [], message: 'Defects already pushed for this run' });
    }

    const { data: items, error: itemsError } = await supabase
      .from('scrape_items')
      .select('*')
      .eq('run_id', run.id)
      .eq('is_glitch', true);
    assertNoError(itemsError, 'Failed to load glitch items');

    const now = nowIso();
    const created: { id: string; title: string }[] = [];

    for (let i = 0; i < (items ?? []).length; i++) {
      const item = items![i];
      const title = `${item.status_badge}: ${item.name}`;

      const { data: existing, error: findError } = await supabase
        .from('issues')
        .select('id')
        .eq('title', title)
        .eq('source', 'Content Scraper')
        .in('status', ['open', 'in_progress'])
        .maybeSingle();
      assertNoError(findError, 'Failed to look up existing issue');

      if (existing) {
        const { error: touchError } = await supabase.from('issues').update({ last_seen_at: now }).eq('id', existing.id);
        assertNoError(touchError, 'Failed to touch existing issue');
        continue;
      }

      const id = `ISS-${Date.now().toString(36).toUpperCase()}${i}`;
      const severity = /critical|high/i.test(item.severity) ? 'high' : /low/i.test(item.severity) ? 'low' : 'medium';
      const { error: insertError } = await supabase.from('issues').insert({
        id,
        title,
        diagnostic: `${item.glitch_label ?? item.status_badge} • SKU: ${item.sku}`,
        area: 'PLP',
        source: 'Content Scraper',
        severity,
        status: 'open',
        locator: `img[alt="${item.image_alt}"]`,
        persona: run.persona,
        first_seen_at: now,
        last_seen_at: now,
      });
      assertNoError(insertError, 'Failed to create issue from scrape item');
      created.push({ id, title });
    }

    const { error: markPushedError } = await supabase.from('scrape_runs').update({ defects_pushed: 1 }).eq('id', run.id);
    assertNoError(markPushedError, 'Failed to mark defects as pushed');

    res.json({ created, count: created.length });
  } catch (err) {
    next(err);
  }
});
