import React, { useMemo } from 'react';
import { computeShiftParams } from '../utils/shiftLogic.js';

export default function ComplexityPanel({ p, q }) {
  const params = useMemo(() => computeShiftParams(p, q), [p, q]);

  return (
    <div className="complexity-panel">
      <div className="panel-header">
        <span className="panel-icon">📊</span>
        <h2>Complexity Analysis</h2>
      </div>

      <div className="metrics-grid">
        <div className="metric-card blue">
          <div className="metric-value">{params.rowShift}</div>
          <div className="metric-label">Row Shift</div>
        </div>

        <div className="metric-card purple">
          <div className="metric-value">{params.colShift}</div>
          <div className="metric-label">Col Shift</div>
        </div>

        <div className="metric-card teal">
          <div className="metric-value">{params.meshSteps}</div>
          <div className="metric-label">Mesh Steps</div>
        </div>

        <div className="metric-card orange">
          <div className="metric-value">{params.ringSteps}</div>
          <div className="metric-label">Ring Steps</div>
        </div>
      </div>
    </div>
  );
}