export class ApiErr extends Error {
  constructor(public status: number, public code: string, message: string, public extra: any = {}) { super(message); }
}
let uid = 'u-ravi';
export const setUid = (u: string) => (uid = u);
export async function api<T = any>(path: string, opts: { method?: string; body?: any } = {}): Promise<T> {
  const r = await fetch('/api' + path, {
    method: opts.method || (opts.body ? 'POST' : 'GET'),
    headers: { 'x-user-id': uid, 'content-type': 'application/json' },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    cache: 'no-store',
  });
  if (!r.ok) {
    let e: any = {};
    try { e = (await r.json()).error || {}; } catch {}
    throw new ApiErr(r.status, e.code || 'ERR', e.message || 'Something went wrong.', e);
  }
  return r.json();
}
export const ago = (h: number) => (h < 1 ? `${Math.max(1, Math.round(h * 60))}m` : h < 48 ? `${Math.round(h)}h` : `${Math.round(h / 24)}d`);
export const when = (iso: string) => new Date(iso).toLocaleString([], { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
export const ageColor = (h: number) => (h < 24 ? '#2e9e5b' : h < 72 ? '#e0a100' : h < 168 ? '#e8742a' : '#d3202a');
export const kb = (n: number) => (n > 1e6 ? (n / 1e6).toFixed(1) + ' MB' : Math.round(n / 1e3) + ' KB');
