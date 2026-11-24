'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { api, when } from '@/lib/client';
import { Modal } from './Modal';

export function Categories({ me, toast, reload }: any) {
  const [list, setList] = useState<any[]>([]);
  const [edit, setEdit] = useState<any>(null);
  const [merge, setMerge] = useState<string[]>([]);
  const [mergeTo, setMergeTo] = useState('');
  const [re, setRe] = useState(true);
  const load = useCallback(() => api('/categories').then((r) => setList(r.categories)), []);
  useEffect(() => { load(); }, [load]);
  const owner = me.role === 'owner';
  async function save() {
    try {
      if (edit.id) await api(`/categories/${edit.id}`, { method: 'PUT', body: edit }); else await api('/categories', { body: edit });
      toast('Saved'); setEdit(null); load(); reload();
    } catch (e: any) { toast(e.message, true); }
  }
  async function retire(c: any) {
    try { const r = await api(`/categories/${c.id}?recategorize=1`, { method: 'DELETE' }); toast(`Retired. ${r.moved} mail(s) moved to Needs review.`); load(); reload(); } catch (e: any) { toast(e.message, true); }
  }
  async function doMerge() {
    try { const r = await api('/categories/merge', { body: { sourceIds: merge, targetId: mergeTo, recategorize: re } }); toast(`Merged. ${r.moved} mail(s) moved.`); setMerge([]); setMergeTo(''); load(); reload(); } catch (e: any) { toast(e.message, true); }
  }
  return (
    <div>
      <div className="bar"><h3 style={{ margin: 0, flex: 1 }}>Categories</h3>{owner && <button className="btn p" onClick={() => setEdit({ name: '', typical: '', slaHours: 24 })}>+ Add category</button>}{owner && merge.length > 0 && <><select value={mergeTo} onChange={(e) => setMergeTo(e.target.value)}><option value="">Merge {merge.length} into…</option>{list.filter((c) => c.active && !merge.includes(c.id)).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select><label><input type="checkbox" checked={re} onChange={(e) => setRe(e.target.checked)} /> move existing mails</label><button className="btn p" disabled={!mergeTo} onClick={doMerge}>Merge</button></>}</div>
      <div className="card"><table><thead><tr>{owner && <th />}<th>Name</th><th>Typical mails</th><th>SLA (h)</th><th>Mails</th><th>State</th>{owner && <th />}</tr></thead>
        <tbody>{list.map((c) => <tr key={c.id}>{owner && <td><input type="checkbox" disabled={c.system || !c.active} checked={merge.includes(c.id)} onChange={(e) => setMerge(e.target.checked ? [...merge, c.id] : merge.filter((x) => x !== c.id))} /></td>}<td className="sub">{c.name}</td><td className="mut">{c.typical}</td><td>{c.slaHours}</td><td>{c.mailCount}</td><td>{c.active ? 'Active' : 'Retired'}</td>{owner && <td><button className="btn" onClick={() => setEdit(c)}>Edit</button> {!c.system && c.active && <button className="btn d" onClick={() => retire(c)}>Retire</button>}</td>}</tr>)}</tbody></table></div>
      {edit && <Modal title={edit.id ? 'Edit category' : 'Add category'} onClose={() => setEdit(null)} actions={<button className="btn p" onClick={save}>Save</button>}>
        <label>Name</label><input value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} />
        <label>What kind of mails belong here</label><textarea value={edit.typical} onChange={(e) => setEdit({ ...edit, typical: e.target.value })} />
        <label>SLA: reply within (hours)</label><input type="number" value={edit.slaHours} onChange={(e) => setEdit({ ...edit, slaHours: +e.target.value })} />
      </Modal>}
    </div>
  );
}

export function Templates({ me, cats, toast, reload }: any) {
  const [list, setList] = useState<any[]>([]);
  const [edit, setEdit] = useState<any>(null);
  const load = useCallback(() => api('/templates').then((r) => setList(r.templates)), []);
  useEffect(() => { load(); }, [load]);
  const owner = me.role === 'owner';
  async function save() { try { if (edit.id) await api(`/templates/${edit.id}`, { method: 'PUT', body: edit }); else await api('/templates', { body: edit }); toast('Saved'); setEdit(null); load(); reload(); } catch (e: any) { toast(e.message, true); } }
  async function del(t: any) { await api(`/templates/${t.id}`, { method: 'DELETE' }); toast('Deleted'); load(); reload(); }
  return (
    <div>
      <div className="bar"><h3 style={{ margin: 0, flex: 1 }}>Reply templates</h3>{owner && <button className="btn p" onClick={() => setEdit({ name: '', categoryId: '', body: 'Hello ‹sender name›,\n\n' })}>+ Add template</button>}</div>
      <div className="grid g2">{list.map((t) => <div key={t.id} className="card" style={{ padding: 12 }}><b>{t.name}</b> <span className="mut">· {cats.find((c: any) => c.id === t.categoryId)?.name ?? 'Any category'}</span><pre style={{ whiteSpace: 'pre-wrap', font: 'inherit', color: '#445' }}>{t.body}</pre>{owner && <><button className="btn" onClick={() => setEdit(t)}>Edit</button> <button className="btn d" onClick={() => del(t)}>Delete</button></>}</div>)}</div>
      {edit && <Modal title={edit.id ? 'Edit template' : 'Add template'} onClose={() => setEdit(null)} actions={<button className="btn p" onClick={save}>Save</button>}>
        <label>Name</label><input value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} />
        <label>Suggested for category</label><select value={edit.categoryId || ''} onChange={(e) => setEdit({ ...edit, categoryId: e.target.value })}><option value="">Any</option>{cats.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
        <label>Reply text (use ‹sender name› and ‹category›)</label><textarea rows={7} value={edit.body} onChange={(e) => setEdit({ ...edit, body: e.target.value })} />
      </Modal>}
    </div>
  );
}

export function Audit({ team, me }: any) {
  const [d, setD] = useState<any>(null);
  const [f, setF] = useState({ user: '', action: '', q: '' });
  useEffect(() => { api(`/audit?user=${f.user}&action=${f.action}&q=${encodeURIComponent(f.q)}`).then(setD).catch((e) => setD({ error: e.message })); }, [f]);
  if (d?.error) return <div className="empty">{d.error}</div>;
  if (!d) return <div className="empty">Loading…</div>;
  async function csv() { const r = await fetch(`/api/audit?format=csv`, { headers: { 'x-user-id': me.id } }); const b = await r.blob(); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'audit.csv'; a.click(); }
  return (
    <div>
      <div className="bar"><h3 style={{ margin: 0, flex: 1 }}>Audit trail <span className="mut">· kept 1 year · {d.total} entries</span></h3>
        <input placeholder="Search" value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} />
        <select value={f.user} onChange={(e) => setF({ ...f, user: e.target.value })}><option value="">Everyone</option>{team.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}</select>
        <select value={f.action} onChange={(e) => setF({ ...f, action: e.target.value })}><option value="">All actions</option>{d.actions.map((a: string) => <option key={a}>{a}</option>)}</select>
        <button className="btn" onClick={csv}>Export CSV</button></div>
      <div className="card"><table><thead><tr><th>When</th><th>Who</th><th>Action</th><th>Mail</th><th>Change</th></tr></thead>
        <tbody>{d.entries.map((r: any) => <tr key={r.id}><td>{when(r.at)}</td><td>{r.userName}</td><td><b>{r.action}</b></td><td className="mut">{r.subject}</td><td className="mut">{r.before && `${r.before} → `}{r.after}{r.detail && ` · ${r.detail}`}</td></tr>)}</tbody></table></div>
    </div>
  );
}

export function Alerts() {
  const [a, setA] = useState<any[]>([]);
  useEffect(() => { const l = () => api('/alerts').then((r) => setA(r.alerts)); l(); const t = setInterval(l, 5000); return () => clearInterval(t); }, []);
  const icon: any = { high_urgency: '🔴', sla_breach: '⏱', digest: '📰', sync: '⚠' };
  return (
    <div><h3 style={{ marginTop: 0 }}>Alerts outbox <span className="mut">· what the system would post to the team channel or email to the Owner</span></h3>
      {a.length === 0 ? <div className="empty">No alerts yet. Use the Scenario lab to trigger some.</div> : a.map((x) => <div key={x.id} className="card" style={{ padding: '10px 14px', marginBottom: 8 }}>{icon[x.kind]} <b>{x.title}</b> <span className="pill" style={{ background: '#e8ebf0' }}>{x.channel}</span> <span className="mut">{when(x.at)}</span><pre style={{ whiteSpace: 'pre-wrap', font: 'inherit', margin: '4px 0 0', color: '#445' }}>{x.body}</pre></div>)}
    </div>
  );
}

export function Lab({ toast, refresh }: any) {
  const [st, setSt] = useState<any>(null);
  const sim = useCallback(async (b: any) => {
    const r = await fetch('/api/sim', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(b) });
    const j = await r.json();
    if (!r.ok) toast(j.error?.message || 'Failed', true); else if (j.message) toast(j.message);
    const s = await (await fetch('/api/sim', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ type: 'state' }) })).json();
    setSt(s); refresh();
  }, [toast, refresh]);
  useEffect(() => { sim({ type: 'state' }); }, []); // eslint-disable-line
  const G = ({ title, children }: any) => <div className="card" style={{ padding: 12 }}><h4 style={{ margin: '0 0 8px' }}>{title}</h4>{children}</div>;
  return (
    <div className="lab">
      <p className="mut" style={{ marginTop: 0 }}>Each button plays one situation from the requirements. Switch persona at the top to see how the same situation looks for each role.</p>
      <div className="grid g3">
        <G title="Mails arriving (AI sorts them)">
          <button className="btn" onClick={() => sim({ type: 'new_mail' })}>New mail (random)</button>
          <button className="btn" onClick={() => sim({ type: 'new_mail', high: true })}>High-urgency mail → team alert</button>
          <button className="btn" onClick={() => sim({ type: 'new_mail', lowConfidence: true })}>Low-confidence mail → Needs review</button>
          <button className="btn" onClick={() => sim({ type: 'new_mail', spam: true })}>Spam mail</button>
          <button className="btn" onClick={() => sim({ type: 'new_mail', fromBlocked: true })}>Mail from a blocked sender</button>
        </G>
        <G title="Other people acting">
          <button className="btn" onClick={() => sim({ type: 'sender_reply' })}>Sender replies (Waiting/Acted → In progress)</button>
          <button className="btn" onClick={() => sim({ type: 'claim_by_other' })}>Anika claims the first unassigned mail</button>
          <button className="btn" onClick={() => sim({ type: 'presence' })}>Markus starts replying to a mail</button>
          <p className="mut">Tip: open an unassigned mail, press “Anika claims…” in another tab, then click Claim to see the conflict.</p>
        </G>
        <G title="Time & alerts">
          <button className="btn" onClick={() => sim({ type: 'advance', hours: 6 })}>Advance 6 hours</button>
          <button className="btn" onClick={() => sim({ type: 'advance', hours: 30 })}>Advance 30 hours (SLA breaches + digest)</button>
          <button className="btn" onClick={() => sim({ type: 'advance', hours: 24 * 31 })}>Advance 31 days (restore window ends)</button>
          <button className="btn" onClick={() => sim({ type: 'digest' })}>Send daily digest</button>
          <div className="mut">Clock offset: {st?.offsetHours ?? 0} h</div>
        </G>
        <G title="Failures">
          <label><input type="checkbox" checked={!!st?.flags?.syncDown} onChange={(e) => sim({ type: 'flags', flags: { syncDown: e.target.checked } })} /> Mail sync is down</label><br />
          <label><input type="checkbox" checked={!!st?.flags?.sendFails} onChange={(e) => sim({ type: 'flags', flags: { sendFails: e.target.checked } })} /> Sending replies fails</label><br />
          <label><input type="checkbox" checked={!!st?.flags?.latency} onChange={(e) => sim({ type: 'flags', flags: { latency: e.target.checked } })} /> Simulate network delay</label>
        </G>
        <G title="Reset"><button className="btn d" onClick={() => sim({ type: 'reset' })}>Reset all data</button></G>
      </div>
    </div>
  );
}
