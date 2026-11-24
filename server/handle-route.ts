import { NextRequest, NextResponse } from 'next/server';
import type { Role, User } from '@/types/mailbox';
import { db, userById } from '@/server/store';
import { ApiError } from '@/server/actions';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Wrap a route handler: identify the user, check the role, add fake latency, format errors. */
export function handleRoute(
  roles: Role[] | 'any-staff' | 'all',
  fn: (req: NextRequest, u: User, ctx: { params: Record<string, string> }) => unknown,
) {
  return async (req: NextRequest, rawContext: { params: Promise<Record<string, string>> }) => {
    try {
      if (db().flags.latency) await sleep(120 + Math.random() * 280);
      // The signed-in user comes from the x-user-id header, or the "user-id" cookie the persona switcher sets.
      const id = req.headers.get('x-user-id') || req.cookies.get('user-id')?.value || '';
      const u = userById(id);
      if (!u) throw new ApiError(401, 'NOT_SIGNED_IN', 'Sign in first.');
      // SEC-02: mailbox access group is the gate. Users outside the group get nothing.
      if (u.role === 'none') throw new ApiError(403, 'NO_MAILBOX_ACCESS', 'You do not have access to this mailbox.');
      const allowed = roles === 'all' ? ['owner', 'agent', 'viewer'] : roles === 'any-staff' ? ['owner', 'agent'] : roles;
      if (!allowed.includes(u.role)) throw new ApiError(403, 'FORBIDDEN', 'Your role cannot do this.');
      // Next 16: route params arrive as a Promise. Resolve once here so handlers read ctx.params.id directly.
      const ctx = { params: await rawContext.params };
      const out = await fn(req, u, ctx);
      return out instanceof NextResponse ? out : NextResponse.json(out as object);
    } catch (e) {
      if (e instanceof ApiError) {
        return NextResponse.json({ error: { code: e.code, message: e.message, ...(e.extra || {}) } }, { status: e.status });
      }
      console.error(e);
      return NextResponse.json({ error: { code: 'SERVER', message: 'Something went wrong.' } }, { status: 500 });
    }
  };
}
