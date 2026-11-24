import { NextResponse } from 'next/server';
import { handle } from '@/lib/server';
import { findMail, logAudit } from '@/lib/store';
import { ApiError } from '@/lib/actions';
import { permsFor } from '@/lib/rules';

// GET — preview / download. Downloads are logged (SEC-10). Files are scanned by Defender in Exchange.
export const GET = handle('all', async (req, u, ctx) => {
  const m = findMail(ctx.params.mailId);
  if (!m || !permsFor(u, m).open) throw new ApiError(404, 'NOT_FOUND', 'Mail not found.');
  const att = m.thread.flatMap((x) => x.attachments).find((a) => a.id === ctx.params.attId);
  if (!att) throw new ApiError(404, 'NOT_FOUND', 'Attachment not found.');
  const download = req.nextUrl.searchParams.get('download') === '1';
  if (download) logAudit(u, 'Attachment download', m, undefined, undefined, att.name);
  return new NextResponse(`Dummy content of ${att.name}\n(This prototype does not store real files.)`, {
    headers: { 'content-type': 'text/plain', ...(download ? { 'content-disposition': `attachment; filename="${att.name}.txt"` } : {}) },
  });
});
