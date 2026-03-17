import { z } from 'zod';

export const coordinatorConfigSchema = z.object({
  probability: z.object({
    smoothing: z.number().min(0).max(1).default(0.1),
  }),
  opportunity: z.object({
    minScore: z.number().min(0).max(1).default(0.4),
    maxResults: z.number().int().min(1).default(5),
  }),
});

export type CoordinatorConfig = z.infer<typeof coordinatorConfigSchema>;

export const defaultCoordinatorConfig: CoordinatorConfig = {
  probability: {
    smoothing: 0.1,
  },
  opportunity: {
    minScore: 0.4,
    maxResults: 5,
  },
};
