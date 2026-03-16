import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server } from 'socket.io';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = process.env.npm_lifecycle_event === 'start' ? 'production' : 'development';
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
            for (let i = 0; i < 40; i++) {
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

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Start emitting live data
    const currencyInterval = setInterval(() => {
      socket.emit('currency_update', generateCurrencyData());
    }, 3000);

    const channelInterval = setInterval(() => {
      socket.emit('channel_update', generateChannelData());
    }, 4000);

    const breakoutInterval = setInterval(() => {
      socket.emit('breakout_update', generateBreakoutData());
    }, 5000);

    // Send initial data immediately
    socket.emit('currency_update', generateCurrencyData());
    socket.emit('channel_update', generateChannelData());
    socket.emit('breakout_update', generateBreakoutData());

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      clearInterval(currencyInterval);
      clearInterval(channelInterval);
      clearInterval(breakoutInterval);
    });
  });

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});

// Helper functions for mock data
let lastCurrencies = [
  { name: 'EUR', score: 94 },
  { name: 'GBP', score: 82 },
  { name: 'USD', score: 59 },
  { name: 'AUD', score: 44 },
  { name: 'CAD', score: 32 },
  { name: 'CHF', score: 25 },
  { name: 'NZD', score: 18 },
  { name: 'JPY', score: 9 },
];

function generateCurrencyData() {
  lastCurrencies = lastCurrencies.map(c => {
    const change = Math.floor(Math.random() * 5) - 2;
    return { ...c, score: Math.max(0, Math.min(100, c.score + change)) };
  }).sort((a, b) => b.score - a.score);
  return lastCurrencies;
}

let lastChannels = [
  { pair: 'GBPJPY', tf: 'H1', type: 'Ascending', touches: 'R4 | S3', score: 88, bias: 'LONG', prob: 74 },
  { pair: 'EURAUD', tf: 'M30', type: 'Descending', touches: 'R3 | S3', score: 81, bias: 'SHORT', prob: 82 },
  { pair: 'USDCHF', tf: 'H4', type: 'Horizontal', touches: 'R5 | S4', score: 92, bias: 'NEUTRAL', prob: 45 },
  { pair: 'AUDNZD', tf: 'D1', type: 'Ascending', touches: 'R2 | S2', score: 65, bias: 'LONG', prob: 58 },
  { pair: 'EURUSD', tf: 'H1', type: 'Sym Triangle', touches: 'R3 | S4', score: 78, bias: 'NEUTRAL', prob: 60 },
];

function generateChannelData() {
  lastChannels = lastChannels.map(c => {
    const probChange = Math.floor(Math.random() * 3) - 1;
    const scoreChange = Math.floor(Math.random() * 3) - 1;
    return { 
      ...c, 
      prob: Math.max(0, Math.min(100, c.prob + probChange)),
      score: Math.max(0, Math.min(100, c.score + scoreChange))
    };
  }).sort((a, b) => b.score - a.score);
  return lastChannels;
}

let lastBreakouts = [
  { pair: 'EURAUD', tf: 'M30', dir: 'SHORT', conf: 81, time: '2m ago', status: 'ACTIVE' },
  { pair: 'GBPUSD', tf: 'H1', dir: 'LONG', conf: 94, time: '15m ago', status: 'TRIGGERED' },
  { pair: 'USDCAD', tf: 'H4', dir: 'LONG', conf: 68, time: '1h ago', status: 'MONITORING' },
  { pair: 'AUDJPY', tf: 'M30', dir: 'SHORT', conf: 88, time: 'Just now', status: 'ACTIVE' },
];

function generateBreakoutData() {
  lastBreakouts = lastBreakouts.map(b => {
    const confChange = Math.floor(Math.random() * 3) - 1;
    return { 
      ...b, 
      conf: Math.max(0, Math.min(100, b.conf + confChange))
    };
  });
  return lastBreakouts;
}
