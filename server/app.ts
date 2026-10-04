import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { issuesRouter } from './routes/issues';
import { pinsRouter } from './routes/pins';
import { dashboardRouter } from './routes/dashboard';
import { scraperRouter } from './routes/scraper';
import { suiteRouter } from './routes/suite';
import { aiRouter } from './routes/ai';

export const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.use('/api/issues', issuesRouter);
app.use('/api/pins', pinsRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/scraper', scraperRouter);
app.use('/api/suite', suiteRouter);
app.use('/api/ai', aiRouter);

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  // eslint-disable-next-line no-console
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});
