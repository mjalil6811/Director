'use client';

import {
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList, Cell,
  LineChart, Line, ReferenceLine, PieChart, Pie,
} from 'recharts';
import type { TooltipContentProps } from 'recharts';
import type { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent';

// ——— Tokens ————————————————————————————————————————————————————————————————
// Paleta categórica validada (slots 1–3) + marca. El color sigue a la entidad:
// "Ventas" siempre azul, "EBITDA" siempre naranja, "Tu empresa" siempre violeta.
export const VIZ = {
  brand: '#534AB7',
  reference: '#9CA3AF',
  s1: '#2a78d6',
  s2: '#eb6834',
  s3: '#1baf7a',
  grid: '#EEF0F3',
  axis: '#9CA3AF',
  text: '#111827',
  textMuted: '#6B7280',
  good: '#0F6E56',
  warn: '#B7791F',
  bad: '#B42318',
};

const axisTick = { fontSize: 11, fill: VIZ.axis };

function TooltipBox({ title, rows }: { title?: string; rows: { label: string; value: string; color?: string }[] }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-3 py-2 text-xs min-w-[140px]">
      {title && <p className="font-semibold text-gray-900 mb-1">{title}</p>}
      {rows.map(r => (
        <div key={r.label} className="flex items-center justify-between gap-4 py-0.5">
          <span className="flex items-center gap-1.5 text-gray-500">
            {r.color && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: r.color }} />}
            {r.label}
          </span>
          <span className="font-semibold text-gray-900 tabular-nums">{r.value}</span>
        </div>
      ))}
    </div>
  );
}

type TProps = TooltipContentProps<ValueType, NameType>;

// ——— Gauge semicircular ————————————————————————————————————————————————————

export function ScoreGauge({ value, color, thresholds = [35, 55, 75] }: { value: number; color: string; thresholds?: number[] }) {
  const r = 90, cx = 110, cy = 105, sw = 16;
  const arc = Math.PI * r;
  const v = Math.max(0, Math.min(100, value));
  const pt = (pct: number, rad: number) => {
    const a = Math.PI * (1 - pct / 100);
    return { x: cx + rad * Math.cos(a), y: cy - rad * Math.sin(a) };
  };
  const path = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;
  return (
    <svg viewBox="0 0 220 125" className="w-full max-w-[280px] mx-auto" role="img" aria-label={`Puntaje ${v} de 100`}>
      <path d={path} fill="none" stroke="#E5E7EB" strokeWidth={sw} strokeLinecap="round" />
      <path
        d={path} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round"
        strokeDasharray={`${(v / 100) * arc} ${arc}`}
        style={{ transition: 'stroke-dasharray 900ms ease-out' }}
      />
      {thresholds.map(t => {
        const a = pt(t, r - sw / 2 - 3), b = pt(t, r + sw / 2 + 3);
        return <line key={t} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="white" strokeWidth={2} />;
      })}
      <text x={cx} y={cy - 18} textAnchor="middle" fontSize="44" fontWeight="700" fill={color} className="tabular-nums">{v}</text>
      <text x={cx} y={cy + 2} textAnchor="middle" fontSize="11" fill={VIZ.textMuted}>de 100</text>
      <text x={cx - r} y={cy + 18} textAnchor="middle" fontSize="10" fill={VIZ.axis}>0</text>
      <text x={cx + r} y={cy + 18} textAnchor="middle" fontSize="10" fill={VIZ.axis}>100</text>
    </svg>
  );
}

// ——— Radar: tu empresa vs referencia —————————————————————————————————————————

export function GovernanceRadar({ data, referencia, referenciaLabel }: {
  data: { label: string; score: number }[];
  referencia: number;
  referenciaLabel: string;
}) {
  const rows = data.map(d => ({ dim: d.label, empresa: d.score, ref: referencia }));
  return (
    <div className="w-full h-[340px]">
      <ResponsiveContainer>
        <RadarChart data={rows} outerRadius="78%" margin={{ top: 8, right: 24, bottom: 8, left: 24 }}>
          <PolarGrid stroke={VIZ.grid} />
          <PolarAngleAxis dataKey="dim" tick={{ fontSize: 11, fill: VIZ.textMuted }} />
          <PolarRadiusAxis domain={[0, 100]} tickCount={5} tick={false} axisLine={false} />
          <Radar name={referenciaLabel} dataKey="ref" stroke={VIZ.reference} strokeDasharray="4 4" strokeWidth={1.5} fill="none" isAnimationActive={false} />
          <Radar name="Tu empresa" dataKey="empresa" stroke={VIZ.brand} strokeWidth={2} fill={VIZ.brand} fillOpacity={0.14}
            dot={{ r: 4, fill: VIZ.brand, stroke: 'white', strokeWidth: 2 }} />
          <Tooltip content={({ active, payload }: TProps) => active && payload?.length ? (
            <TooltipBox
              title={String(payload[0]?.payload?.dim ?? '')}
              rows={payload.map(p => ({ label: String(p.name), value: `${p.value}/100`, color: String(p.stroke ?? p.color ?? '') }))}
            />
          ) : null} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} formatter={(v: string) => <span style={{ color: VIZ.textMuted }}>{v}</span>} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ——— Barras horizontales con un elemento destacado ——————————————————————————

export function RankedBars({ items, highlightKey, unit = '', max = 100 }: {
  items: { key: string; label: string; value: number }[];
  highlightKey?: string;
  unit?: string;
  max?: number;
}) {
  const sorted = [...items].sort((a, b) => b.value - a.value);
  return (
    <div className="w-full" style={{ height: sorted.length * 44 + 16 }}>
      <ResponsiveContainer>
        <BarChart data={sorted} layout="vertical" margin={{ top: 4, right: 40, bottom: 4, left: 0 }} barCategoryGap={10}>
          <XAxis type="number" domain={[0, max]} hide />
          <YAxis type="category" dataKey="label" width={170} tick={{ fontSize: 12, fill: VIZ.textMuted }} axisLine={false} tickLine={false} />
          <Tooltip cursor={{ fill: '#F9FAFB' }} content={({ active, payload }: TProps) => active && payload?.length ? (
            <TooltipBox rows={[{ label: String(payload[0]?.payload?.label), value: `${payload[0]?.value}${unit}` }]} />
          ) : null} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={20}>
            {sorted.map(d => <Cell key={d.key} fill={d.key === highlightKey ? VIZ.brand : '#D1D5DB'} />)}
            <LabelList dataKey="value" position="right" formatter={(v: unknown) => `${v}${unit}`} style={{ fontSize: 12, fontWeight: 600, fill: VIZ.text }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ——— Sparkline para KPI tiles ———————————————————————————————————————————————

export function Sparkline({ values, color = VIZ.brand }: { values: number[]; color?: string }) {
  if (values.length < 2) return null;
  const data = values.map((v, i) => ({ i, v }));
  return (
    <div className="h-8 w-full" aria-hidden>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 4, right: 2, bottom: 2, left: 2 }}>
          <YAxis hide domain={['dataMin', 'dataMax']} />
          <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ——— Serie temporal multi-línea (misma unidad, un solo eje) ——————————————————

export function TrendChart({ data, series, format, reference }: {
  data: Record<string, string | number>[];
  series: { key: string; label: string; color: string }[];
  format: (n: number) => string;
  reference?: { value: number; label: string };
}) {
  return (
    <div className="w-full h-[240px]">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid stroke={VIZ.grid} vertical={false} />
          <XAxis dataKey="periodo" tick={axisTick} axisLine={{ stroke: '#E5E7EB' }} tickLine={false} />
          <YAxis tick={axisTick} axisLine={false} tickLine={false} width={56} tickFormatter={(v: number) => format(v)} />
          {reference && (
            <ReferenceLine y={reference.value} stroke={VIZ.reference} strokeDasharray="4 4"
              label={{ value: reference.label, position: 'insideTopRight', fontSize: 10, fill: VIZ.textMuted }} />
          )}
          <Tooltip
            cursor={{ stroke: '#D1D5DB', strokeWidth: 1 }}
            content={({ active, payload, label }: TProps) => active && payload?.length ? (
              <TooltipBox title={String(label)} rows={payload.map(p => ({ label: String(p.name), value: format(Number(p.value)), color: String(p.stroke ?? p.color ?? '') }))} />
            ) : null}
          />
          {series.length > 1 && <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} formatter={(v: string) => <span style={{ color: VIZ.textMuted }}>{v}</span>} />}
          {series.map(s => (
            <Line key={s.key} type="monotone" dataKey={s.key} name={s.label} stroke={s.color} strokeWidth={2}
              dot={{ r: 3, fill: s.color, stroke: 'white', strokeWidth: 1.5 }} activeDot={{ r: 5, stroke: 'white', strokeWidth: 2 }} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ——— Dona de estados ————————————————————————————————————————————————————————

export function StatusDonut({ items, centerLabel }: {
  items: { key: string; label: string; value: number; color: string }[];
  centerLabel: string;
}) {
  const total = items.reduce((s, i) => s + i.value, 0);
  const data = items.filter(i => i.value > 0);
  return (
    <div className="flex items-center gap-5">
      <div className="relative w-[132px] h-[132px] shrink-0">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="label" innerRadius={44} outerRadius={64} paddingAngle={data.length > 1 ? 2 : 0} stroke="white" strokeWidth={2} isAnimationActive={false}>
              {data.map(d => <Cell key={d.key} fill={d.color} />)}
            </Pie>
            <Tooltip content={({ active, payload }: TProps) => active && payload?.length ? (
              <TooltipBox rows={[{ label: String(payload[0]?.name), value: `${payload[0]?.value} de ${total}`, color: String(payload[0]?.payload?.color ?? '') }]} />
            ) : null} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold text-gray-900 tabular-nums">{total}</span>
          <span className="text-[10px] text-gray-400">{centerLabel}</span>
        </div>
      </div>
      <ul className="flex-1 space-y-1.5">
        {items.map(i => (
          <li key={i.key} className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-gray-600">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: i.color }} />
              {i.label}
            </span>
            <span className="font-semibold text-gray-900 tabular-nums">
              {i.value} <span className="text-gray-400 font-normal">· {total ? Math.round((i.value / total) * 100) : 0}%</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
