# Mesh Shift Visualizer

Interactive web application for visualizing circular q-shift on a 2D toroidal mesh using a two-stage communication model.

Live Application: https://mesh-shift-visualizer.vercel.app

---

## Overview
A circular shift moves data from node i to (i + q) mod p on a √p × √p mesh. This is implemented in two stages:
- Row Shift: q mod √p
- Column Shift: ⌊q / √p⌋

Total mesh steps = rowShift + colShift  
Ring baseline = min(q, p − q)

---

## Features
- Interactive inputs for mesh size p and shift q
- Animated visualization of row and column communication
- Step-by-step states (initial → stage 1 → final)
- Real-time complexity comparison (Mesh vs Ring)
- Automatic correctness validation
- Responsive design

---

## Tech Stack
- React (Frontend)
- JavaScript (Core logic)
- CSS (Styling)
- Vercel (Deployment)

---

## Project Structure
mesh-shift-visualizer/
├── public/
├── src/
│   ├── components/
│   ├── utils/
│   ├── App.jsx
│   └── index.js
├── README.md
└── package.json

---

## Run Locally
git clone https://github.com/f230007/mesh-shift-visualizer.git
cd mesh-shift-visualizer
npm install
npm start

---

## Deployment
Deployed using Vercel:
1. Push to GitHub
2. Import project in Vercel
3. Deploy

---

## Example
For p = 16, q = 5:
Row shift = 1  
Column shift = 1  
Mesh steps = 2  
Ring steps = 5  

---

## Complexity Insight
The mesh-based approach reduces communication cost by using local neighbor exchanges, leading to better scalability compared to a ring-based method.

---

## License
For educational use