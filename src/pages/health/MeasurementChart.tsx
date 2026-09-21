import type { HealthMeasurement } from '@/lib/api.types';

export default function MeasurementChart({ measurements, large = false }: { measurements: HealthMeasurement[]; large?: boolean }) {
  const rows = [...measurements].filter(x => Number.isFinite(x.value)).sort((a, b) => (a.measuredAt ?? '').localeCompare(b.measuredAt ?? ''));
  if (!rows.length) return null;
  const latest = rows[rows.length - 1];
  const limits = [latest.referenceMin, latest.referenceMax].filter((v): v is number => v != null && Number.isFinite(v));
  const values = [...rows.map(x => x.value), ...limits];
  const low = Math.min(...values), high = Math.max(...values);
  const pad = Math.max((high - low) * .25, Math.abs(high) * .1, 1);
  const min = low - pad, max = high + pad;
  const y = (v: number) => 112 - (v - min) / (max - min) * 88;
  const times = rows.map(x => x.measuredAt ? Date.parse(x.measuredAt) : NaN);
  const dated = times.every(Number.isFinite);
  const start = times[0], end = times[times.length - 1];
  const x = (i: number) => rows.length === 1 || (dated && start === end) ? 190 : 38 + (dated ? (times[i] - start) / (end - start) : i / (rows.length - 1)) * 300;
  const label = (date: string | null) => date ? new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(date)) : 'Date unavailable';
  return <svg className={`lp-measurement-chart${large ? ' large' : ''}`} viewBox="0 0 360 150" role="img" aria-label={`${rows.length} recorded measurements`}>
    {limits.length > 0 && <rect x="38" width="300" y={y(latest.referenceMax ?? max)} height={y(latest.referenceMin ?? min) - y(latest.referenceMax ?? max)} fill="rgba(45,184,147,.12)" />}
    {limits.map((limit, i) => <g key={i}><line x1="38" x2="338" y1={y(limit)} y2={y(limit)} stroke="#2db893" strokeDasharray="3 4" /><text x="336" y={y(limit) - 5} textAnchor="end" fill="#2db893">{limit} {latest.unit}</text></g>)}
    <path d="M38 20V122H338" fill="none" stroke="#293140" />
    <text x="31" y="26" textAnchor="end">{Number(max.toPrecision(3))}</text><text x="31" y="122" textAnchor="end">{Number(min.toPrecision(3))}</text>
    {rows.length > 1 && <polyline points={rows.map((r, i) => `${x(i)},${y(r.value)}`).join(' ')} fill="none" stroke="#2db893" strokeWidth="2" />}
    {rows.map((r, i) => <circle key={r.id} cx={x(i)} cy={y(r.value)} r="4" fill="#2db893"><title>{r.value} {r.unit} · {label(r.measuredAt)}</title></circle>)}
    <text x="38" y="144">{label(rows[0].measuredAt)}</text><text x="338" y="144" textAnchor="end">{label(latest.measuredAt)}</text>
  </svg>;
}
