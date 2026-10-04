-- Schema mirroring server/db/index.ts (SQLite) for Supabase Postgres.
-- Table names and columns match the SQLite source exactly.
-- Type mapping applied:
--   TEXT                         -> TEXT
--   INTEGER (boolean flag 0/1)   -> BOOLEAN
--   INTEGER (count/duration)     -> INTEGER
--   REAL                         -> DOUBLE PRECISION
--   TEXT DEFAULT (datetime('now')) -> TIMESTAMPTZ DEFAULT now()

CREATE TABLE IF NOT EXISTS issues (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  diagnostic TEXT NOT NULL,
  area TEXT NOT NULL,
  source TEXT NOT NULL,
  severity TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  locator TEXT,
  persona TEXT,
  trace_artifact TEXT,
  snapshot_url TEXT,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pins (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  xpath TEXT NOT NULL,
  target_element TEXT NOT NULL,
  page TEXT NOT NULL,
  severity TEXT NOT NULL,
  author TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  jira_key TEXT,
  coord_x DOUBLE PRECISION,
  coord_y DOUBLE PRECISION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS scrape_runs (
  id TEXT PRIMARY KEY,
  persona TEXT NOT NULL,
  plp_checked BOOLEAN NOT NULL DEFAULT true,
  pdp_checked BOOLEAN NOT NULL DEFAULT true,
  hash_checked BOOLEAN NOT NULL DEFAULT true,
  total_items INTEGER NOT NULL DEFAULT 0,
  broken_assets INTEGER NOT NULL DEFAULT 0,
  hash_collisions INTEGER NOT NULL DEFAULT 0,
  price_anomalies INTEGER NOT NULL DEFAULT 0,
  duration_ms INTEGER NOT NULL DEFAULT 0,
  logs TEXT NOT NULL DEFAULT '[]',
  defects_pushed INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS scrape_items (
  sku TEXT NOT NULL,
  run_id TEXT NOT NULL REFERENCES scrape_runs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status_badge TEXT NOT NULL,
  status_badge_type TEXT NOT NULL,
  image TEXT NOT NULL,
  image_alt TEXT NOT NULL,
  is_glitch BOOLEAN NOT NULL DEFAULT false,
  glitch_label TEXT,
  live_price TEXT NOT NULL,
  price_note TEXT,
  secondary_label TEXT NOT NULL,
  secondary_value TEXT NOT NULL,
  severity TEXT NOT NULL,
  scope TEXT NOT NULL,
  jira_key TEXT NOT NULL,
  snippet_text TEXT NOT NULL,
  PRIMARY KEY (sku, run_id)
);

CREATE TABLE IF NOT EXISTS suite_runs (
  id TEXT PRIMARY KEY,
  spec TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'RUNNING',
  details TEXT NOT NULL DEFAULT '',
  worker TEXT NOT NULL,
  duration_ms INTEGER NOT NULL DEFAULT 0,
  notes TEXT NOT NULL DEFAULT '',
  action_type TEXT NOT NULL DEFAULT 'trace',
  passed_count INTEGER NOT NULL DEFAULT 0,
  failed_count INTEGER NOT NULL DEFAULT 0,
  logs TEXT NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
