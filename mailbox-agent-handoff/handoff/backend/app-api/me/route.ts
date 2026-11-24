import { NextRequest, NextResponse } from 'next/server';
import { USERS } from '@/lib/store';

// Persona list for the demo switcher. In the real system the role comes from the Entra ID group (SEC-03).
export async function GET(_req: NextRequest) {
  return NextResponse.json({ users: USERS });
}
