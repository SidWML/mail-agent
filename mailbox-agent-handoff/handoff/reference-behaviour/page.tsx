'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { api, setUid } from '@/lib/client';
import Inbox from '@/components/Inbox';
import Dashboard from '@/components/Dashboard';
import { Alerts, Audit, Categories, Lab, Templates } from '@/components/Admin';

export default function Page() {
  const [users, setUsers] = useState<any[]>([]);
  const [uid, setU] = useState('u-ravi');
  const [view, setView] = useState('inbox');
  const [cats, setCats] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [denied, setDenied] = useState(false);
  const [toasts, setToasts] = useState<{ id: number; text: string; err?: boolean }[]>([]);
  const [tick, setTick] = useState(0);

  const toast = useCallback((text: string, err?: boolean) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text, err }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4500);
  }, []);
  useEffect(() => { api('/me').then((r) => setUsers(r.users)); const s = localStorage.getItem('uid'); if (s) { setU(s); setUid(s); } }, []);
  const loadRefs = useCallback(async () => {
    try { setDenied(false); setCats((await api('/categories')).categories); setTemplates((await api('/templates')).templates); }
    catch (e: any) { if (e.code === 'NO_MAILBOX_ACCESS') setDenied(true); else if (e.status === 403) setTemplates([]); }
  }, []);
  useEffect(() => { setUid(uid); localStorage.setItem('uid', uid); setView('inbox'); loadRefs(); setTick((t) => t + 1); }, [uid, loadRefs]);

  const me = users.find((u) => u.id === uid);
  const staff = users.filter((u) => u.role === 'owner' || u.role === 'agent');
  const nav: [string, string, boolean][] = [
    ['inbox', 'Inbox', true], ['dashboard', 'Dashboard', true], ['alerts', 'Alerts', me?.role !== 'viewer'],
    ['categories', 'Categories', true], ['templates', 'Templates', me?.role !== 'viewer'], ['audit', 'Audit', me?.role === 'owner'], ['lab', 'Scenario lab', true],
  ];
  return (
    <div>
      <div className="top">
        <div className="logo"><b>▌</b>AI@Schindler <span style={{ fontWeight: 400, color: '#b9c0cc' }}>Mailbox Agent · prototype</span></div>
        <div className="nav">{!denied && nav.filter((n) => n[2]).map(([k, l]) => <button key={k} className={view === k ? 'on' : ''} onClick={() => setView(k)}>{l}</button>)}</div>
        <select className="persona" value={uid} onChange={(e) => setU(e.target.value)}>
          {users.map((u) => <option key={u.id} value={u.id}>{u.name} · {u.role === 'owner' ? 'Platform Owner' : u.role === 'agent' ? 'Support team member' : u.role === 'viewer' ? 'Viewer' : 'No access'}</option>)}
        </select>
      </div>
      <div className="wrap">
        {denied || me?.role === 'none' ? (
          <div className="card empty"><h2>You do not have access to this mailbox</h2><p>Ask your manager to add you to one of the AI Mailbox groups (Owner, Access or Viewer).</p></div>
        ) : !me ? <div className="empty">Loading…</div> : (
          <>
            {me.role === 'viewer' && view === 'inbox' && <div className="banner warn">You have read-only access. Actions are switched off.</div>}
            {view === 'inbox' && <Inbox key={uid + tick} me={me} cats={cats} templates={templates} team={staff} toast={toast} />}
            {view === 'dashboard' && <Dashboard key={uid + tick} cats={cats} team={staff} />}
            {view === 'alerts' && <Alerts />}
            {view === 'categories' && <Categories me={me} toast={toast} reload={loadRefs} />}
            {view === 'templates' && <Templates me={me} cats={cats} toast={toast} reload={loadRefs} />}
            {view === 'audit' && <Audit me={me} team={users.filter((u) => u.role !== 'none')} />}
            {view === 'lab' && <Lab toast={toast} refresh={() => setTick((t) => t + 1)} />}
          </>
        )}
      </div>
      <div className="toasts">{toasts.map((t) => <div key={t.id} className={`toast ${t.err ? 'err' : ''}`}>{t.text}</div>)}</div>
    </div>
  );
}
