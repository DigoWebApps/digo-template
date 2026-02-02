# DIGO Testing - Critical Learnings & Patterns

**Date**: January 29, 2026
**Status**: All tests WORKING ✅

## 🎯 Overview

This document captures critical patterns, discoveries, and fixes from testing DIGO visualization artifacts. These learnings are essential for creating correct artifacts in the future.

---

## 🔑 Critical Discoveries

### 1. **VizParameter DOES Support `isArray` Property**

**DISCOVERY**: The VizParameter schema includes an optional `isArray` property that was previously undocumented in agent instructions.

**Rule**: When linking a VizParameter to a DataColumn that has `isArray: true`, the VizParameter MUST also have `isArray: true`.

**Evidence**: Working 3D cube example (`001-3d-cube-threejs/DIGO_ARTIFACT_WORKING.json`)

```json
// In definition.json
{
  "id": "position-x",
  "name": "Position X",
  "isGlobal": false,
  "type": "NUMBER",
  "isArray": false,  // ← VizParameter HAS this property
  "definition": {
    "defaultValue": 0,
    "min": -10,
    "max": 10
  }
}
```

**Impact**: TimeArray visualizations REQUIRE this for proper data linking.

---

### 2. **Spread Operator Position in Data Mapping**

**CRITICAL RULE**: The spread operator `...instance` MUST be the FIRST property in object mapping.

**❌ WRONG**:
```typescript
const data = this.instances?.map((instance, index) => ({
  name: instance['company-name'] as string,
  revenue: instance['revenue'] as number,
  ...instance  // ← WRONG: spread operator last
})) || [];
```

**✅ CORRECT**:
```typescript
const data = this.instances?.map((instance, index) => ({
  ...instance,  // ← CORRECT: spread operator FIRST
  name: instance['company-name'] as string,
  revenue: instance['revenue'] as number
})) || [];
```

**Why**: Ensures all instance properties are available before explicit mappings override them.

**Location**: All working artifacts follow this pattern (`A-multi-company-comparison-WORKING.json`, etc.)

---

### 3. **Export Statement Pattern**

**RULE**: Always use named export, never default export.

**❌ WRONG**:
```typescript
export default class Asset extends DigoAsset { }
```

**✅ CORRECT**:
```typescript
export class Asset extends DigoAsset { }
```

**Why**: The DIGO runtime expects named exports.

---

### 4. **React 19 Compatibility**

**Issue**: @react-three/fiber v8.x is incompatible with React 19.

**Solution**: Use updated package versions:

```json
{
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "@react-three/fiber": "^9.0.0",      // ← v9+ required
  "@react-three/drei": "^9.114.0",     // ← v9+ required
  "three": "^0.169.0"                  // ← Updated
}
```

**Error Fixed**: `Cannot read properties of undefined (reading 'ReactCurrentOwner')`

**Location**: `001-3d-cube-threejs/DIGO_ARTIFACT_WORKING.json`

---

## 📊 TimeArray Visualization Patterns

### Pattern A: Multiple Instances, Each Creates a Series

**Use Case**: Multi-company comparison (3 companies × 4 quarters)

**Data Structure**:
```json
{
  "timeArray": ["Q1", "Q2", "Q3", "Q4"],
  "rows": [
    {"company": "A", "quarters": [100, 120, 140, 160]},
    {"company": "B", "quarters": [90, 110, 130, 150]},
    {"company": "C", "quarters": [80, 100, 120, 140]}
  ]
}
```

**VizParameter**:
```json
{
  "id": "line-values",
  "name": "Line Values",
  "isGlobal": false,        // ← Instance parameter
  "type": "NUMBER",
  "isArray": true,          // ← MUST match DataColumn
  "definition": {
    "defaultValue": 0,
    "min": 0
  }
}
```

**Rendering**:
```typescript
// Each instance becomes a line
const chartData = this.timeArray?.map((timeLabel, index) => {
  const dataPoint: any = { name: timeLabel };

  this.instances?.forEach((instance) => {
    const companyName = instance['line-label'] as string;
    const values = instance['line-values'] as number[];
    dataPoint[companyName] = values[index];
  });

  return dataPoint;
}) || [];

// Render multiple lines
{this.instances?.map((instance, idx) => (
  <Line
    key={idx}
    type="monotone"
    dataKey={instance['line-label'] as string}
    stroke={instance['line-color'] as string}
  />
))}
```

**Location**: `A-multi-company-comparison-WORKING.json`

---

### Pattern B: Single Instance with Array Parameter

**Use Case**: Single line quarterly evolution (1 row × 4 quarters)

**Data Structure**:
```json
{
  "timeArray": ["Q1", "Q2", "Q3", "Q4"],
  "rows": [
    {"company": "TechCorp", "quarters": [100, 120, 140, 160]}
  ]
}
```

**VizParameter**:
```json
{
  "id": "line-values",
  "name": "Line Values",
  "isGlobal": false,        // ← Instance parameter
  "type": "NUMBER",
  "isArray": true,          // ← CRITICAL for receiving array
  "definition": {
    "defaultValue": 0,
    "min": 0
  }
}
```

**Rendering**:
```typescript
// Single instance with array parameter
const firstInstance = this.instances?.[0];
const revenueArray = firstInstance?.['line-values'] as number[] || [];

// Map timeArray indices to array values
const chartData = this.timeArray?.map((timeLabel, index) => ({
  name: timeLabel,
  revenue: revenueArray[index] || 0
})) || [];

// Render single line
<Line
  type="monotone"
  dataKey="revenue"
  stroke={firstInstance?.['line-color'] as string || '#8884d8'}
/>
```

**Key Insight**: Without `isArray: true`, the parameter receives `undefined` instead of the array.

**Location**: `B-single-line-quarterly-evolution-WORKING.json`

---

### Pattern C: Inverted Structure (Rows = Categories, TimeArray = Series)

**Use Case**: Multi-year quarterly comparison (4 quarters × 3 years)

**Data Structure**:
```json
{
  "timeArray": ["2022", "2023", "2024"],
  "rows": [
    {"quarter": "Q1", "years": [100, 110, 120]},
    {"quarter": "Q2", "years": [120, 130, 140]},
    {"quarter": "Q3", "years": [140, 150, 160]},
    {"quarter": "Q4", "years": [160, 170, 180]}
  ]
}
```

**VizParameter**:
```json
{
  "id": "quarter-values",
  "name": "Quarter Values",
  "isGlobal": false,
  "type": "NUMBER",
  "isArray": true,          // ← Array of yearly values
  "definition": {
    "defaultValue": 0,
    "min": 0
  }
}
```

**Rendering**:
```typescript
// Rows are x-axis categories (quarters)
// TimeArray becomes the series (years)
const chartData = this.instances?.map((instance) => {
  const quarterName = instance['quarter-label'] as string;
  const yearlyValues = instance['quarter-values'] as number[];

  const dataPoint: any = { quarter: quarterName };

  this.timeArray?.forEach((year, index) => {
    dataPoint[year] = yearlyValues[index] || 0;
  });

  return dataPoint;
}) || [];

// Render lines for each year
{this.timeArray?.map((year, index) => (
  <Line
    key={index}
    type="monotone"
    dataKey={year}
    stroke={colors[index % colors.length]}
  />
))}
```

**Location**: `C-multi-year-quarterly-comparison-WORKING.json`

---

## 🎨 Recharts Specific Patterns

### Pie Chart - Color Mapping

**Issue**: Colors were rendering as black.

**❌ WRONG**:
```typescript
const data = this.instances?.map((instance) => ({
  ...instance,
  name: instance['slice-label'],
  value: instance['slice-value'],
  color: instance['slice-color']  // ← Wrong property name
}));

<Cell key={`cell-${index}`} fill={entry.color} />  // ← Wrong
```

**✅ CORRECT**:
```typescript
const data = this.instances?.map((instance) => ({
  ...instance,
  name: instance['slice-label'] as string,
  value: instance['slice-value'] as number,
  fill: instance['slice-color'] as string  // ← Must be 'fill'
})) || [];

<Cell key={`cell-${index}`} fill={entry.fill} />  // ← Correct
```

**Location**: `002-pie-chart-recharts/DIGO_ARTIFACT_WORKING.json`

---

### Pie Chart - Custom Label Positioning

**Issue**: Labels always outside, connecting lines not controlled.

**Solution**: Custom label renderer with trigonometry.

```typescript
const RADIAN = Math.PI / 180;

const renderCustomLabel = (props: any) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, name } = props;

  if (labelPosition === 'outside') {
    // Position outside the pie
    const radius = outerRadius + 20;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="#333"
        textAnchor={x > cx ? 'start' : 'end'}  // ← Smart anchoring
        dominantBaseline="central"
        fontSize="14px"
        fontWeight="500"
      >
        {name}
      </text>
    );
  } else {
    // Position inside the pie
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="14px"
        fontWeight="500"
      >
        {name}
      </text>
    );
  }
};

// In Pie component
<Pie
  labelLine={labelPosition === 'outside'}  // ← Control connecting lines
  label={showLabels ? renderCustomLabel : false}
  // ... other props
/>
```

**Location**: `002-pie-chart-recharts/DIGO_ARTIFACT_WORKING.json`

---

## 🏗️ Three.js Specific Patterns

### Instance Parameters for Multiple Objects

**Pattern**: Use instance parameters with `isGlobal: false` to create multiple 3D objects.

```typescript
// Each instance creates a cube
{this.instances?.map((instance, index) => (
  <Box
    key={index}
    args={[
      instance['cube-size'] as number || 2,
      instance['cube-size'] as number || 2,
      instance['cube-size'] as number || 2
    ]}
    position={[
      instance['position-x'] as number || 0,
      instance['position-y'] as number || 0,
      instance['position-z'] as number || 0
    ]}
  >
    <meshStandardMaterial color={instance['cube-color'] as string || '#ff6b6b'} />
  </Box>
))}
```

**VizParameters**:
```json
[
  {
    "id": "cube-size",
    "isGlobal": false,  // ← Instance parameter
    "type": "NUMBER"
  },
  {
    "id": "position-x",
    "isGlobal": false,  // ← Instance parameter
    "type": "NUMBER"
  }
  // ... etc
]
```

**Location**: `001-3d-cube-threejs/DIGO_ARTIFACT_WORKING.json`

---

## 📋 Checklist for Creating Artifacts

### VizParameter Definition
- [ ] Use `export class Asset extends DigoAsset`
- [ ] Add `override` keyword to render method
- [ ] Spread operator FIRST: `{...instance, name: ..., value: ...}`
- [ ] Add `isArray: true` when linking to array DataColumns
- [ ] Use instance parameters (`isGlobal: false`) for row-varying data

### Package Dependencies
- [ ] React 19: Use `^19.0.0`
- [ ] Three.js: Use `@react-three/fiber` v9+ and `@react-three/drei` v9+
- [ ] Recharts: Use `^2.15.0` or latest
- [ ] Always use `"@digo-org/digo-api": "latest"`

### TimeArray Visualizations
- [ ] Identify pattern: Multiple series (A), Single array (B), or Inverted (C)
- [ ] Add `isArray: true` to array parameters
- [ ] Map timeArray to x-axis or series as appropriate
- [ ] Test with actual time-based data

### Recharts Specifics
- [ ] Use `fill` property for colors, not `color`
- [ ] Custom label renderers for complex positioning
- [ ] Control `labelLine` based on position mode

---

## 📁 Working Artifact Locations

All working artifacts are suffixed with `_WORKING.json`:

1. **Line Chart Variations**:
   - `tests/results/orchestrator/002-quarterly-revenue-line-chart/variations/A-multi-company-comparison-WORKING.json`
   - `tests/results/orchestrator/002-quarterly-revenue-line-chart/variations/B-single-line-quarterly-evolution-WORKING.json`
   - `tests/results/orchestrator/002-quarterly-revenue-line-chart/variations/C-multi-year-quarterly-comparison-WORKING.json`

2. **3D Cube**:
   - `tests/results/visuals-agent/001-3d-cube-threejs/DIGO_ARTIFACT_WORKING.json`

3. **Pie Chart**:
   - `tests/results/visuals-agent/002-pie-chart-recharts/DIGO_ARTIFACT_WORKING.json`

---

## 🎓 Agent Instruction Updates Needed

### Visuals Agent
- **ADD**: VizParameter supports `isArray` property
- **ADD**: Must set `isArray: true` when linking to array DataColumns
- **ADD**: React 19 requires @react-three/fiber v9+
- **ADD**: Recharts color mapping uses `fill` property
- **EMPHASIZE**: Spread operator MUST be first in object mapping
- **EMPHASIZE**: Always use named export, not default

### Links Agent
- **ADD**: Verify VizParameter has `isArray: true` when linking to array DataColumns
- **ADD**: Instance parameters required for row-varying data

### Data Agent
- **ADD**: TimeArray patterns documentation
- **ADD**: Guidance on when to use `isArray: true` on columns

---

## 🚀 Next Phase Recommendations

1. **Update Agent Instructions**: Incorporate all learnings into `.claude/agents/` files
2. **Create Reference Library**: Add working artifacts to official examples
3. **Schema Validation**: Update type definitions to include `isArray` on VizParameter
4. **Testing Suite**: Create automated tests for these patterns
5. **Documentation**: Update DIGO API docs with TimeArray patterns

---

**End of Document**
