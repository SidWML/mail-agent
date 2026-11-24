import { NextRequest, NextResponse } from 'next/server';
import type { Role, User } from './types';
import { db, userById } from './store';
import { ApiError } from './actions';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Wrap a route handler: identify the user, check the role, add fake latency, format errors. */
export function handle(
  roles: Role[] | 'any-staff' | 'all',
  fn: (req: NextRequest, u: User, ctx: any) => Promise<any> | any,
) {
  return async (req: NextRequest, ctx: any) => {
    try {
      if (db().flags.latency) await sleep(120 + Math.random() * 280);
      const id = req.headers.get('x-user-id') || '';
      const u = userById(id);
      if (!u) throw new ApiError(401, 'NOT_SIGNED_IN', 'Sign in first.');
      // SEC-02: mailbox access group is the gate. Users outside the group get nothing.
      if (u.role === 'none') throw new ApiError(403, 'NO_MAILBOX_ACCESS', 'You do not have access to this mailbox.');
      const allowed = roles === 'all' ? ['owner', 'agent', 'viewer'] : roles === 'any-staff' ? ['owner', 'agent'] : roles;
      if (!allowed.includes(u.role)) throw new ApiError(403, 'FORBIDDEN', 'Your role cannot do this.');
      const out = await fn(req, u, ctx);
      return out instanceof NextResponse ? out : NextResponse.json(out);
    } catch (e: any) {
      if (e instanceof ApiError) {
        return NextResponse.json({ error: { code: e.code, message: e.message, ...(e.extra || {}) } }, { status: e.status });
      }
      console.error(e);
      return NextResponse.json({ error: { code: 'SERVER', message: 'Something went wrong.' } }, { status: 500 });
    }
  };
}
