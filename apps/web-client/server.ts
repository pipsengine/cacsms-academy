import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server } from 'socket.io';
import type { Socket } from 'socket.io';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import { getMarketDataService } from './src/lib/market/service.ts';

if (!process.env.NODE_ENV) {
  (process.env as any).NODE_ENV = process.env.npm_lifecycle_event === 'start' ? 'production' : 'development';
}

const dev = process.env.NODE_ENV !== 'production';
const port = parseInt(process.env.PORT || '3000', 10);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = next({ dev, dir: __dirname });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    try {
      const pathname = parse(req.url || '/', true).pathname || '/';
      if (dev && pathname.startsWith('/_next/static/')) {
        const relativePath = pathname.replace('/_next/static/', '');
        const staticPath = path.join(__dirname, '.next', 'static', relativePath);
        if (!existsSync(staticPath)) {
          (async () => {
            for (let i = 0; i < 200; i++) {
              if (existsSync(staticPath)) break;
              await delay(50);
            }
            handle(req, res);
          })().catch((err) => {
            console.error('Error occurred handling', req.url, err);
            res.statusCode = 500;
            res.end('internal server error');
          });
          return;
        }
      }

      handle(req, res);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  const marketService = getMarketDataService();

  async function emitSnapshot(target: Server | Socket) {
    const snapshot = await marketService.getSnapshot();
    const payload = createMarketPayload(snapshot.generatedAt);
    target.emit('currency_update', { ...payload, data: snapshot.currencies });
    target.emit('channel_update', { ...payload, data: snapshot.channels });
    target.emit('breakout_update', { ...payload, data: snapshot.breakouts });
    target.emit('prices_update', { ...payload, data: snapshot.prices });
    target.emit('price_timestamps_update', { ...payload, data: snapshot.priceTimestamps });
  }

  void marketService.refresh().then(() => emitSnapshot(io)).catch((error) => {
    console.error('Initial market snapshot failed', error);
  });

  setInterval(() => {
    void marketService.refresh().then(() => emitSnapshot(io)).catch((error) => {
      console.error('Market refresh failed', error);
    });
  }, Number(process.env.FOREX_REFRESH_SECONDS ?? 60) * 1000);

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    void emitSnapshot(socket).catch((error) => {
      console.error('Socket snapshot emit failed', error);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});

function createMarketPayload(timestamp = new Date().toISOString()) {
  return {
    timestamp,
  };
}
