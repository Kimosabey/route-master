// Minimal HTTP surface over the router (Node built-in http — no framework dependency).
//   POST /route  { "prompt": "..." }  -> routing decision, cost, response text
//   GET  /stats                       -> cost ledger summary (spend vs. baseline)
//   GET  /health

import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { buildRouterFromEnv } from './config.ts';

const router = buildRouterFromEnv();

const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
  try {
    if (req.method === 'POST' && req.url === '/route') {
      const body = await readBody(req);
      const { prompt } = JSON.parse(body || '{}') as { prompt?: string };
      if (!prompt) return json(res, 400, { error: 'prompt required' });
      const r = await router.route(prompt);
      return json(res, 200, {
        decision: r.decision,
        cost: r.cost,
        fellBack: r.fellBack,
        model: r.completion.model,
        text: r.completion.text,
      });
    }
    if (req.method === 'GET' && req.url === '/stats') return json(res, 200, router.ledger.summary());
    if (req.method === 'GET' && req.url === '/health') return json(res, 200, { ok: true });
    return json(res, 404, { error: 'not found' });
  } catch (e) {
    return json(res, 500, { error: (e as Error).message });
  }
});

const port = Number(process.env.PORT ?? 3000);
server.listen(port, () => console.log(`RouteMaster listening on :${port}`));

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve) => {
    let d = '';
    req.on('data', (c) => (d += c));
    req.on('end', () => resolve(d));
  });
}

function json(res: ServerResponse, code: number, obj: unknown): void {
  res.writeHead(code, { 'content-type': 'application/json' });
  res.end(JSON.stringify(obj));
}
