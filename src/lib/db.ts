import { neon, neonConfig } from '@neondatabase/serverless';
import * as https from 'node:https';
import * as dns from 'node:dns/promises';

// Cache IPv4 resolution so we don't re-resolve on every query
const ipv4Cache = new Map<string, string>();

async function resolveIPv4(hostname: string): Promise<string> {
  if (ipv4Cache.has(hostname)) return ipv4Cache.get(hostname)!;
  const [ip] = await dns.resolve4(hostname);
  ipv4Cache.set(hostname, ip);
  return ip;
}

// Custom fetch that forces IPv4 to avoid IPv6 ETIMEDOUT on some networks
async function ipv4Fetch(
  url: string,
  opts: RequestInit = {}
): Promise<Response> {
  const parsed = new URL(url);
  const ipv4 = await resolveIPv4(parsed.hostname);

  const body =
    opts.body != null
      ? typeof opts.body === 'string'
        ? Buffer.from(opts.body)
        : Buffer.from(opts.body as ArrayBuffer)
      : undefined;

  const inHeaders = (opts.headers ?? {}) as Record<string, string>;

  return new Promise<Response>((resolve, reject) => {
    const reqOpts: https.RequestOptions = {
      host: ipv4,           // Connect to IPv4 address
      port: 443,
      path: parsed.pathname + parsed.search,
      method: (opts.method ?? 'GET').toUpperCase(),
      servername: parsed.hostname, // TLS SNI — must match the certificate
      headers: {
        ...inHeaders,
        Host: parsed.host,
        ...(body ? { 'Content-Length': String(body.length) } : {}),
      },
    };

    const req = https.request(reqOpts, (res) => {
      const chunks: Buffer[] = [];
      res.on('data', (chunk: Buffer) => chunks.push(chunk));
      res.on('end', () => {
        const text = Buffer.concat(chunks).toString('utf8');
        const headers = new Headers();
        for (const [k, v] of Object.entries(res.headers)) {
          if (v != null)
            headers.set(k, Array.isArray(v) ? v.join(', ') : v);
        }
        resolve(new Response(text, { status: res.statusCode!, headers }));
      });
      res.on('error', reject);
    });

    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

// Use IPv4-only fetch to work around IPv6 ETIMEDOUT issues in local dev
// On Vercel, native fetch works fine (IPv6 routed); here we force IPv4
neonConfig.fetchFunction = ipv4Fetch;

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

export const sql = neon(process.env.DATABASE_URL);
