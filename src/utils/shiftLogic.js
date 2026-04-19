/**
 * shiftLogic.js
 * Pure, testable implementation of the 2-stage mesh circular shift algorithm.
 *
 * A q-shift on a √p × √p mesh moves data from node i → node (i+q) mod p.
 * Decomposed into:
 *   Stage 1 (Row):    rowShift  = q mod √p   (positions right within each row)
 *   Stage 2 (Column): colShift  = ⌊q / √p⌋  (positions down within each column)
 */

// ─── Core algorithm ───────────────────────────────────────────────────────────

/**
 * Compute shift parameters for a given p and q.
 * @param {number} p - total nodes (perfect square, 4–64)
 * @param {number} q - shift distance (1 … p-1)
 * @returns {{ sqrtP, rowShift, colShift, meshSteps, ringSteps }}
 */
export function computeShiftParams(p, q) {
  const sqrtP = Math.round(Math.sqrt(p));
  const rowShift = q % sqrtP;
  const colShift = Math.floor(q / sqrtP);
  const meshSteps = rowShift + colShift;
  const ringSteps = Math.min(q, p - q);
  return { sqrtP, rowShift, colShift, meshSteps, ringSteps };
}

/**
 * Build the initial data state: node i holds value i.
 * @param {number} p
 * @returns {number[]} array of length p, data[i] = i
 */
export function buildInitialState(p) {
  return Array.from({ length: p }, (_, i) => i);
}

/**
 * Apply Stage 1: row-wise circular right-shift by rowShift positions.
 * Node at position (r, c) gets the data from (r, (c - rowShift + sqrtP) % sqrtP).
 * @param {number[]} data - flat array of length p
 * @param {number} sqrtP
 * @param {number} rowShift
 * @returns {number[]} new flat array after row shift
 */
export function applyRowShift(data, sqrtP, rowShift) {
  if (rowShift === 0) return [...data];
  const result = new Array(data.length);
  for (let r = 0; r < sqrtP; r++) {
    for (let c = 0; c < sqrtP; c++) {
      const src = r * sqrtP + ((c - rowShift + sqrtP) % sqrtP);
      result[r * sqrtP + c] = data[src];
    }
  }
  return result;
}

/**
 * Apply Stage 2: column-wise circular down-shift by colShift positions.
 * Node at position (r, c) gets the data from ((r - colShift + sqrtP) % sqrtP, c).
 * @param {number[]} data - flat array of length p
 * @param {number} sqrtP
 * @param {number} colShift
 * @returns {number[]} new flat array after column shift
 */
export function applyColShift(data, sqrtP, colShift) {
  if (colShift === 0) return [...data];
  const result = new Array(data.length);
  for (let r = 0; r < sqrtP; r++) {
    for (let c = 0; c < sqrtP; c++) {
      const srcRow = ((r - colShift + sqrtP) % sqrtP);
      result[r * sqrtP + c] = data[srcRow * sqrtP + c];
    }
  }
  return result;
}

/**
 * Run the full 2-stage shift and return all three states.
 * @param {number} p
 * @param {number} q
 * @returns {{ initial, afterRow, afterCol, params }}
 */
export function runFullShift(p, q) {
  const params = computeShiftParams(p, q);
  const initial = buildInitialState(p);
  const afterRow = applyRowShift(initial, params.sqrtP, params.rowShift);
  const afterCol = applyColShift(afterRow, params.sqrtP, params.colShift);
  return { initial, afterRow, afterCol, params };
}

/**
 * Verify correctness of the 2-stage mesh shift.
 * The 2D torus shift moves data at (r,c) to ((r+colShift)%s, (c+rowShift)%s).
 * So position (r,c) in the final grid holds data originally at
 * ((r-colShift+s)%s, (c-rowShift+s)%s).
 * @param {number[]} initial
 * @param {number[]} final
 * @param {number} p
 * @param {number} q
 * @returns {boolean}
 */
export function verifyShift(initial, final, p, q) {
  const sqrtP = Math.round(Math.sqrt(p));
  const rowShift = q % sqrtP;
  const colShift = Math.floor(q / sqrtP);
  for (let r = 0; r < sqrtP; r++) {
    for (let c = 0; c < sqrtP; c++) {
      const j = r * sqrtP + c;
      const srcR = ((r - colShift) % sqrtP + sqrtP) % sqrtP;
      const srcC = ((c - rowShift) % sqrtP + sqrtP) % sqrtP;
      const src = srcR * sqrtP + srcC;
      if (final[j] !== initial[src]) return false;
    }
  }
  return true;
}

/**
 * Compute per-node movement arrows for a given stage.
 * Returns array of { fromIdx, toIdx, direction } for each moving node.
 * @param {number} p
 * @param {number} sqrtP
 * @param {number} shift
 * @param {'row'|'col'} stage
 * @returns {Array<{fromIdx:number, toIdx:number}>}
 */
export function computeMovements(p, sqrtP, shift, stage) {
  if (shift === 0) return [];
  const moves = [];
  for (let r = 0; r < sqrtP; r++) {
    for (let c = 0; c < sqrtP; c++) {
      const fromIdx = r * sqrtP + c;
      let toIdx;
      if (stage === 'row') {
        const toC = (c + shift) % sqrtP;
        toIdx = r * sqrtP + toC;
      } else {
        const toR = (r + shift) % sqrtP;
        toIdx = toR * sqrtP + c;
      }
      if (fromIdx !== toIdx) {
        moves.push({ fromIdx, toIdx });
      }
    }
  }
  return moves;
}

/**
 * Generate complexity comparison data for the panel chart.
 * @param {number} p
 * @param {number} sqrtP
 * @returns {Array<{q, meshSteps, ringSteps}>}
 */
export function generateComplexityData(p, sqrtP) {
  const data = [];
  for (let q = 1; q < p; q++) {
    const rowShift = q % sqrtP;
    const colShift = Math.floor(q / sqrtP);
    data.push({
      q,
      meshSteps: rowShift + colShift,
      ringSteps: Math.min(q, p - q),
    });
  }
  return data;
}

/**
 * Validate input values.
 * @param {number} p
 * @param {number} q
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateInputs(p, q) {
  const errors = [];
  const sqrtP = Math.sqrt(p);
  if (!Number.isInteger(sqrtP)) errors.push(`p must be a perfect square (4, 9, 16, 25, 36, 49, 64)`);
  if (p < 4 || p > 64) errors.push(`p must be between 4 and 64`);
  if (!Number.isInteger(q) || q < 1 || q >= p) errors.push(`q must be an integer between 1 and p−1 (${p - 1})`);
  return { valid: errors.length === 0, errors };
}
