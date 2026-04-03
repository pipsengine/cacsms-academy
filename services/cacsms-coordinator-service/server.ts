import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import router from './routes';
import { serviceConfig } from './config';
import { logRequest } from './logger';

const app = express();
const limiter = rateLimit(serviceConfig.rateLimit);

function getAllowedOrigins(): string[] {
  return (process.env.INTEL_COORDINATOR_CORS_ORIGIN || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
}

app.use(cors({ origin: getAllowedOrigins() }));
app.use(express.json({ limit: '1mb' }));
app.use((req, _res, next) => {
  logRequest(req.method, req.path);
  next();
});
app.use(limiter);
app.use(router);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[IntelCoordinator][GLOBAL]', err);
  res.status(500).json({ error: 'Internal server error' });
});

if (typeof require !== 'undefined' && require.main === module) {
  const port = serviceConfig.port;
  app.listen(port, () => {
    console.log(`[IntelCoordinator] listening on ${port}`);
  });
}

export default app;
