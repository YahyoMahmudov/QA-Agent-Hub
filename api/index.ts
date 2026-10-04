// Vercel serverless entry point. The app talks to Supabase over the network,
// so there is no local filesystem/db to seed or copy into /tmp before serving
// requests — every DB call just hits Supabase's REST API directly.
import { app } from '../server/app';

export default app;
