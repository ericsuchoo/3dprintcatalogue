/** Verify Cloudflare Access JWTs cryptographically; never trust identity headers alone. */
export type AdminEnv = { CF_ACCESS_TEAM_DOMAIN?: string; CF_ACCESS_AUD?: string; ADMIN_EMAILS?: string };
const decoder = new TextDecoder();
const decode = (part: string) => JSON.parse(decoder.decode(Uint8Array.from(atob(part.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0))));
export async function verifyAdmin(request: Request, env: AdminEnv): Promise<{ email: string } | null> {
  const domain = env.CF_ACCESS_TEAM_DOMAIN?.trim().replace(/\/$/, '');
  const aud = env.CF_ACCESS_AUD?.trim();
  const allowed = (env.ADMIN_EMAILS ?? '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  if (!domain || !aud || !allowed.length || !/^https:\/\/[a-z0-9.-]+\.cloudflareaccess\.com$/i.test(domain)) return null;
  const token = request.headers.get('Cf-Access-Jwt-Assertion');
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const header = decode(parts[0]);
    const payload = decode(parts[1]);
    const now = Math.floor(Date.now() / 1000);
    if (header.alg !== 'RS256' || typeof header.kid !== 'string' ||
        payload.iss !== domain || !(Array.isArray(payload.aud) ? payload.aud.includes(aud) : payload.aud === aud) ||
        !Number.isFinite(payload.exp) || payload.exp <= now ||
        !Number.isFinite(payload.iat) || payload.iat > now + 60 ||
        typeof payload.email !== 'string' || !allowed.includes(payload.email.toLowerCase())) return null;
    const response = await fetch(`${domain}/cdn-cgi/access/certs`, { signal: AbortSignal.timeout(4000) });
    if (!response.ok) return null;
    const jwks = await response.json() as { keys?: JsonWebKey[] };
    const keyData = jwks.keys?.find(k => (k as JsonWebKey & {kid?: string}).kid === header.kid && k.kty === 'RSA');
    if (!keyData) return null;
    const key = await crypto.subtle.importKey('jwk', keyData, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
    const signature = Uint8Array.from(atob(parts[2].replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
    const valid = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, signature, new TextEncoder().encode(`${parts[0]}.${parts[1]}`));
    return valid ? { email: payload.email } : null;
  } catch { return null; }
}
export function adminContext(locals: any) {
  const env = locals?.runtime?.env;
  return { env, db: env?.DB };
}
export const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' } });
export function safePage(value: string | null): number { const n = Number(value ?? 1); return Number.isSafeInteger(n) && n >= 1 && n <= 100000 ? n : 1; }
