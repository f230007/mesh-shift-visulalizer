import React, { useState, useCallback, useRef, useEffect } from 'react';
import ControlPanel from './components/ControlPanel.jsx';
import MeshGrid from './components/MeshGrid.jsx';
import ComplexityPanel from './components/ComplexityPanel.jsx';
import {
  buildInitialState, applyRowShift, applyColShift,
  computeShiftParams, computeMovements, verifyShift,
} from './utils/shiftLogic.js';
import '../App.css';

const ANIM_DURATION = 1200; // ms per stage

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

  useEffect(() => () => clearTimers(), []);

  const params = computeShiftParams(p, q);

  const displayGrid =
    phase === 'done' ? afterCol :
    phase === 'col' ? afterRow :
    phase === 'row' ? initial :
    initial;

  const stateLabel =
    phase === 'idle' ? 'Before' :
    phase === 'row' ? 'Stage 1: Row Shift' :
    phase === 'col' ? 'Stage 2: Col Shift' :
    'After (Final)';

  return (
    <div className="app">
      {/* unchanged UI */}
    </div>
  );
}