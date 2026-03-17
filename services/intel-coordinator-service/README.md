# Intel Coordinator Service

This lightweight Express service exposes the engine-coordinator package as an API.

Endpoints:
- POST /api/opportunities: accepts a market snapshot, runs every engine, and returns an opportunity packet.

Security & observability:
- Rate-limited to 60 requests per minute.
- Logs requests and errors.
- Validates every payload with zod before orchestration.
