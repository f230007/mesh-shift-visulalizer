import React, { useEffect, useRef } from 'react';

function Arrow({ from, to, sqrtP, cellSize, gap, phase }) {
  const pad = 16;
  const cs = cellSize + gap;

  const fromCol = from % sqrtP;
  const fromRow = Math.floor(from / sqrtP);
  const toCol = to % sqrtP;
  const toRow = Math.floor(to / sqrtP);

  const fx = fromCol * cs + cellSize / 2 + pad;
  const fy = fromRow * cs + cellSize / 2 + pad;
  const tx = toCol * cs + cellSize / 2 + pad;
  const ty = toRow * cs + cellSize / 2 + pad;

  // Offset arrows slightly so they don't all overlap at cell centre
  const dx = tx - fx;
  const dy = ty - fy;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const offset = cellSize * 0.28;
  const startX = fx + (dx / len) * offset;
  const startY = fy + (dy / len) * offset;
  const endX = tx - (dx / len) * offset;
  const endY = ty - (dy / len) * offset;

  const color = phase === 'row' ? '#38bdf8' : '#a78bfa';
  const id = `arrowhead-${phase}-${from}-${to}`;

  return (
    <g className="shift-arrow">
      <defs>
        <marker id={id} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill={color} />
        </marker>
      </defs>
      <line
        x1={startX} y1={startY}
        x2={endX} y2={endY}
        stroke={color}
        strokeWidth="2"
        markerEnd={`url(#${id})`}
        strokeDasharray="5,3"
        opacity="0.85"
      />
    </g>
  );
}

export default function MeshGrid({ data, movements, sqrtP, phase, label, highlight }) {
  const p = sqrtP * sqrtP;
  const maxGridWidth = 480;
  const gap = sqrtP <= 4 ? 10 : sqrtP <= 6 ? 7 : 5;
  const cellSize = Math.min(72, Math.floor((maxGridWidth - (sqrtP - 1) * gap) / sqrtP));
  const gridW = sqrtP * cellSize + (sqrtP - 1) * gap + 32;
  const gridH = gridW;

  // Colour each cell by its value (hue based on value/p)
  const getColor = (val, isHighlighted) => {
    const hue = Math.round((val / p) * 270); // 0=red, 270=blue
    if (isHighlighted) return `hsl(${hue}, 90%, 68%)`;
    return `hsl(${hue}, 65%, 52%)`;
  };

  const phaseLabel = {
    idle: 'Initial State',
    row: 'Stage 1: Row Shift in Progress',
    col: 'Stage 2: Column Shift in Progress',
    done: 'Final State',
  };

  return (
    <div className={`mesh-grid-container ${phase}`}>
      <div className="mesh-label">
        <span className="mesh-label-tag">{label}</span>
        {phase && <span className="mesh-phase-tag">{phaseLabel[phase] || phase}</span>}
      </div>

      <svg
        width={gridW}
        height={gridH}
        style={{ display: 'block', overflow: 'visible' }}
      >
        {/* Grid cells */}
        {data.map((val, idx) => {
          const col = idx % sqrtP;
          const row = Math.floor(idx / sqrtP);
          const x = col * (cellSize + gap) + 16;
          const y = row * (cellSize + gap) + 16;
          const isHighlighted = highlight && highlight.has(idx);
          const isMoving = movements && movements.some(m => m.fromIdx === idx);
          const color = getColor(val, isHighlighted || isMoving);

          return (
            <g key={idx} className={`cell ${isMoving ? 'moving' : ''}`}>
              <rect
                x={x} y={y}
                width={cellSize} height={cellSize}
                rx={sqrtP <= 4 ? 10 : 7}
                fill={color}
                stroke={isMoving ? '#fff' : 'rgba(255,255,255,0.15)'}
                strokeWidth={isMoving ? 2.5 : 1}
                style={{
                  filter: isMoving ? 'drop-shadow(0 0 8px rgba(255,255,255,0.5))' : 'none',
                  transition: 'all 0.3s ease',
                }}
              />
              {/* Node index (small, top-left) */}
              <text
                x={x + 5} y={y + 13}
                fontSize={Math.max(9, cellSize * 0.18)}
                fill="rgba(255,255,255,0.65)"
                fontFamily="'JetBrains Mono', monospace"
              >
                {idx}
              </text>
              {/* Data value (large, centred) */}
              <text
                x={x + cellSize / 2} y={y + cellSize / 2 + (cellSize > 50 ? 5 : 3)}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={Math.max(13, cellSize * 0.34)}
                fontWeight="700"
                fill="#fff"
                fontFamily="'JetBrains Mono', monospace"
              >
                {val}
              </text>
            </g>
          );
        })}

        {/* Movement arrows */}
        {movements && movements.map((m, i) => (
          <Arrow
            key={i}
            from={m.fromIdx}
            to={m.toIdx}
            sqrtP={sqrtP}
            cellSize={cellSize}
            gap={gap}
            phase={phase === 'row' ? 'row' : 'col'}
          />
        ))}
      </svg>

      {/* Row/Col labels on sides */}
      <div className="grid-axis-labels" style={{ width: gridW }}>
        {Array.from({ length: sqrtP }, (_, r) => (
          <span
            key={r}
            className="row-label"
            style={{ top: r * (cellSize + gap) + 16 + cellSize / 2 - 8 }}
          >
            R{r}
          </span>
        ))}
      </div>
    </div>
  );
}
