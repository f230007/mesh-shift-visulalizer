import React, { useState, useCallback, useRef } from 'react';
import ControlPanel from './components/ControlPanel.jsx';
import MeshGrid from './components/MeshGrid.jsx';
import ComplexityPanel from './components/ComplexityPanel.jsx';
import {
  buildInitialState, applyRowShift, applyColShift,
  computeShiftParams, computeMovements, verifyShift,
} from './utils/shiftLogic.js';
import './App.css';

const ANIM_DURATION = 1200;

export default function App() {
  const [p, setP] = useState(16);
  const [q, setQ] = useState(5);

  const [initial, setInitial] = useState(() => buildInitialState(16));
  const [afterRow, setAfterRow] = useState(null);
  const [afterCol, setAfterCol] = useState(null);
  const [phase, setPhase] = useState('idle');
  const [movements, setMovements] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [verified, setVerified] = useState(null);
  const [activeView, setActiveView] = useState('before');

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

    setInitial(init);
    setAfterRow(null);
    setAfterCol(null);
    setVerified(null);
    setIsAnimating(true);
    setPhase('idle');
    setMovements([]);

    animTimer.current = setTimeout(() => {
      setPhase('row');

      const rowMoves = computeMovements(pv, params.sqrtP, params.rowShift, 'row');
      setMovements(rowMoves);

      animTimer.current = setTimeout(() => {
        const ar = applyRowShift(init, params.sqrtP, params.rowShift);
        setAfterRow(ar);
        setMovements([]);

        animTimer.current = setTimeout(() => {
          setPhase('col');

          const colMoves = computeMovements(pv, params.sqrtP, params.colShift, 'col');
          setMovements(colMoves);

          animTimer.current = setTimeout(() => {
            const ac = applyColShift(ar, params.sqrtP, params.colShift);
            setAfterCol(ac);
            setMovements([]);

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

  const params = computeShiftParams(p, q);

  const stateLabel =
    phase === 'idle' ? 'Before' :
    phase === 'row' ? 'Stage 1: Row Shift' :
    phase === 'col' ? 'Stage 2: Col Shift' :
    'After (Final)';

  return (
    <div className="app">
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

      <main className="app-main">
        <aside className="sidebar-left">
          <ControlPanel
            p={p}
            q={q}
            onParamsChange={handleParamsChange}
            onRun={handleRun}
            onReset={handleReset}
            isAnimating={isAnimating}
            phase={phase}
          />
        </aside>

        <section className="grids-area">

          <div className="grids-title">
            <span className="grids-title-text">Mesh Visualization</span>
            <span className="grids-subtitle">
              {params.sqrtP}×{params.sqrtP} mesh · node i → (i+{q}) mod {p}
            </span>
          </div>

          <div className="grids-row">

            <div className="grid-panel">
              <div className="grid-panel-label">Before</div>
              <MeshGrid
                data={initial}
                movements={phase === 'row' ? movements : []}
                sqrtP={params.sqrtP}
                phase={phase === 'row' ? 'row' : 'idle'}
              />
            </div>

            <div className="grid-panel">
              <div className="grid-panel-label">After Stage 1</div>
              <MeshGrid
                data={afterRow || initial}
                movements={phase === 'col' ? movements : []}
                sqrtP={params.sqrtP}
                phase={phase === 'col' ? 'col' : 'idle'}
              />
            </div>

            <div className="grid-panel">
              <div className="grid-panel-label">Final State</div>
              <MeshGrid
                data={afterCol || initial}
                movements={[]}
                sqrtP={params.sqrtP}
                phase={phase === 'done' ? 'done' : 'idle'}
              />
            </div>

          </div>

          <div className="step-summary">
            <div className="ss-item">
              <span className="ss-label">Phase</span>
              <span className="ss-value">{stateLabel}</span>
            </div>
            <div className="ss-item">
              <span className="ss-label">Row Shift</span>
              <span className="ss-value">{params.rowShift}</span>
            </div>
            <div className="ss-item">
              <span className="ss-label">Col Shift</span>
              <span className="ss-value">{params.colShift}</span>
            </div>
          </div>

        </section>

        <aside className="sidebar-right">
          <ComplexityPanel p={p} q={q} />
        </aside>

      </main>

      <footer className="app-footer">
        Mesh Circular Shift Visualizer · React Project
      </footer>
    </div>
  );
}