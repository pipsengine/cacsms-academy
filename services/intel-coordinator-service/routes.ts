import { Router, Request, Response } from 'express';
import { runCoordinator } from '../../packages/engine-coordinator/index';
import { marketSnapshotSchema } from '../../packages/engine-coordinator/schemas';
import { logRequest, logError } from './logger';

const router = Router();

router.post('/api/opportunities', async (req: Request, res: Response) => {
  logRequest(req.method, req.path);
  try {
    const snapshot = marketSnapshotSchema.parse(req.body);
    const packet = runCoordinator(snapshot);
    res.json(packet);
  } catch (error) {
    logError('Failed to orchestrate snapshot', error as Error);
    res.status(400).json({ error: (error as Error).message });
  }
});

export default router;
