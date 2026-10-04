import { app } from './app';

const PORT = Number(process.env.PORT) || 8787;

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`[server] QA Agent Hub API listening on http://localhost:${PORT}`);
});
