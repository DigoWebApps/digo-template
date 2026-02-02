# DIGO Quick Reference - Critical Patterns

## 🔥 Critical Rules (DO NOT VIOLATE)

### 1. Spread Operator Position
```typescript
// ✅ CORRECT - spread FIRST
const data = this.instances?.map((instance) => ({
  ...instance,
  name: instance['label'] as string
}));

// ❌ WRONG - spread last
const data = this.instances?.map((instance) => ({
  name: instance['label'] as string,
  ...instance  // ← BREAKS EVERYTHING
}));
```

### 2. Export Pattern
```typescript
// ✅ CORRECT
export class Asset extends DigoAsset { }

// ❌ WRONG
export default class Asset extends DigoAsset { }
```

### 3. isArray Property
```json
// When linking to DataColumn with isArray: true
{
  "id": "values",
  "type": "NUMBER",
  "isGlobal": false,
  "isArray": true  // ← MUST MATCH DataColumn
}
```

---

## 📊 TimeArray Patterns

### Pattern A: Multiple Lines (rows = series)
```typescript
// Data: 3 companies × 4 quarters
// Each row creates a line

{this.instances?.map((instance, idx) => (
  <Line
    dataKey={instance['line-label']}
    stroke={instance['line-color']}
  />
))}

// VizParameter MUST have isArray: true
```

### Pattern B: Single Line (1 row with array)
```typescript
// Data: 1 company × 4 quarters
// One row with array of values

const values = this.instances?.[0]['line-values'] as number[];

const chartData = this.timeArray?.map((time, idx) => ({
  name: time,
  value: values[idx]
}));

// VizParameter MUST have isArray: true
```

### Pattern C: Inverted (rows = x-axis, timeArray = series)
```typescript
// Data: 4 quarters × 3 years
// Rows are x-axis, timeArray becomes series

{this.timeArray?.map((year, idx) => (
  <Line dataKey={year} />
))}

// VizParameter MUST have isArray: true
```

---

## 🎨 Recharts

### Color Mapping
```typescript
// ✅ CORRECT - use 'fill'
const data = this.instances?.map((instance) => ({
  ...instance,
  fill: instance['slice-color'] as string
}));

<Cell fill={entry.fill} />

// ❌ WRONG - 'color' doesn't work
```

---

## 🏗️ Three.js

### React 19 Packages
```json
{
  "react": "^19.0.0",
  "@react-three/fiber": "^9.0.0",      // ← v9+ required
  "@react-three/drei": "^9.114.0",     // ← v9+ required
  "three": "^0.169.0"
}
```

---

## ✅ Working Examples

All located in `tests/results/`:

1. `orchestrator/002-quarterly-revenue-line-chart/variations/A-multi-company-comparison-WORKING.json`
2. `orchestrator/002-quarterly-revenue-line-chart/variations/B-single-line-quarterly-evolution-WORKING.json`
3. `orchestrator/002-quarterly-revenue-line-chart/variations/C-multi-year-quarterly-comparison-WORKING.json`
4. `visuals-agent/001-3d-cube-threejs/DIGO_ARTIFACT_WORKING.json`
5. `visuals-agent/002-pie-chart-recharts/DIGO_ARTIFACT_WORKING.json`
