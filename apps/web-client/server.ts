import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server } from 'socket.io';
import type { Socket } from 'socket.io';
import type { AddressInfo } from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getMarketDataService } from './src/lib/market/service.ts';
import { syncDerivedAlerts } from './src/lib/alerts/service.ts';
import { startCotWeeklyScheduler } from './src/lib/cot/scheduler.ts';
import { startExchangeRateScheduler } from './src/lib/pricing/exchangeRateScheduler.ts';
import { startInterestRateScheduler } from './src/lib/interest-rates/interestRateScheduler.ts';

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

  void syncDerivedAlerts().catch((error) => {
    console.error('Initial derived alert sync failed', error);
  });

  startCotWeeklyScheduler();
  startExchangeRateScheduler();
  startInterestRateScheduler();

  setInterval(() => {
    void marketService.refresh()
      .then(() => emitSnapshot(io))
      .then(() => syncDerivedAlerts())
      .catch((error) => {
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

  void listenWithFallback(server, port).then((activePort) => {
    console.log(`> Ready on http://localhost:${activePort}`);
  });
});

function createMarketPayload(timestamp = new Date().toISOString()) {
  return {
    timestamp,
  };
}

function listenWithFallback(server: ReturnType<typeof createServer>, startPort: number): Promise<number> {
  return new Promise((resolve, reject) => {
    const tryPort = (candidatePort: number) => {
      const onError = (error: NodeJS.ErrnoException) => {
        server.off('listening', onListening);

        if (error.code === 'EADDRINUSE') {
          console.warn(`Port ${candidatePort} is in use, trying ${candidatePort + 1}...`);
          setImmediate(() => tryPort(candidatePort + 1));
          return;
        }

        reject(error);
      };

      const onListening = () => {
        server.off('error', onError);
        const address = server.address() as AddressInfo | null;
        resolve(address?.port ?? candidatePort);
      };

      server.once('error', onError);
      server.once('listening', onListening);
      server.listen(candidatePort);
    };

    tryPort(startPort);
  });
}
