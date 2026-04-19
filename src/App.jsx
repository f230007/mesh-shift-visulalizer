import React, { useState, useCallback, useRef, useEffect } from 'react';
import ControlPanel from './components/ControlPanel';
import MeshGrid from './components/MeshGrid';
import ComplexityPanel from './components/ComplexityPanel';
import {
  buildInitialState, applyRowShift, applyColShift,
  computeShiftParams, computeMovements, verifyShift,
} from './utils/shiftLogic';
import './App.css';

const ANIM_DURATION = 1200; // ms per stage

export default function App() {
  const [p, setP] = useState(16);
  const [q, setQ] = useState(5);

  // Simulation states
  const [initial, setInitial] = useState(() => buildInitialState(16));
  const [afterRow, setAfterRow] = useState(null);
  const [afterCol, setAfterCol] = useState(null);
  const [phase, setPhase] = useState('idle'); // idle | row | col | done
  const [movements, setMovements] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [verified, setVerified] = useState(null);
  const [activeView, setActiveView] = useState('before'); // for mobile tab

  const animTimer = useRef(null);

  const clearTimers = () => {
    if (animTimer.current) clearTimeout(animTimer.current);
  };

  const handleParamsChange = useCallback((newP, newQ) => {
    setP(newP);
    setQ(newQ);
  }, []);

  const handleRun = useCallback((runP, runQ) => {
    clearTimers();
    const pv = runP || p;
    const qv = runQ || q;
    const params = computeShiftParams(pv, qv);
    const init = buildInitialState(pv);

    // Reset state
    setInitial(init);
    setAfterRow(null);
    setAfterCol(null);
    setVerified(null);
    setIsAnimating(true);
    setPhase('idle');
    setMovements([]);

    // Small initial pause
    animTimer.current = setTimeout(() => {
      // Stage 1: row shift
      setPhase('row');
      const rowMoves = computeMovements(pv, params.sqrtP, params.rowShift, 'row');
      setMovements(rowMoves);

      animTimer.current = setTimeout(() => {
        const ar = applyRowShift(init, params.sqrtP, params.rowShift);
        setAfterRow(ar);
        setMovements([]);

        // Pause between stages
        animTimer.current = setTimeout(() => {
          // Stage 2: col shift
          setPhase('col');
          const colMoves = computeMovements(pv, params.sqrtP, params.colShift, 'col');
          setMovements(colMoves);

          animTimer.current = setTimeout(() => {
            const ac = applyColShift(ar, params.sqrtP, params.colShift);
            setAfterCol(ac);
            setMovements([]);

            // Verify
            const ok = verifyShift(init, ac, pv, qv);
            setVerified(ok);
            setPhase('done');
            setIsAnimating(false);
          }, ANIM_DURATION);
        }, 400);
      }, ANIM_DURATION);
    }, 200);
  }, [p, q]);

  const handleReset = useCallback(() => {
    clearTimers();
    setPhase('idle');
    setMovements([]);
    setIsAnimating(false);
    setAfterRow(null);
    setAfterCol(null);
    setVerified(null);
    setInitial(buildInitialState(p));
  }, [p]);

  useEffect(() => () => clearTimers(), []);

  const params = computeShiftParams(p, q);
  const displayGrid = phase === 'done' ? afterCol :
    phase === 'col' ? afterRow :
    phase === 'row' ? initial :
    initial;

  const stateLabel = phase === 'idle' ? 'Before' :
    phase === 'row' ? 'Stage 1: Row Shift' :
    phase === 'col' ? 'Stage 2: Col Shift' :
    'After (Final)';

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-inner">
          <div className="header-logo">
            <div className="logo-icon">⬡</div>
            <div className="logo-text">
              <span className="logo-title">MeshShift</span>
              <span className="logo-sub">Circular Shift Visualizer</span>
            </div>
          </div>
          <div className="header-info">
            <span className="info-chip">p = {p}</span>
            <span className="info-chip">q = {q}</span>
            <span className="info-chip">√p = {params.sqrtP}</span>
            {verified !== null && (
              <span className={`verify-chip ${verified ? 'ok' : 'fail'}`}>
                {verified ? '✓ CORRECT' : '✗ INCORRECT'}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main layout */}
      <main className="app-main">
        {/* Left: Controls */}
        <aside className="sidebar-left">
          <ControlPanel
            p={p} q={q}
            onParamsChange={handleParamsChange}
            onRun={handleRun}
            onReset={handleReset}
            isAnimating={isAnimating}
            phase={phase}
          />
        </aside>

        {/* Centre: Mesh grids */}
        <section className="grids-area">
          <div className="grids-title">
            <span className="grids-title-text">Mesh Visualization</span>
            <span className="grids-subtitle">
              {params.sqrtP}×{params.sqrtP} mesh · node i → (i+{q}) mod {p}
            </span>
          </div>

          {/* Before / After / Intermediate row */}
          <div className="grids-row">
            {/* Before */}
            <div className={`grid-panel ${phase === 'idle' ? 'grid-active' : ''}`}>
              <div className="grid-panel-label">Before</div>
              <MeshGrid
                data={initial}
                movements={phase === 'row' ? movements : []}
                sqrtP={params.sqrtP}
                phase={phase === 'row' ? 'row' : 'idle'}
                label="Before"
                highlight={null}
              />
            </div>

            {/* Arrows between panels */}
            <div className="panel-connector">
              <div className={`connector-line ${phase === 'row' || phase === 'col' || phase === 'done' ? 'active' : ''}`} />
              <div className="connector-label">Stage 1<br />Row±{params.rowShift}</div>
            </div>

            {/* After Stage 1 */}
            <div className={`grid-panel ${phase === 'col' || phase === 'done' ? 'grid-active' : ''}`}>
              <div className="grid-panel-label">After Stage 1</div>
              <MeshGrid
                data={afterRow || initial}
                movements={phase === 'col' ? movements : []}
                sqrtP={params.sqrtP}
                phase={phase === 'col' ? 'col' : (afterRow ? 'row' : 'idle')}
                label="After Row Shift"
                highlight={null}
              />
              {!afterRow && (
                <div className="grid-placeholder">Run simulation to see Stage 1 result</div>
              )}
            </div>

            {/* Arrows between panels */}
            <div className="panel-connector">
              <div className={`connector-line ${phase === 'col' || phase === 'done' ? 'active' : ''}`} />
              <div className="connector-label">Stage 2<br />Col±{params.colShift}</div>
            </div>

            {/* Final */}
            <div className={`grid-panel ${phase === 'done' ? 'grid-active' : ''}`}>
              <div className="grid-panel-label">Final State</div>
              <MeshGrid
                data={afterCol || initial}
                movements={[]}
                sqrtP={params.sqrtP}
                phase={phase === 'done' ? 'done' : 'idle'}
                label="Final State"
                highlight={null}
              />
              {!afterCol && (
                <div className="grid-placeholder">Run simulation to see final state</div>
              )}
            </div>
          </div>

          {/* Step summary */}
          <div className="step-summary">
            <div className="ss-row">
              <div className="ss-item">
                <span className="ss-label">Current Phase</span>
                <span className="ss-value highlight">{stateLabel}</span>
              </div>
              <div className="ss-item">
                <span className="ss-label">Row Shift Amount</span>
                <span className="ss-value blue">{params.rowShift} positions →</span>
              </div>
              <div className="ss-item">
                <span className="ss-label">Col Shift Amount</span>
                <span className="ss-value purple">{params.colShift} positions ↓</span>
              </div>
              <div className="ss-item">
                <span className="ss-label">Total Mesh Steps</span>
                <span className="ss-value teal">{params.meshSteps}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Right: Complexity */}
        <aside className="sidebar-right">
          <ComplexityPanel p={p} q={q} />
        </aside>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <span>Mesh Circular Shift Visualizer</span>
        <span>·</span>
        <span>2-Stage Algorithm: Row + Column Shift</span>
        <span>·</span>
        <a href="https://github.com" target="_blank" rel="noreferrer">GitHub</a>
      </footer>
    </div>
  );
}
