// Vercel serverless entry point. The app talks to Supabase over the network,
// so there is no local filesystem/db to seed before serving requests — every
// DB call just hits Supabase's REST API directly. The one legitimate /tmp
// use is @sparticuz/chromium extracting its bundled browser binary at
// runtime (see suiteBrowserRunner.ts) - that's an ephemeral per-invocation
// scratch file, not app data, so it doesn't change the point above.
import { app } from '../server/app.js';

export default app;
