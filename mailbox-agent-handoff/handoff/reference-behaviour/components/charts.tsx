'use client';
import React from 'react';
const PAL = ['#1b57b5', '#e8742a', '#2e9e5b', '#8a5ac8', '#d3202a', '#0f9bb0', '#9aa3b2'];

export function Bars({ data, h = 150 }: { data: { name: string; value: number }[]; h?: number }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <svg viewBox={`0 0 ${data.length * 60} ${h}`} width="100%" height={h}>
      {data.map((d, i) => {
        const bh = (d.value / max) * (h - 40);
        return (
          <g key={i}>
            <title>{`${d.name}: ${d.value}`}</title>
            <rect x={i * 60 + 12} y={h - 22 - bh} width={36} height={bh} rx={4} fill={PAL[0]} />
            <text x={i * 60 + 30} y={h - 26 - bh} fontSize={11} textAnchor="middle" fill="#1c2330">{d.value}</text>
            <text x={i * 60 + 30} y={h - 6} fontSize={10} textAnchor="middle" fill="#6b7686">{d.name.length > 9 ? d.name.slice(0, 8) + '…' : d.name}</text>
          </g>
        );
      })}
    </svg>
  );
}
export function HBars({ data, color = PAL[0], suffix = '' }: { data: { name: string; value: number }[]; color?: string; suffix?: string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div>
      {data.map((d) => (
        <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0' }} title={`${d.name}: ${d.value}${suffix}`}>
          <div style={{ width: 120, fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</div>
          <div style={{ flex: 1, background: '#eef0f4', borderRadius: 4, height: 12 }}><div style={{ width: `${(d.value / max) * 100}%`, background: color, height: 12, borderRadius: 4 }} /></div>
          <div style={{ width: 44, textAlign: 'right', fontSize: 12 }}>{d.value}{suffix}</div>
        </div>
      ))}
    </div>
  );
}
export function Lines({ labels, series, h = 160 }: { labels: string[]; series: { name: string; values: number[]; color?: string }[]; h?: number }) {
  const W = 520, pad = 24;
  const max = Math.max(1, ...series.flatMap((s) => s.values));
  const x = (i: number) => pad + (i * (W - pad * 2)) / Math.max(1, labels.length - 1);
  const y = (v: number) => h - 22 - (v / max) * (h - 40);
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${h}`} width="100%" height={h}>
        {[0, 0.5, 1].map((t) => <line key={t} x1={pad} x2={W - pad} y1={y(max * t)} y2={y(max * t)} stroke="#eceef3" />)}
        {series.map((s, si) => (
          <g key={s.name}>
            <polyline fill="none" stroke={s.color || PAL[si]} strokeWidth={2} points={s.values.map((v, i) => `${x(i)},${y(v)}`).join(' ')} />
            {s.values.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r={3} fill={s.color || PAL[si]} stroke="#fff" strokeWidth={1.5}><title>{`${s.name} · ${labels[i]}: ${v}`}</title></circle>)}
          </g>
        ))}
        {labels.map((l, i) => (i % 2 === 0 ? <text key={i} x={x(i)} y={h - 6} fontSize={10} textAnchor="middle" fill="#6b7686">{l}</text> : null))}
      </svg>
      <Legend items={series.map((s, i) => ({ name: s.name, color: s.color || PAL[i] }))} />
    </div>
  );
}
export function Donut({ data, size = 140 }: { data: { name: string; value: number; color?: string }[]; size?: number }) {
  const total = data.reduce((a, d) => a + d.value, 0) || 1;
  const r = size / 2 - 14, c = 2 * Math.PI * r;
  let off = 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <svg width={size} height={size}>
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          {data.map((d, i) => {
            const len = (d.value / total) * c;
            const el = <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={d.color || PAL[i % PAL.length]} strokeWidth={22} strokeDasharray={`${Math.max(0, len - 2)} ${c}`} strokeDashoffset={-off}><title>{`${d.name}: ${d.value}`}</title></circle>;
            off += len;
            return el;
          })}
        </g>
        <text x={size / 2} y={size / 2 + 5} textAnchor="middle" fontSize={20} fontWeight={700}>{total}</text>
      </svg>
      <Legend items={data.map((d, i) => ({ name: `${d.name} (${d.value})`, color: d.color || PAL[i % PAL.length] }))} col />
    </div>
  );
}
export function Gauge({ pct, label }: { pct: number; label: string }) {
  const color = pct >= 90 ? '#2e9e5b' : pct >= 70 ? '#e0a100' : '#d3202a';
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 34, fontWeight: 700, color }}>{pct}%</div>
      <div style={{ background: '#eef0f4', borderRadius: 6, height: 10, margin: '6px 0' }}><div style={{ width: `${pct}%`, height: 10, borderRadius: 6, background: color }} /></div>
      <div className="mut">{label}</div>
    </div>
  );
}
function Legend({ items, col }: { items: { name: string; color: string }[]; col?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: col ? 'column' : 'row', gap: col ? 3 : 12, flexWrap: 'wrap', fontSize: 12 }}>
      {items.map((i) => <span key={i.name}><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: i.color, marginRight: 5 }} />{i.name}</span>)}
    </div>
  );
}
