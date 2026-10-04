import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { issuesRouter } from './routes/issues.js';
import { pinsRouter } from './routes/pins.js';
import { dashboardRouter } from './routes/dashboard.js';
import { scraperRouter } from './routes/scraper.js';
import { suiteRouter } from './routes/suite.js';
import { aiRouter } from './routes/ai.js';

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
