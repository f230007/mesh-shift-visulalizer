# MeshShift Visualizer

> Interactive web application for visualizing 2-stage circular shift on a 2D mesh topology.

**Live Deployment:** `https://mesh-shift-visualizer.vercel.app` _(deploy to update this URL)_

---

## Overview

A **circular q-shift** on a `√p × √p` mesh moves each node's data from node `i` to node `(i + q) mod p`. This is implemented in **two stages**:

| Stage | Operation | Formula |
|-------|-----------|---------|
| **Stage 1 — Row Shift** | Each node shifts right within its row | `rowShift = q mod √p` |
| **Stage 2 — Col Shift** | Each node shifts down within its column | `colShift = ⌊q / √p⌋` |

**Mesh steps = rowShift + colShift**, which is always ≤ Ring steps = `min(q, p−q)`.

---

## Features

- **Interactive Controls** — select `p` (4–64, perfect squares) and `q` (1 to p−1) with real-time validation
- **Animated Visualization** — 3-panel before/Stage1/final layout with animated arrows showing data movement
- **Complexity Analysis Panel** — real-time formula display, bar chart comparison, and complexity table
- **Correctness Verification** — automatic correctness check after each simulation
- **Responsive Design** — works on desktop and mobile

---

## Tech Stack

- **Frontend:** React 18 + CSS (no external UI library)
- **Algorithm:** Pure JavaScript in `src/utils/shiftLogic.js` (fully testable)
- **Deployment:** Vercel / Netlify (static build)

---

## Project Structure

```
mesh-shift-visualizer/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── MeshGrid.jsx        ← SVG grid rendering + animated arrows
│   │   ├── ControlPanel.jsx    ← p/q inputs, phase indicator
│   │   └── ComplexityPanel.jsx ← metrics, bar chart, formula comparison
│   ├── utils/
│   │   └── shiftLogic.js       ← pure shift algorithm (testable)
│   ├── App.jsx                 ← main app, animation orchestration
│   ├── App.css                 ← all styles
│   └── index.js                ← React entry point
├── README.md
└── package.json
```

---

## Run Locally

### Prerequisites

- Node.js ≥ 16.x
- npm ≥ 8.x

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/mesh-shift-visualizer.git
cd mesh-shift-visualizer

# 2. Install dependencies
npm install

# 3. Start development server
npm start

# 4. Open in browser
# → http://localhost:3000
```

### Build for Production

```bash
npm run build
# Output is in the build/ directory
```

---

## Deploy to Vercel

```bash
# Option A: Vercel CLI
npm install -g vercel
vercel --prod

# Option B: GitHub Integration
# 1. Push this repo to GitHub (public)
# 2. Go to https://vercel.com → New Project
# 3. Import the GitHub repo
# 4. Framework: Create React App (auto-detected)
# 5. Click Deploy → get your live URL
```

## Deploy to Netlify

```bash
# 1. Build the project
npm run build

# 2. Drag the build/ folder to https://app.netlify.com/drop
# OR: Connect GitHub repo at https://netlify.com
#   Build command: npm run build
#   Publish directory: build
```

---

## Algorithm Worked Example

**p = 16, q = 5, √p = 4**

- `rowShift = 5 mod 4 = 1`
- `colShift = ⌊5 / 4⌋ = 1`

**Initial state** (node index = data value):
```
 0  1  2  3
 4  5  6  7
 8  9 10 11
12 13 14 15
```

**After Stage 1 (row shift right by 1):**
```
 3  0  1  2
 7  4  5  6
11  8  9 10
15 12 13 14
```

**After Stage 2 (col shift down by 1):**
```
15 12 13 14
 3  0  1  2
 7  4  5  6
11  8  9 10
```

**Verification:** Node 0 (position 0) now holds value 15 = `(0 - 5 + 16) mod 16` ✓

**Mesh steps:** 1 + 1 = **2**  
**Ring steps:** min(5, 11) = **5**  
**Savings:** 3 steps (60% fewer)

---

## Complexity Comparison

| p  | q | Row | Col | Mesh | Ring | Savings |
|----|---|-----|-----|------|------|---------|
| 16 | 3 |  3  |  0  |  3   |  3   |    0    |
| 16 | 5 |  1  |  1  |  2   |  5   |    3    |
| 16 | 7 |  3  |  1  |  4   |  7   |    3    |
| 64 | 3 |  3  |  0  |  3   |  3   |    0    |
| 64 | 5 |  5  |  0  |  5   |  5   |    0    |
| 64 | 7 |  7  |  0  |  7   |  7   |    0    |

---

## License

MIT — free to use for educational purposes.
