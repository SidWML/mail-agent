'use client';
import React, { useEffect, useState } from 'react';
import { api } from '@/lib/client';
import { Bars, Donut, Gauge, HBars, Lines } from './charts';

export default function Dashboard({ cats, team }: { cats: any[]; team: any[] }) {
  const [d, setD] = useState<any>(null);
  const [days, setDays] = useState(30);
  const [category, setCategory] = useState('');
  const [assignee, setAssignee] = useState('');
  useEffect(() => {
    api(`/dashboard?days=${days}&category=${category}&assignee=${assignee}`).then(setD);
  }, [days, category, assignee]);
  if (!d) return <div className="empty">Loading…</div>;
  const t = d.tiles;
  const delta = t.received.prev ? Math.round(((t.received.range - t.received.prev) / t.received.prev) * 100) : null;
  return (
    <div>
      <div className="bar">
        <select value={days} onChange={(e) => setDays(+e.target.value)}><option value={7}>Last 7 days</option><option value={30}>Last 30 days</option><option value={90}>Last 90 days</option></select>
        <select value={category} onChange={(e) => setCategory(e.target.value)}><option value="">All categories</option>{cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
        <select value={assignee} onChange={(e) => setAssignee(e.target.value)}><option value="">Everyone</option>{team.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</select>
      </div>
      <div className="card" style={{ padding: '10px 14px', marginBottom: 12 }}>💬 {d.narrative}</div>
      <div className="grid g4" style={{ marginBottom: 12 }}>
        <div className="card tile"><div className="n">{t.received.range}</div><div className="l">Received · today {t.received.today} · week {t.received.week}{delta !== null ? ` · ${delta >= 0 ? '▲' : '▼'}${Math.abs(delta)}%` : ''}</div></div>
        <div className="card tile"><div className="n">{t.open.total}</div><div className="l">Open · New {t.open.new} · In progress {t.open.inProgress} · Waiting {t.open.waiting}</div></div>
        <div className="card tile"><div className="n">{t.acted}</div><div className="l">Acted in range</div></div>
        <div className="card tile"><div className="n" style={{ color: t.unassigned ? '#d3202a' : undefined }}>{t.unassigned}</div><div className="l">Unassigned open mails</div></div>
      </div>
      <div className="grid g2" style={{ marginBottom: 12 }}>
        <div className="card ch"><h4>Volume · last 14 days</h4><Lines labels={d.volume.map((v: any) => v.day)} series={[{ name: 'Received', values: d.volume.map((v: any) => v.received) }, { name: 'Acted', values: d.volume.map((v: any) => v.acted), color: '#2e9e5b' }]} /></div>
        <div className="card ch"><h4>By category</h4><Donut data={d.byCategory.length > 6 ? [...d.byCategory.slice(0, 6), { name: 'Other', value: d.byCategory.slice(6).reduce((a: number, x: any) => a + x.value, 0), color: '#9aa3b2' }] : d.byCategory} /></div>
      </div>
      <div className="grid g3" style={{ marginBottom: 12 }}>
        <div className="card ch"><h4>Backlog by age</h4><Bars data={d.backlog} /></div>
        <div className="card ch"><h4>SLA compliance</h4><Gauge pct={d.sla.compliancePct} label={`${d.sla.breachCount} mail(s) past SLA now`} />{d.sla.breaches.map((b: any) => <div key={b.id} className="mut" style={{ marginTop: 4 }}>⚠ {b.subject} (+{b.overByH}h)</div>)}</div>
        <div className="card ch"><h4>Response time (hours)</h4><div className="kv"><span>First response · median</span><b>{d.response.firstMedian}</b></div><div className="kv"><span>First response · p90</span><b>{d.response.firstP90}</b></div><div className="kv"><span>Time to acted · median</span><b>{d.response.ttaMedian}</b></div><div className="kv"><span>Time to acted · p90</span><b>{d.response.ttaP90}</b></div></div>
      </div>
      <div className="grid g3" style={{ marginBottom: 12 }}>
        <div className="card ch"><h4>Urgency (open)</h4><Donut size={110} data={d.urgency.map((u: any) => ({ ...u, color: u.name === 'High' ? '#d3202a' : u.name === 'Medium' ? '#e0a100' : '#9aa3b2' }))} /></div>
        <div className="card ch"><h4>Sentiment (open)</h4><Donut size={110} data={d.sentiment.map((u: any) => ({ ...u, color: u.name === 'Negative' ? '#d3202a' : u.name === 'Positive' ? '#2e9e5b' : '#9aa3b2' }))} /></div>
        <div className="card ch"><h4>Workload per person</h4><HBars data={d.workload.map((w: any) => ({ name: w.name, value: w.claimed }))} /></div>
      </div>
      <div className="grid g3" style={{ marginBottom: 12 }}>
        <div className="card ch"><h4>Top senders</h4><HBars data={d.topSenders} /></div>
        <div className="card ch"><h4>Business units</h4><HBars data={d.topBusinessUnits} color="#8a5ac8" /></div>
        <div className="card ch"><h4>Countries</h4><HBars data={d.topCountries} color="#0f9bb0" /></div>
      </div>
      <div className="grid g3">
        <div className="card ch"><h4>Trending topics</h4>{d.topics.map((x: any) => <div key={x.name} className="kv"><span style={{ color: '#1c2330' }}>{x.name}</span><span>{x.value} {x.change !== null && <b style={{ color: x.change >= 0 ? '#d3202a' : '#2e9e5b' }}>{x.change >= 0 ? '▲' : '▼'}{Math.abs(x.change)}%</b>}</span></div>)}</div>
        <div className="card ch"><h4>AI quality</h4><div className="kv"><span>Sorted without help</span><b>{d.ai.autoSortedPct}%</b></div><div className="kv"><span>Overridden by people</span><b>{d.ai.overriddenPct}%</b></div><div className="kv"><span>Needs review</span><b>{d.ai.needsReviewPct}%</b></div><HBars data={d.ai.accuracyByCategory} color="#2e9e5b" suffix="%" /></div>
        <div className="card ch"><h4>First response by category (median h)</h4><HBars data={d.response.byCategory.map((x: any) => ({ name: x.name, value: x.median }))} color="#e8742a" /></div>
      </div>
    </div>
  );
}
