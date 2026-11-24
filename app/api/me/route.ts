import { NextResponse } from 'next/server';
import { USERS } from '@/server/store';

// Persona list for the demo switcher. In the real system the role comes from the Entra ID group (SEC-03).
export async function GET() {
  return NextResponse.json({ users: USERS });
}
