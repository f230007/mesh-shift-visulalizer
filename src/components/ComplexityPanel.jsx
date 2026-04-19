import React, { useMemo } from 'react';
import { computeShiftParams, generateComplexityData } from '../utils/shiftLogic.js';

function MiniBarChart({ data, currentQ, maxSteps }) {
  const chartH = 80;

  return (
    <div className="mini-chart">
      <svg width="100%" height={chartH} viewBox={`0 0 ${data.length * 6} ${chartH}`} preserveAspectRatio="none">
        {data.map((d, i) => {
          const meshH = (d.meshSteps / maxSteps) * (chartH - 14);
          const ringH = (d.ringSteps / maxSteps) * (chartH - 14);
          const isCurrent = d.q === currentQ;
          const x = i * 6;

          return (
            <g key={d.q}>
              <rect
                x={x + 1.5} y={chartH - ringH - 4} width={2} height={ringH}
                fill={isCurrent ? '#f97316' : 'rgba(249,115,22,0.35)'}
                rx="0.5"
              />
              <rect
                x={x + 3.2} y={chartH - meshH - 4} width={2} height={meshH}
                fill={isCurrent ? '#38bdf8' : 'rgba(56,189,248,0.35)'}
                rx="0.5"
              />
              {isCurrent && (
                <line
                  x1={x + 3} y1={0} x2={x + 3} y2={chartH}
                  stroke="rgba(255,255,255,0.35)" strokeWidth="0.7" strokeDasharray="2,2"
                />
              )}
            </g>
          );
        })}
      </svg>

      <div className="chart-legend">
        <span className="legend-item ring">■ Ring steps</span>
        <span className="legend-item mesh">■ Mesh steps</span>
        <span className="legend-item current">↑ current q</span>
      </div>
    </div>
  );
}

function ComparisonTable({ p }) {
  const sqrtP = Math.round(Math.sqrt(p));

  const rows = [
    { q: 3 }, { q: 5 }, { q: 7 },
    { q: Math.floor(p / 4) },
    { q: Math.floor(p / 2) },
  ].filter((r, i, arr) => r.q > 0 && r.q < p && arr.findIndex(x => x.q === r.q) === i);

  return (
    <div className="comparison-table">
      <div className="ctable-header">
        <span>q</span><span>Row</span><span>Col</span><span>Mesh</span><span>Ring</span><span>Savings</span>
      </div>

      {rows.map(({ q }) => {
        const rs = q % sqrtP;
        const cs = Math.floor(q / sqrtP);
        const mesh = rs + cs;
        const ring = Math.min(q, p - q);
        const saving = ring - mesh;

        return (
          <div key={q} className="ctable-row">
            <span className="ctable-q">{q}</span>
            <span>{rs}</span>
            <span>{cs}</span>
            <span className="ctable-mesh">{mesh}</span>
            <span className="ctable-ring">{ring}</span>
            <span className={saving > 0 ? 'saving-pos' : 'saving-zero'}>
              {saving > 0 ? `−${saving}` : '0'}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function ComplexityPanel({ p, q }) {
  const params = useMemo(() => computeShiftParams(p, q), [p, q]);
  const chartData = useMemo(() => generateComplexityData(p, Math.round(Math.sqrt(p))), [p]);
  const maxSteps = useMemo(
    () => Math.max(...chartData.map(d => Math.max(d.meshSteps, d.ringSteps))),
    [chartData]
  );

  const saving = params.ringSteps - params.meshSteps;
  const efficiency = params.ringSteps > 0
    ? Math.round((saving / params.ringSteps) * 100)
    : 0;

  return (
    <div className="complexity-panel">
      <div className="panel-header">
        <span className="panel-icon">📊</span>
        <h2>Complexity Analysis</h2>
      </div>

      {/* rest unchanged */}
    </div>
  );
}