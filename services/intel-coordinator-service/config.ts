export const serviceConfig = {
  port: Number(process.env.INTEL_COORDINATOR_PORT) || 4201,
  rateLimit: {
    windowMs: 60 * 1000,
    max: 60,
  },
};
