// Serves the Sakhi API over plain HTTP on this Mac (node:http), for the end-to-end test. Each request becomes a web
// Request for api.js exactly as Supabase delivers it, with the caller's IP in x-forwarded-for.
import http from 'node:http';

export function serve(handle, port = 0) {
  return new Promise((resolve) => {
    const srv = http.createServer(async (req, res) => {
      const chunks = [];
      for await (const c of req) chunks.push(c);
      const body = Buffer.concat(chunks);
      const headers = new Headers();
      for (const [k, v] of Object.entries(req.headers)) if (v !== undefined) headers.set(k, Array.isArray(v) ? v.join(', ') : v);
      headers.set('x-forwarded-for', req.socket.remoteAddress || '127.0.0.1');
      const request = new Request('http://' + (req.headers.host || '127.0.0.1') + req.url, {
        method: req.method, headers, body: body.length && req.method !== 'GET' && req.method !== 'HEAD' ? body : undefined
      });
      const out = await handle(request);
      res.writeHead(out.status, Object.fromEntries(out.headers));
      res.end(Buffer.from(await out.arrayBuffer()));
    });
    srv.listen(port, '127.0.0.1', () => {
      const p = srv.address().port;
      resolve({ url: 'http://127.0.0.1:' + p, close: () => new Promise((r) => srv.close(r)) });
    });
  });
}
