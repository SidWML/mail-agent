'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { api, ago, ageColor } from '@/lib/client';
import { Modal } from './Modal';
import Drawer from './Drawer';

const TABS: [string, string][] = [['active', 'Active'], ['mine', 'My items'], ['unassigned', 'Unassigned'], ['acted', 'Acted / Closed'], ['all', 'All'], ['deleted', 'Deleted']];
const OUT = ['Answered', 'Forwarded', 'No action needed', 'Duplicate', 'Spam'];

export default function Inbox({ me, cats, templates, team, toast }: any) {
  const [tab, setTab] = useState('active');
  const [f, setF] = useState<any>({ q: '', category: '', urgency: '', status: '', sentiment: '', assignee: '', dateDays: '', hasAttachment: '', needsReview: '', sort: 'newest' });
  const [page, setPage] = useState(1);
  const [data, setData] = useState<any>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [sel, setSel] = useState<string[]>([]);
  const [bulk, setBulk] = useState<null | 'acted' | 'assign' | 'recategorize' | 'delete'>(null);
  const [bv, setBv] = useState<any>({});

  const load = useCallback(async () => {
    const qs = new URLSearchParams({ tab, page: String(page), pageSize: '25' });
    Object.entries(f).forEach(([k, v]) => v && qs.set(k, String(v)));
    try { setData(await api('/mails?' + qs)); } catch (e: any) { setData({ error: e.message }); }
  }, [tab, f, page]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { const t = setInterval(load, 10000); return () => clearInterval(t); }, [load]);
  useEffect(() => { setSel([]); setPage(1); }, [tab, f]);
  const set = (k: string, v: string) => setF({ ...f, [k]: v });

  if (data?.error) return <div className="empty">{data.error}</div>;
  const rows = data?.items ?? [];
  const tabs = TABS.filter(([k]) => k !== 'deleted' || me.role === 'owner');
  const canBulk = me.role !== 'viewer';

  async function runBulk() {
    try {
      const r = await api('/mails/bulk', { body: { ids: sel, action: bulk, ...bv } });
      toast(`${r.done.length} done${r.failed.length ? `, ${r.failed.length} skipped (${r.failed[0].reason})` : ''}`, r.failed.length > 0 && !r.done.length);
      setBulk(null); setBv({}); setSel([]); load();
    } catch (e: any) { toast(e.message, true); }
  }

  return (
    <div>
      {data?.syncDown && <div className="banner">⚠ Mail sync is not working. The list may be out of date. The Platform Owner has been alerted.</div>}
      <div className="tabs">
        {tabs.map(([k, l]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}<span className="cnt">{data?.counts?.[k] ?? '…'}</span></button>)}
      </div>
      <div className="bar">
        <input placeholder="Search sender, subject, summary…" value={f.q} onChange={(e) => set('q', e.target.value)} style={{ width: 240 }} />
        <select value={f.category} onChange={(e) => set('category', e.target.value)}><option value="">Category</option>{cats.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
        <select value={f.urgency} onChange={(e) => set('urgency', e.target.value)}><option value="">Urgency</option><option>High</option><option>Medium</option><option>Low</option></select>
        <select value={f.status} onChange={(e) => set('status', e.target.value)}><option value="">Status</option><option>New</option><option>In progress</option><option>Waiting on sender</option><option>Acted</option></select>
        <select value={f.sentiment} onChange={(e) => set('sentiment', e.target.value)}><option value="">Sentiment</option><option>Positive</option><option>Neutral</option><option>Negative</option></select>
        <select value={f.assignee} onChange={(e) => set('assignee', e.target.value)}><option value="">Assignee</option><option value="me">Me</option><option value="unassigned">Unassigned</option>{team.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}</select>
        <select value={f.dateDays} onChange={(e) => set('dateDays', e.target.value)}><option value="">Any date</option><option value="1">Today</option><option value="7">7 days</option><option value="30">30 days</option></select>
        <label><input type="checkbox" checked={!!f.hasAttachment} onChange={(e) => set('hasAttachment', e.target.checked ? '1' : '')} /> Has attachment</label>
        <label><input type="checkbox" checked={!!f.needsReview} onChange={(e) => set('needsReview', e.target.checked ? '1' : '')} /> Needs review{data?.needsReviewCount ? ` (${data.needsReviewCount})` : ''}</label>
        <select value={f.sort} onChange={(e) => set('sort', e.target.value)}><option value="newest">Newest</option><option value="oldest">Oldest</option><option value="urgency">Urgency</option><option value="sla">SLA risk</option><option value="category">Category</option><option value="sender">Sender</option><option value="status">Status</option><option value="assignee">Assignee</option></select>
        <button className="btn" onClick={() => { setF({ q: '', category: '', urgency: '', status: '', sentiment: '', assignee: '', dateDays: '', hasAttachment: '', needsReview: '', sort: 'newest' }); }}>Clear</button>
      </div>

      {sel.length > 0 && canBulk && (
        <div className="bulk">{sel.length} selected (max 100)
          <button className="btn" onClick={() => setBulk('acted')}>Mark acted</button>
          {me.role === 'owner' && <button className="btn" onClick={() => setBulk('assign')}>Assign</button>}
          <button className="btn" onClick={() => setBulk('recategorize')}>Change category</button>
          {me.role === 'owner' && <button className="btn" onClick={() => setBulk('delete')}>Delete</button>}
          <button className="btn" onClick={() => setSel([])}>Clear</button></div>
      )}

      <div className="card" style={{ overflow: 'auto' }}>
        {!data ? <div className="empty">Loading…</div> : rows.length === 0 ? (
          <div className="empty">{tab === 'mine' ? 'You have no open mails. Claim one from Unassigned.' : tab === 'unassigned' ? 'Nothing waiting. Great.' : 'No mails match these filters.'}</div>
        ) : (
          <table>
            <thead><tr><th className="age" />{canBulk && <th style={{ width: 28 }}><input type="checkbox" checked={sel.length === rows.length} onChange={(e) => setSel(e.target.checked ? rows.map((r: any) => r.id).slice(0, 100) : [])} /></th>}<th>Sender / subject</th><th>AI summary</th><th>Category</th><th>Urgency</th><th>Status</th><th>Owner</th><th>Age</th><th>Att.</th></tr></thead>
            <tbody>{rows.map((r: any) => (
              <tr key={r.id} className={`row ${sel.includes(r.id) ? 'sel' : ''}`} onClick={() => setOpen(r.id)}>
                <td className="age" style={{ background: ageColor(r.ageHours) }} />
                {canBulk && <td onClick={(e) => e.stopPropagation()}><input type="checkbox" checked={sel.includes(r.id)} onChange={(e) => setSel(e.target.checked ? [...sel, r.id] : sel.filter((x) => x !== r.id))} /></td>}
                <td style={{ maxWidth: 280 }}><div className="sub">{r.subject}</div><div className="mut">{r.sender}</div></td>
                <td className="mut" style={{ maxWidth: 260 }}>{r.summary}</td>
                <td>{r.category}{r.needsReview && <> <span className="pill rev">review</span></>}</td>
                <td><span className={`pill u-${r.urgency}`}>{r.urgency}</span></td>
                <td><span className={`pill s-${r.status}`}>{r.status}</span>{r.openTakeover && <span title="Takeover requested"> 🔔</span>}{r.slaBreached && <span title="Past SLA"> ⏱</span>}</td>
                <td className="mut">{r.ownerName ?? '—'}{r.status === 'Deleted' && ` · ${r.daysLeftToRestore}d left`}</td>
                <td>{ago(r.ageHours)}</td><td>{r.attachmentCount ? `📎${r.attachmentCount}` : ''}</td>
              </tr>))}</tbody>
          </table>
        )}
        {data && data.total > 25 && <div className="pg"><span className="mut">{data.total} mails</span><button className="btn" disabled={page === 1} onClick={() => setPage(page - 1)}>‹</button>Page {page}<button className="btn" disabled={page * 25 >= data.total} onClick={() => setPage(page + 1)}>›</button></div>}
      </div>

      {open && <Drawer id={open} me={me} cats={cats} templates={templates} team={team} onClose={() => setOpen(null)} onChanged={load} toast={toast} />}

      {bulk && (
        <Modal title={`${bulk === 'acted' ? 'Mark acted' : bulk === 'assign' ? 'Assign' : bulk === 'delete' ? 'Delete' : 'Change category'} · ${sel.length} mails`} onClose={() => setBulk(null)} actions={<button className="btn p" onClick={runBulk}>Confirm</button>}>
          {bulk === 'acted' && <><label>Outcome</label><select onChange={(e) => setBv({ outcome: e.target.value })}><option value="">Choose…</option>{OUT.map((o) => <option key={o}>{o}</option>)}</select></>}
          {bulk === 'assign' && <><label>Team member</label><select onChange={(e) => setBv({ userId: e.target.value })}><option value="">Choose…</option>{team.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}</select></>}
          {bulk === 'recategorize' && <><label>Category</label><select onChange={(e) => setBv({ ...bv, categoryId: e.target.value })}><option value="">Choose…</option>{cats.filter((c: any) => c.active).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}</select><label>Reason</label><input onChange={(e) => setBv({ ...bv, reason: e.target.value })} /></>}
          {bulk === 'delete' && <p>They move to Deleted and can be restored for 30 days.</p>}
          <p className="mut">Mails you are not allowed to change are skipped and reported.</p>
        </Modal>
      )}
    </div>
  );
}
