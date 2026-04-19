import React, { useState } from 'react';
import { validateInputs } from '../utils/shiftLogic.js';

const PERFECT_SQUARES = [4, 9, 16, 25, 36, 49, 64];

export default function ControlPanel({ p, q, onParamsChange, onRun, onReset, isAnimating, phase }) {
  const [localP, setLocalP] = useState(String(p));
  const [localQ, setLocalQ] = useState(String(q));
  const [errors, setErrors] = useState([]);

  const handleSubmit = () => {
    const pVal = parseInt(localP, 10);
    const qVal = parseInt(localQ, 10);
    const { valid, errors: errs } = validateInputs(pVal, qVal);
    setErrors(errs);
    if (valid) {
      onParamsChange(pVal, qVal);
      onRun(pVal, qVal);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit();
  };

  const pVal = parseInt(localP, 10) || 16;
  const maxQ = PERFECT_SQUARES.includes(pVal) ? pVal - 1 : 15;

  return (
    <div className="control-panel">
      <div className="panel-header">
        <span className="panel-icon">⚙</span>
        <h2>Configuration</h2>
      </div>

      <div className="input-group">
        <label htmlFor="p-input">
          <span className="label-text">Grid Size <em>p</em></span>
          <span className="label-hint">perfect square, 4–64</span>
        </label>
        <div className="select-wrapper">
          <select
            id="p-input"
            value={localP}
            onChange={e => { setLocalP(e.target.value); setErrors([]); }}
            disabled={isAnimating}
          >
            {PERFECT_SQUARES.map(v => (
              <option key={v} value={v}>{v} ({Math.sqrt(v)}×{Math.sqrt(v)})</option>
            ))}
          </select>
          <span className="select-arrow">▾</span>
        </div>
      </div>

      <div className="input-group">
        <label htmlFor="q-input">
          <span className="label-text">Shift Distance <em>q</em></span>
          <span className="label-hint">1 to {maxQ}</span>
        </label>
        <div className="number-input-wrapper">
          <button
            className="num-btn"
            onClick={() => { const v = Math.max(1, parseInt(localQ || '1') - 1); setLocalQ(String(v)); setErrors([]); }}
            disabled={isAnimating}
          >−</button>
          <input
            id="q-input"
            type="number"
            min="1"
            max={maxQ}
            value={localQ}
            onChange={e => { setLocalQ(e.target.value); setErrors([]); }}
            onKeyDown={handleKeyDown}
            disabled={isAnimating}
          />
          <button
            className="num-btn"
            onClick={() => { const v = Math.min(maxQ, parseInt(localQ || '1') + 1); setLocalQ(String(v)); setErrors([]); }}
            disabled={isAnimating}
          >+</button>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="error-list">
          {errors.map((e, i) => <div key={i} className="error-item">⚠ {e}</div>)}
        </div>
      )}

      <div className="btn-row">
        <button
          className="btn-primary"
          onClick={handleSubmit}
          disabled={isAnimating}
        >
          <span className="btn-icon">▶</span> Run Simulation
        </button>
        <button
          className="btn-secondary"
          onClick={onReset}
          disabled={isAnimating}
        >
          ↺ Reset
        </button>
      </div>

      <div className="phase-indicator">
        <div className={`phase-badge ${phase === 'idle' ? 'active' : ''}`}>
          <span className="badge-dot" />
          Idle
        </div>
        <div className="phase-arrow">→</div>
        <div className={`phase-badge ${phase === 'row' ? 'active' : ''}`}>
          <span className="badge-dot" />
          Stage 1: Row Shift
        </div>
        <div className="phase-arrow">→</div>
        <div className={`phase-badge ${phase === 'col' ? 'active' : ''}`}>
          <span className="badge-dot" />
          Stage 2: Col Shift
        </div>
        <div className="phase-arrow">→</div>
        <div className={`phase-badge ${phase === 'done' ? 'active' : ''}`}>
          <span className="badge-dot" />
          Done
        </div>
      </div>

      <div className="formula-box">
        <div className="formula-title">Algorithm</div>
        <div className="formula-line">
          <span className="formula-label">Row shift</span>
          <span className="formula-value">q mod √p</span>
        </div>
        <div className="formula-line">
          <span className="formula-label">Col shift</span>
          <span className="formula-value">⌊q / √p⌋</span>
        </div>
        <div className="formula-line">
          <span className="formula-label">Node i → </span>
          <span className="formula-value">(i + q) mod p</span>
        </div>
      </div>
    </div>
  );
}
