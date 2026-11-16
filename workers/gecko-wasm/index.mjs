const corsHeaders = () =>
  new Headers({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
    'Access-Control-Allow-Headers': 'Range, If-Range, If-None-Match, If-Modified-Since',
    'Access-Control-Expose-Headers': 'Accept-Ranges, Content-Length, Content-Range, ETag, Last-Modified',
    'Access-Control-Max-Age': '86400',
    'Cross-Origin-Resource-Policy': 'cross-origin',
  });

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (pathname !== '/gecko.wasm') {
      return new Response('Not found', { status: 404, headers: corsHeaders() });
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders() });
    }

    if (!env.GECKO_WASM_URL) {
      return new Response('GECKO_WASM_URL is not configured', {
        status: 500,
        headers: corsHeaders(),
      });
    }

    const upstreamHeaders = new Headers();
    for (const name of ['range', 'if-range', 'if-none-match', 'if-modified-since']) {
      const value = request.headers.get(name);
      if (value) upstreamHeaders.set(name, value);
    }

    const upstream = await fetch(env.GECKO_WASM_URL, {
      method: request.method,
      headers: upstreamHeaders,
      redirect: 'follow',
    });

    if (!upstream.ok && upstream.status !== 304) {
      return new Response(`WASM origin returned HTTP ${upstream.status}`, {
        status: 502,
        headers: corsHeaders(),
      });
    }

    const headers = new Headers(upstream.headers);
    for (const [name, value] of corsHeaders()) {
      headers.set(name, value);
    }
    headers.set('Content-Type', 'application/wasm');
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');

    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers,
    });
  },
};
