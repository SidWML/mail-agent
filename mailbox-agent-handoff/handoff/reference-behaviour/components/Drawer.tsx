'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { api, ApiErr, ago, kb, when } from '@/lib/client';
import { Modal } from './Modal';

const OUTCOMES = ['Answered', 'Forwarded', 'No action needed', 'Duplicate', 'Spam'];
type Dlg = null | 'acted' | 'forward' | 'category' | 'assign' | 'takeover' | 'delete' | 'reopen' | 'block' | 'conflict' | 'sendfail' | 'expired' | 'attach';

export default function Drawer({ id, me, cats, templates, team, onClose, onChanged, toast }: any) {
  const [d, setD] = useState<any>(null);
  const [err, setErr] = useState('');
  const [dlg, setDlg] = useState<Dlg>(null);
  const [info, setInfo] = useState<any>({});
  const [busy, setBusy] = useState(false);
  // composer
  const [mode, setMode] = useState<'reply' | 'replyAll' | 'note'>('reply');
  const [body, setBody] = useState('');
  const [cc, setCc] = useState('');
  const [files, setFiles] = useState<{ name: string; size: number; kind: string }[]>([]);
  const [next, setNext] = useState('Waiting on sender');
  const [drafting, setDrafting] = useState(false);
  const presenceSent = useRef(false);

  const load = useCallback(async () => {
    try { setD(await api(`/mails/${id}`)); setErr(''); } catch (e: any) { setErr(e.message); }
  }, [id]);
  useEffect(() => { setD(null); setBody(''); setFiles([]); presenceSent.current = false; load(); }, [id, load]);
  useEffect(() => { const t = setInterval(load, 8000); return () => clearInterval(t); }, [load]); // refresh presence + sender replies
  useEffect(() => { const k = (e: KeyboardEvent) => e.key === 'Escape' && !dlg && onClose(); window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, [dlg, onClose]);

  async function act(payload: any, okMsg?: string) {
    setBusy(true);
    try {
      await api(`/mails/${id}/actions`, { body: { ...payload, version: d.mail.version } });
      if (okMsg) toast(okMsg);
      setDlg(null);
      await load();
      onChanged();
      return true;
    } catch (e: any) {
      if (e instanceof ApiErr) {
        if (e.code === 'ALREADY_CLAIMED') { setInfo({ owner: e.extra.ownerName }); setDlg('conflict'); await load(); onChanged(); }
        else if (e.code === 'SEND_FAILED') setDlg('sendfail');
        else if (e.code === 'RESTORE_EXPIRED') { setDlg('expired'); await load(); onChanged(); }
        else if (e.code === 'STALE') { toast('Someone changed this mail. Refreshed.', true); await load(); onChanged(); }
        else toast(e.message, true);
      }
      return false;
    } finally { setBusy(false); }
  }

  if (err) return <Shell onClose={onClose}><div className="empty">{err}</div></Shell>;
  if (!d) return <Shell onClose={onClose}><div className="empty">Loading…</div></Shell>;
  const m = d.mail, p = d.perms, mine = m.ownerId === me.id;
  const openTk = m.takeovers.find((t: any) => t.state === 'open');

  const typing = (v: string) => {
    setBody(v);
    if (!presenceSent.current && v) { presenceSent.current = true; api('/presence', { body: { mailId: id, replying: true } }).catch(() => {}); }
  };
  async function aiDraft() {
    setDrafting(true);
    try { const r = await api('/ai/draft', { body: { mailId: id } }); setBody(r.draft); toast(`Draft based on ${r.basedOn}. Review before sending.`); } catch (e: any) { toast(e.message, true); }
    setDrafting(false);
  }
  async function send() {
    if (mode === 'note') { if (await act({ type: 'note', text: body }, 'Note added')) setBody(''); return; }
    const ok = await act({ type: 'reply', body, replyAll: mode === 'replyAll', cc: cc.split(/[,;\s]+/).filter(Boolean), attachments: files, next }, 'Reply sent as ai@schindler.com');
    if (ok) { setBody(''); setFiles([]); setCc(''); presenceSent.current = false; }
  }
  const lastIn = [...m.thread].reverse().find((x: any) => x.kind === 'in');

  return (
    <Shell onClose={onClose}>
      <div className="dhead">
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 700 }}>{m.subject}</div>
          <div className="mut">{m.sender} &lt;{m.email}&gt; · {when(m.receivedAt)} · {ago(((Date.now()) - new Date(m.receivedAt).getTime()) / 3.6e6)} ago</div>
          <div style={{ marginTop: 6, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <span className={`pill s-${m.status}`}>{m.status}</span>
            <span className={`pill u-${m.urgency}`}>{m.urgency}</span>
            <span className="pill" style={{ background: '#e8ebf0' }}>{m.category}</span>
            {m.needsReview && <span className="pill rev">Needs review</span>}
            {m.slaBreached && <span className="pill u-High">Past SLA ({m.slaHours}h)</span>}
            {m.blockedSender && <span className="pill u-High">Sender blocked</span>}
          </div>
        </div>
        <button className="btn" onClick={onClose}>✕ Close</button>
      </div>

      <div className="dbody">
        <div>
          {/* ownership bar — what it shows depends on status + owner + role */}
          {m.status === 'Deleted' ? (
            <div className="own done">🗑 Deleted. {m.daysLeftToRestore > 0 ? `Can be restored for ${m.daysLeftToRestore} more day(s).` : 'Restore window ended.'}
              {p.restore && <button className="btn" onClick={() => act({ type: 'restore' }, 'Mail restored')}>Restore</button>}</div>
          ) : m.status === 'Acted' ? (
            <div className="own done">✔ Acted: {m.outcome}{m.outcomeNote ? ` · ${m.outcomeNote}` : ''} · by {m.ownerName ?? '—'}
              {p.reopen && <button className="btn" onClick={() => setDlg('reopen')}>Reopen</button>}</div>
          ) : !m.ownerId ? (
            <div className="own free">Unassigned.
              {p.claim && <button className="btn p" disabled={busy} onClick={() => act({ type: 'claim' }, 'Claimed. It is yours now.')}>Claim</button>}
              {p.assign && <button className="btn" onClick={() => setDlg('assign')}>Assign to…</button>}
              {p.assignToMe && <button className="btn" onClick={() => act({ type: 'assign_to_me' }, 'Assigned to you')}>Assign to me</button>}
              {!p.claim && !p.assign && <span className="mut">Only support team members can claim.</span>}</div>
          ) : mine ? (
            <div className="own mine">✔ Yours{p.assign && <button className="btn" onClick={() => setDlg('assign')}>Reassign…</button>}</div>
          ) : (
            <div className="own other">🔒 Owned by <b>{m.ownerName}</b>
              {p.takeoverRequest && !openTk && <button className="btn" onClick={() => setDlg('takeover')}>Request takeover</button>}
              {p.assignToMe && <button className="btn" onClick={() => act({ type: 'assign_to_me' }, 'Assigned to you')}>Assign to me</button>}
              {p.assign && <button className="btn" onClick={() => setDlg('assign')}>Reassign…</button>}</div>
          )}
          {openTk && (
            <div className="banner warn">Takeover requested by <b>{openTk.byName}</b>: “{openTk.reason}”
              {p.takeoverDecide && <> <button className="btn p" onClick={() => act({ type: 'takeover_decide', requestId: openTk.id, approve: true }, 'Takeover approved')}>Approve</button> <button className="btn" onClick={() => act({ type: 'takeover_decide', requestId: openTk.id, approve: false }, 'Declined')}>Decline</button></>}
              {!p.takeoverDecide && ' · waiting for the owner.'}</div>
          )}
          {d.someoneReplying && <div className="banner warn">✎ {d.someoneReplying} is replying to this mail right now.</div>}
          {m.duplicateSubject && <div className="banner warn">Possible duplicate of “{m.duplicateSubject}”.</div>}

          <div style={{ display: 'flex', gap: 6, margin: '0 0 10px', flexWrap: 'wrap' }}>
            <button className="btn" disabled={!p.forward} onClick={() => setDlg('forward')}>Forward</button>
            <button className="btn" disabled={!p.acted} onClick={() => setDlg('acted')}>Mark as acted</button>
            <button className="btn" disabled={!p.recategorize} onClick={() => setDlg('category')}>Change category</button>
            <button className="btn d" disabled={!p.block} onClick={() => setDlg('block')}>Block sender</button>
            <button className="btn d" disabled={!p.del} onClick={() => setDlg('delete')}>Delete</button>
          </div>

          <div className="card">
            {m.thread.map((t: any) => (
              <div key={t.id} className={`msg ${t.kind}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <b>{t.kind === 'note' ? '📝 Internal note · ' : t.kind === 'fwd' ? '↪ Forwarded · ' : t.kind === 'out' ? '↩ ' : ''}{t.author}</b>
                  <span className="mut">{when(t.at)}</span>
                </div>
                {(t.to?.length > 0 || t.cc?.length > 0) && <div className="mut">To {t.to?.join(', ')}{t.cc?.length ? ` · Cc ${t.cc.join(', ')}` : ''}</div>}
                <pre>{t.body}</pre>
                {t.attachments.map((a: any) => (
                  <span key={a.id} className="att" onClick={() => { setInfo({ att: a }); setDlg('attach'); }}>📎 {a.name} <span className="mut">{kb(a.size)} · scanned ✓</span></span>
                ))}
              </div>
            ))}
          </div>

          {/* composer */}
          {(p.reply || p.note) && m.status !== 'Deleted' && (
            <div className="card" style={{ padding: 12, marginTop: 12 }}>
              <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                {p.reply && <button className={`btn ${mode === 'reply' ? 'p' : ''}`} onClick={() => setMode('reply')}>Reply</button>}
                {p.reply && <button className={`btn ${mode === 'replyAll' ? 'p' : ''}`} onClick={() => setMode('replyAll')}>Reply all</button>}
                <button className={`btn ${mode === 'note' ? 'p' : ''}`} onClick={() => setMode('note')}>Internal note</button>
                {mode !== 'note' && <>
                  <button className="btn" disabled={drafting} onClick={aiDraft}>{drafting ? 'Drafting…' : '✨ AI draft'}</button>
                  <select className="btn" value="" onChange={(e) => { const t = templates.find((x: any) => x.id === e.target.value); if (t) setBody(t.body.replace(/‹sender name›/g, m.sender.split(' ')[0]).replace(/‹category›/g, m.category)); }}>
                    <option value="">Insert template…</option>
                    {templates.map((t: any) => <option key={t.id} value={t.id}>{d.suggestedTemplateIds.includes(t.id) ? '★ ' : ''}{t.name}</option>)}
                  </select></>}
              </div>
              {mode !== 'note' && <div className="mut" style={{ marginBottom: 6 }}>From ai@schindler.com · To {mode === 'replyAll' && lastIn?.cc?.length ? [m.email, ...lastIn.cc].join(', ') : m.email}</div>}
              {mode === 'replyAll' && <input style={{ width: '100%', marginBottom: 6, border: '1px solid #c9ced8', borderRadius: 6, padding: '5px 8px' }} placeholder="Add Cc (comma separated)" value={cc} onChange={(e) => setCc(e.target.value)} />}
              {!p.reply && mode !== 'note' && <div className="banner warn">Claim or assign this mail to yourself before replying.</div>}
              <textarea className="comp" value={body} onChange={(e) => typing(e.target.value)} placeholder={mode === 'note' ? 'Only the team sees this note.' : 'Write your reply…'} />
              {mode !== 'note' && (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 6, flexWrap: 'wrap' }}>
                  <label className="btn">📎 Attach<input type="file" multiple hidden onChange={(e) => setFiles([...files, ...Array.from(e.target.files || []).map((f) => ({ name: f.name, size: f.size, kind: (f.name.split('.').pop() || 'pdf').toLowerCase() }))])} /></label>
                  {files.map((f, i) => <span key={i} className="att" onClick={() => setFiles(files.filter((_, j) => j !== i))}>{f.name} ✕</span>)}
                  <span style={{ flex: 1 }} />
                  <span className="mut">After sending, set status to</span>
                  <select value={next} onChange={(e) => setNext(e.target.value)} className="btn"><option>Waiting on sender</option><option>Acted</option><option>In progress</option></select>
                </div>
              )}
              <div style={{ textAlign: 'right', marginTop: 8 }}><button className="btn p" disabled={busy || !body.trim() || (mode !== 'note' && !p.reply)} onClick={send}>{mode === 'note' ? 'Add note' : 'Send'}</button></div>
            </div>
          )}
        </div>

        <div className="side">
          <div className="card"><h4>AI summary</h4><div style={{ marginBottom: 6 }}>{m.summary}</div><ul style={{ margin: '0 0 0 16px', padding: 0 }}>{m.bullets.map((b: string, i: number) => <li key={i}>{b}</li>)}</ul></div>
          <div className="card"><h4>AI classification</h4>
            <div className="kv"><span>Category</span><b>{m.category}</b></div>
            <div className="kv"><span>AI suggested</span><span>{m.aiCategory}</span></div>
            <div className="kv"><span>Confidence</span><span>{Math.round(m.confidence * 100)}%</span></div>
            <div className="kv"><span>Urgency</span><span>{m.urgency}</span></div>
            <div className="kv"><span>Sentiment</span><span>{m.sentiment}</span></div>
            <div className="kv"><span>Topic</span><span>{m.topic}</span></div>
            {m.needsReview && <div className="banner warn" style={{ marginTop: 6 }}>Confidence is below 60%. Please check the category.</div>}
          </div>
          <div className="card"><h4>Details found</h4>
            <div className="kv"><span>Business unit</span><span>{m.entities.businessUnit}</span></div>
            <div className="kv"><span>Country</span><span>{m.entities.country}</span></div>
            <div className="kv"><span>Application</span><span>{m.entities.application}</span></div>
            <div className="kv"><span>Language</span><span>{m.entities.language}</span></div>
            <div className="kv"><span>SLA</span><span>{m.slaHours} h</span></div>
          </div>
        </div>
      </div>

      {/* ---------- dialogs ---------- */}
      {dlg === 'acted' && <ActedDlg onClose={() => setDlg(null)} onOk={(o: string, n: string) => act({ type: 'acted', outcome: o, note: n }, 'Marked as acted')} />}
      {dlg === 'forward' && <FieldsDlg title="Forward mail" fields={[{ k: 'to', label: 'To (email)' }, { k: 'note', label: 'Message', area: true }]} cta="Forward" onClose={() => setDlg(null)} onOk={(v: any) => act({ type: 'forward', ...v }, 'Forwarded')} />}
      {dlg === 'category' && <CategoryDlg cats={cats} cur={m.categoryId} onClose={() => setDlg(null)} onOk={(c: string, r: string) => act({ type: 'recategorize', categoryId: c, reason: r }, 'Category changed')} />}
      {dlg === 'assign' && <AssignDlg team={team} onClose={() => setDlg(null)} onOk={(u: string) => act({ type: 'assign', userId: u }, 'Assigned')} />}
      {dlg === 'takeover' && <FieldsDlg title={`Request takeover from ${m.ownerName}`} fields={[{ k: 'reason', label: 'Why do you want to take it over?', area: true }]} cta="Send request" onClose={() => setDlg(null)} onOk={(v: any) => act({ type: 'takeover_request', ...v }, 'Request sent to the owner')} />}
      {dlg === 'delete' && <Confirm title="Delete this mail?" text="It moves to Deleted and can be restored by the Platform Owner for 30 days." cta="Delete" danger onClose={() => setDlg(null)} onOk={() => act({ type: 'delete' }, 'Moved to Deleted').then(onClose)} />}
      {dlg === 'reopen' && <Confirm title="Reopen this mail?" text={`It goes back to In progress with ${m.ownerName ?? 'its previous owner'}.`} cta="Reopen" onClose={() => setDlg(null)} onOk={() => act({ type: 'reopen' }, 'Reopened')} />}
      {dlg === 'block' && <Confirm title={`Block ${m.email}?`} text="Future mails from this sender are sorted to Spam automatically." cta="Block sender" danger onClose={() => setDlg(null)} onOk={() => act({ type: 'block' }, 'Sender blocked')} />}
      {dlg === 'conflict' && <Modal title="Someone was faster" onClose={() => setDlg(null)}><p>{info.owner} claimed this mail a moment ago. It now shows as theirs. You can request a takeover if you need it.</p></Modal>}
      {dlg === 'sendfail' && <Modal title="Reply was not sent" onClose={() => setDlg(null)} actions={<button className="btn p" onClick={() => { setDlg(null); send(); }}>Try again</button>}><p>Microsoft 365 did not accept the message. Nothing was sent and your text is kept.</p></Modal>}
      {dlg === 'expired' && <Modal title="Cannot restore" onClose={() => setDlg(null)}><p>The 30-day restore window has ended.</p></Modal>}
      {dlg === 'attach' && info.att && (
        <Modal title={info.att.name} onClose={() => setDlg(null)} actions={<a className="btn p" href={`/api/attachments/${id}/${info.att.id}?download=1`} onClick={async (e) => { e.preventDefault(); const r = await fetch(`/api/attachments/${id}/${info.att.id}?download=1`, { headers: { 'x-user-id': me.id } }); const b = await r.blob(); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = info.att.name + '.txt'; a.click(); toast('Download logged in the audit trail'); }}>Download</a>}>
          <div className="card" style={{ padding: 16, minHeight: 120 }}>Preview of {info.att.name} ({info.att.kind}, {kb(info.att.size)}).<br /><span className="mut">The prototype stores no real files. Defender scan: clean ✓. Downloads are logged.</span></div>
        </Modal>
      )}
    </Shell>
  );
}

function Shell({ children, onClose }: any) {
  return (<><div className="drawerbg" onClick={onClose} /><div className="drawer">{children}</div></>);
}
function Confirm({ title, text, cta, danger, onClose, onOk }: any) {
  return <Modal title={title} onClose={onClose} actions={<button className={`btn ${danger ? 'd' : 'p'}`} onClick={onOk}>{cta}</button>}><p>{text}</p></Modal>;
}
function ActedDlg({ onClose, onOk }: any) {
  const [o, setO] = useState(''); const [n, setN] = useState('');
  return (
    <Modal title="Mark as acted" onClose={onClose} actions={<button className="btn p" disabled={!o} onClick={() => onOk(o, n)}>Mark as acted</button>}>
      <label>Outcome</label>{OUTCOMES.map((x) => <div key={x}><label style={{ fontWeight: 400 }}><input type="radio" style={{ width: 'auto' }} checked={o === x} onChange={() => setO(x)} /> {x}</label></div>)}
      <label>Note (optional)</label><textarea value={n} onChange={(e) => setN(e.target.value)} />
    </Modal>
  );
}
function FieldsDlg({ title, fields, cta, onClose, onOk }: any) {
  const [v, setV] = useState<any>({});
  return (
    <Modal title={title} onClose={onClose} actions={<button className="btn p" onClick={() => onOk(v)}>{cta}</button>}>
      {fields.map((f: any) => <div key={f.k}><label>{f.label}</label>{f.area ? <textarea rows={4} onChange={(e) => setV({ ...v, [f.k]: e.target.value })} /> : <input onChange={(e) => setV({ ...v, [f.k]: e.target.value })} />}</div>)}
    </Modal>
  );
}
function CategoryDlg({ cats, cur, onClose, onOk }: any) {
  const [c, setC] = useState(cur); const [r, setR] = useState('');
  return (
    <Modal title="Change category" onClose={onClose} actions={<button className="btn p" disabled={!r.trim() || c === cur} onClick={() => onOk(c, r)}>Save</button>}>
      <label>New category</label><select value={c} onChange={(e) => setC(e.target.value)}>{cats.filter((x: any) => x.active).map((x: any) => <option key={x.id} value={x.id}>{x.name}</option>)}</select>
      <label>Reason (required, helps the AI improve)</label><textarea value={r} onChange={(e) => setR(e.target.value)} />
    </Modal>
  );
}
function AssignDlg({ team, onClose, onOk }: any) {
  const [u, setU] = useState('');
  return (
    <Modal title="Assign to" onClose={onClose} actions={<button className="btn p" disabled={!u} onClick={() => onOk(u)}>Assign</button>}>
      <label>Team member</label><select value={u} onChange={(e) => setU(e.target.value)}><option value="">Choose…</option>{team.map((x: any) => <option key={x.id} value={x.id}>{x.name}</option>)}</select>
    </Modal>
  );
}
