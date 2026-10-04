import { Router } from 'express';
import { supabase, timeAgo, assertNoError } from '../db/index.js';

export const dashboardRouter = Router();

const KNOWN_PERSONAS = [
  'standard_user',
  'problem_user',
  'performance_glitch_user',
  'error_user',
  'visual_user',
  'locked_out_user',
];

const OPEN_STATUSES = ['open', 'in_progress'];

async function count(table: string, build?: (q: any) => any): Promise<number> {
  let q = supabase.from(table).select('*', { count: 'exact', head: true });
  if (build) q = build(q);
  const { count: c, error } = await q;
  assertNoError(error, `Failed to count ${table}`);
  return c ?? 0;
}

dashboardRouter.get('/stats', async (_req, res, next) => {
  try {
    const [issuesCount, openIssues, criticalIssues, pinsCount, openPins, scrapeItems, suiteRuns] = await Promise.all([
      count('issues'),
      count('issues', (q) => q.in('status', OPEN_STATUSES)),
      count('issues', (q) => q.eq('severity', 'critical').in('status', OPEN_STATUSES)),
      count('pins'),
      count('pins', (q) => q.eq('status', 'open')),
      count('scrape_items'),
      count('suite_runs'),
    ]);

    const { data: recent, error: recentError } = await supabase
      .from('suite_runs')
      .select('status, created_at')
      .order('created_at', { ascending: false })
      .limit(20);
    assertNoError(recentError, 'Failed to load recent suite runs');
    const passed = (recent ?? []).filter((r) => r.status === 'PASSED').length;
    const passRate = recent && recent.length > 0 ? Math.round((passed / recent.length) * 100) : null;

    const { data: lastRun, error: lastRunError } = await supabase
      .from('suite_runs')
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    assertNoError(lastRunError, 'Failed to load last suite run');

    const { data: lastScrape, error: lastScrapeError } = await supabase
      .from('scrape_runs')
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    assertNoError(lastScrapeError, 'Failed to load last scrape run');

    // There is no local SQLite file to measure anymore - DB size now lives in
    // Supabase, which isn't exposed over the REST API without a DB function.
    const dbSizeMB: number | null = null;

    res.json({
      recordCount: issuesCount + pinsCount + scrapeItems + suiteRuns,
      openIssues,
      criticalIssues,
      totalPins: pinsCount,
      openPins,
      passRate,
      lastSuiteRunAgo: lastRun ? timeAgo(lastRun.created_at) : null,
      lastScrapeAgo: lastScrape ? timeAgo(lastScrape.created_at) : null,
      dbSizeMB,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Aggregated, entirely-real view backing the Dashboard's top metric cards,
 * persona health matrix, and defect distribution chart. Everything here is
 * derived from actual suite_runs / scrape_runs / issues rows - there is no
 * fabricated data, so any persona or dimension we haven't actually tested
 * yet is reported as "Not Tested" rather than a made-up status.
 */
dashboardRouter.get('/overview', async (_req, res, next) => {
  try {
    const { data: recentRunsData, error: recentRunsError } = await supabase
      .from('suite_runs')
      .select('status')
      .order('created_at', { ascending: false })
      .limit(20);
    assertNoError(recentRunsError, 'Failed to load recent suite runs');
    const recentRuns = recentRunsData ?? [];
    const passed = recentRuns.filter((r) => r.status === 'PASSED').length;
    const failed = recentRuns.filter((r) => r.status === 'FAILED').length;
    const flaky = recentRuns.filter((r) => r.status === 'FLAKY').length;
    const total = recentRuns.length;
    const passRate = total > 0 ? Math.round((passed / total) * 1000) / 10 : null;

    const { data: openIssuesData, error: openIssuesError } = await supabase
      .from('issues')
      .select('severity, area')
      .in('status', OPEN_STATUSES);
    assertNoError(openIssuesError, 'Failed to load open issues');
    const openIssues = openIssuesData ?? [];

    const sevCount = { critical: 0, high: 0, medium: 0, low: 0 };
    const areaCount: Record<string, number> = {};
    for (const issue of openIssues) {
      if (issue.severity in sevCount) sevCount[issue.severity as keyof typeof sevCount]++;
      areaCount[issue.area] = (areaCount[issue.area] ?? 0) + 1;
    }
    const totalOpen = openIssues.length;
    const defectDistribution = Object.entries(areaCount)
      .map(([area, count]) => ({ area, count, pct: totalOpen > 0 ? Math.round((count / totalOpen) * 1000) / 10 : 0 }))
      .sort((a, b) => b.count - a.count);

    const { data: allRunsData, error: allRunsError } = await supabase
      .from('suite_runs')
      .select('spec, details, status, duration_ms')
      .order('created_at', { ascending: false })
      .limit(500);
    assertNoError(allRunsError, 'Failed to load suite runs');
    const allRuns = allRunsData ?? [];

    const { data: scrapeRowsData, error: scrapeRowsError } = await supabase
      .from('scrape_runs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);
    assertNoError(scrapeRowsError, 'Failed to load scrape runs');
    const scrapeRows = scrapeRowsData ?? [];

    const latestScrapePerPersona = new Map<string, any>();
    for (const s of scrapeRows) {
      if (!latestScrapePerPersona.has(s.persona)) latestScrapePerPersona.set(s.persona, s);
    }

    const findLatest = (persona: string, matches: (r: (typeof allRuns)[number]) => boolean) =>
      allRuns.find((r) => r.details.startsWith(`[${persona}]`) && matches(r));

    const personaMatrix = KNOWN_PERSONAS.map((persona) => {
      const authRun = findLatest(persona, (r) => r.spec.includes('auth') || /login|lockout/i.test(r.details));
      const checkoutRun = findLatest(persona, (r) => r.spec.includes('checkout') || /checkout|finish/i.test(r.details));
      const scrape = latestScrapePerPersona.get(persona);

      let plp: { label: string; status: string; note: string };
      if (scrape) {
        const defectCount = scrape.broken_assets + scrape.hash_collisions + scrape.price_anomalies;
        plp = defectCount > 0
          ? { label: `${defectCount} Issue(s)`, status: 'error', note: `${scrape.broken_assets} broken, ${scrape.hash_collisions} dup, ${scrape.price_anomalies} price` }
          : { label: '200 OK', status: 'pass', note: 'Clean DOM' };
      } else {
        const plpRun = findLatest(persona, (r) => r.spec.includes('cart') || /inventory|product/i.test(r.details));
        plp = plpRun
          ? {
              label: plpRun.status === 'PASSED' ? 'Renders OK' : 'Render Failed',
              status: plpRun.status === 'PASSED' ? 'pass' : 'error',
              note: plpRun.details.replace(/^\[[a-z_]+\]\s*/, ''),
            }
          : { label: 'Not Tested', status: 'neutral', note: 'No scrape or PLP test yet' };
      }

      // A test's PASSED status means "the assertion held", not "the user got
      // in" - for a lockout test PASSED means rejection is confirmed working.
      // Only read PASSED as "Authenticated" for tests that aren't checking a
      // deliberate lockout.
      const isLockoutCheck = persona === 'locked_out_user' || /lockout|locked out/i.test(authRun?.details ?? '');
      const auth = authRun
        ? isLockoutCheck
          ? {
              label: authRun.status === 'PASSED' ? 'Rejected (expected)' : 'Unexpected Access',
              status: authRun.status === 'PASSED' ? 'warning' : 'error',
              note: authRun.details.replace(/^\[[a-z_]+\]\s*/, ''),
            }
          : {
              label: authRun.status === 'PASSED' ? 'Authenticated' : 'Auth Failed',
              status: authRun.status === 'PASSED' ? 'pass' : 'error',
              note: authRun.details.replace(/^\[[a-z_]+\]\s*/, ''),
            }
        : { label: 'Not Tested', status: 'neutral', note: 'No auth test yet' };

      const checkout = checkoutRun
        ? {
            label: checkoutRun.status === 'PASSED' ? 'Complete' : 'Blocked',
            status: checkoutRun.status === 'PASSED' ? 'pass' : 'error',
            note: checkoutRun.details.replace(/^\[[a-z_]+\]\s*/, ''),
          }
        : { label: 'Not Tested', status: 'neutral', note: 'No checkout test yet' };

      const durations = [authRun?.duration_ms, checkoutRun?.duration_ms].filter((d): d is number => typeof d === 'number');
      const avgDurationMs = durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : null;

      return { persona, auth, plp, checkout, avgDurationMs };
    });

    const testedPersonas = personaMatrix.filter((p) => p.auth.status !== 'neutral' || p.plp.status !== 'neutral' || p.checkout.status !== 'neutral').length;
    const flaggedPersonas = personaMatrix.filter((p) => p.auth.status === 'error' || p.plp.status === 'error' || p.checkout.status === 'error' || p.auth.status === 'warning').length;

    const { data: latestScrape, error: latestScrapeError } = await supabase
      .from('scrape_runs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    assertNoError(latestScrapeError, 'Failed to load latest scrape run');

    res.json({
      passRate: { rate: passRate, total, passed, failed, flaky },
      defects: { total: totalOpen, ...sevCount },
      defectDistribution,
      personaMatrix,
      personaCoverage: { tested: testedPersonas, total: KNOWN_PERSONAS.length, flagged: flaggedPersonas },
      assetDetections: latestScrape
        ? {
            brokenAssets: latestScrape.broken_assets,
            hashCollisions: latestScrape.hash_collisions,
            priceAnomalies: latestScrape.price_anomalies,
            persona: latestScrape.persona,
          }
        : null,
    });
  } catch (err) {
    next(err);
  }
});
