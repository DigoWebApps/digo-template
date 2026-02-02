# DIGO Agent Testing - Comprehensive Learnings for AI Agents

**Last Updated**: 2026-02-02
**Status**: All patterns validated and working

This document contains all technical learnings, patterns, and requirements discovered through testing. Use this as the authoritative source for creating DIGO artifacts.

---

## 🔥 Critical Rules (NEVER VIOLATE)

### 1. Spread Operator Position
**CRITICAL**: The spread operator `...instance` MUST be the FIRST property in object mapping.

```typescript
// ✅ CORRECT - Spread FIRST
const data = this.instances?.map((instance, index) => ({
  ...instance,  // FIRST - preserves all instance properties
  name: instance['bar-label'] as string,
  value: instance['bar-value'] as number
})) || [];

// ❌ WRONG - Spread LAST
const data = this.instances?.map((instance, index) => ({
  name: instance['bar-label'] as string,
  value: instance['bar-value'] as number,
  ...instance  // WRONG - overwrites name/value with original instance properties!
})) || [];
```

**Why**: JavaScript spread mechanics mean properties defined LATER override properties defined EARLIER. If `...instance` is last, it overwrites the simplified `name` and `value` properties, breaking `dataKey` references in visualization libraries.

---

### 2. Export Statement Pattern
**CRITICAL**: Always use named export, NEVER default export.

```typescript
// ✅ CORRECT
export class Asset extends DigoAsset { }

// ❌ WRONG
export default class Asset extends DigoAsset { }
```

**Why**: The DIGO runtime expects named exports.

---

### 3. Override Keyword
**REQUIRED**: Use `override` keyword on render method.

```typescript
export class Asset extends DigoAsset {
  constructor() {
    super();
  }

  override render() {  // ← override keyword required
    return <div>...</div>;
  }
}
```

---

## 📊 TimeArray Visualization Patterns

### Pattern Decision Tree

```
Do you have timeArray + columns with isArray: true?
├─ Multiple rows?
│  ├─ YES → Use instance parameters (Pattern A or C)
│  │         - Loop over this.instances to create multiple visual elements
│  │         - Each instance has parameters for values, color, label
│  └─ NO → Use direct access (Pattern B)
│            - Access this.instances?.[0]?.columnName directly
│            - NO instance parameters needed for array data
```

### Pattern A: Multiple Entities Over Time

**Use Case**: Compare multiple companies/products/regions over the same time period

**Data Structure**:
- **Rows**: 3+ entities (companies, products, regions)
- **timeArray**: Time periods (quarters, months)
- **Columns**: With `isArray: true` (values per time period)

**Example**:
```json
{
  "timeArray": ["Q1", "Q2", "Q3", "Q4"],
  "columns": [
    {"id": "revenue", "type": "NUMBER", "isArray": true}
  ],
  "rows": [
    {"name": "Company A", "revenue": [125000, 148000, 162000, 195000]},
    {"name": "Company B", "revenue": [98000, 115000, 138000, 156000]}
  ]
}
```

**Visualization Code**:
```typescript
// Transform: timeArray indices become X-axis points
const chartData = this.timeArray?.map((timeLabel, timeIndex) => {
  const dataPoint: any = { name: timeLabel };

  // For each entity, add its value at this time point
  this.instances?.forEach((instance) => {
    const label = instance['line-label'] as string;
    const values = instance['line-values'] as number[];
    dataPoint[label] = values?.[timeIndex] || 0;
  });

  return dataPoint;
}) || [];

// Render: Create visual element for each entity
{this.instances?.map((instance, idx) => (
  <Line
    key={idx}
    dataKey={instance['line-label'] as string}
    stroke={instance['line-color'] as string}
  />
))}
```

**Instance Parameters Needed**: YES
- `line-values` (NUMBER, isArray: true)
- `line-color` (COLOR)
- `line-label` (TEXT)

---

### Pattern B: Single Entity Over Time

**Use Case**: Track one entity's evolution over time

**Data Structure**:
- **Rows**: 1 row only
- **timeArray**: Time periods (quarters, months)
- **Columns**: With `isArray: true` (values per time period)

**Example**:
```json
{
  "timeArray": ["Q1", "Q2", "Q3", "Q4"],
  "columns": [
    {"id": "revenue", "type": "NUMBER", "isArray": true}
  ],
  "rows": [
    {"name": "Company Revenue", "revenue": [125000, 148000, 162000, 195000]}
  ]
}
```

**Visualization Code**:
```typescript
// Direct access to the single row's array data
const firstRow = this.instances?.[0];
const revenueData = firstRow?.revenue as number[] || [];

// Map timeArray to chart data
const chartData = this.timeArray?.map((timeLabel, index) => ({
  name: timeLabel,
  revenue: revenueData[index] || 0
})) || [];

// Render: Single visual element
<Line
  type="monotone"
  dataKey="revenue"
  stroke={this.globalParameters['line-color'] as string}
/>
```

**Instance Parameters Needed**: NO
- Use ONLY global parameters for styling
- Access data directly via column name
- NO linking needed (LINKS object is empty)

**Critical**: First attempts to use instance parameters for single-row timeArray failed. Direct access is the correct pattern.

---

### Pattern C: Recurring Periods Across Dimensions

**Use Case**: Compare quarterly patterns across years, or monthly patterns across quarters

**Data Structure**:
- **Rows**: Recurring periods (Q1, Q2, Q3, Q4 or Jan, Feb, Mar)
- **timeArray**: Comparison dimension (years, quarters)
- **Columns**: With `isArray: true` (values per comparison dimension)

**Example**:
```json
{
  "timeArray": ["2022", "2023", "2024"],
  "columns": [
    {"id": "revenue", "type": "NUMBER", "isArray": true}
  ],
  "rows": [
    {"name": "Q1", "revenue": [98000, 112000, 125000]},
    {"name": "Q2", "revenue": [115000, 128000, 148000]}
  ]
}
```

**Visualization Code**:
```typescript
// Rows become X-axis categories
const chartData = this.instances?.map((instance) => {
  const quarterName = instance['quarter-label'] as string;
  const yearlyValues = instance['quarter-values'] as number[];

  const dataPoint: any = { quarter: quarterName };

  // timeArray becomes the series
  this.timeArray?.forEach((year, index) => {
    dataPoint[year] = yearlyValues[index] || 0;
  });

  return dataPoint;
}) || [];

// Render: Create line for each year from timeArray
{this.timeArray?.map((year, index) => (
  <Line
    key={index}
    dataKey={year}
    stroke={colors[index % colors.length]}
  />
))}
```

**Instance Parameters Needed**: YES
- `quarter-values` (NUMBER, isArray: true)
- `quarter-label` (TEXT)

---

## 🎨 Recharts Specific Patterns

### Color Mapping

**CRITICAL**: Use `fill` property, not `color`.

```typescript
// ✅ CORRECT
const data = this.instances?.map((instance) => ({
  ...instance,
  name: instance['slice-label'] as string,
  value: instance['slice-value'] as number,
  fill: instance['slice-color'] as string  // ← Must be 'fill'
})) || [];

<Cell key={`cell-${index}`} fill={entry.fill} />

// ❌ WRONG - 'color' property doesn't work
const data = this.instances?.map((instance) => ({
  ...instance,
  color: instance['slice-color']  // ← Wrong property
}));

<Cell key={`cell-${index}`} fill={entry.color} />  // ← Won't work
```

### Pie Chart Custom Label Positioning

```typescript
const RADIAN = Math.PI / 180;

const renderCustomLabel = (props: any) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, name } = props;

  if (labelPosition === 'outside') {
    const radius = outerRadius + 20;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="#333"
        textAnchor={x > cx ? 'start' : 'end'}  // Smart anchoring
        dominantBaseline="central"
      >
        {name}
      </text>
    );
  } else {
    // Inside positioning
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor="middle">
        {name}
      </text>
    );
  }
};

<Pie
  labelLine={labelPosition === 'outside'}  // Control connecting lines
  label={showLabels ? renderCustomLabel : false}
/>
```

---

## 🏗️ Three.js Specific Patterns

### React 19 Compatibility

**CRITICAL**: @react-three/fiber v8 is incompatible with React 19.

```json
{
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "@react-three/fiber": "^9.0.0",      // ← v9+ REQUIRED
  "@react-three/drei": "^9.114.0",     // ← v9+ REQUIRED
  "three": "^0.169.0"
}
```

**Error Fixed**: `Cannot read properties of undefined (reading 'ReactCurrentOwner')`

### Instance Parameters for Multiple 3D Objects

```typescript
// Each instance creates a 3D object
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

---

## 📋 Parameter System

### Global vs Instance Parameters

**Global Parameters (`isGlobal: true`)**:
- Apply to entire visualization
- One value for all instances
- Examples: background-color, chart-title, show-grid, stroke-width
- Use for visualization-wide settings

**Instance Parameters (`isGlobal: false`)**:
- Apply per data row
- Different value for each instance
- Examples: bar-value, bar-color, bar-label, line-values
- **Only needed when you have multiple rows**
- Enable per-row customization

### Parameter Groups

Use capitalized group names:
- `Appearance` - Colors, visual styling
- `Layout` - Spacing, sizing, positioning
- `Text` - Labels, titles, fonts
- `Data` - Values, mappings
- `Interaction` - Tooltips, legends, hover states
- `Animation` - Transitions, durations
- `Camera` - 3D view controls
- `Lighting` - 3D scene lighting
- `Effects` - Shadows, blur, etc.
- `Transform` - Position, rotation, scale
- `Geometry` - Shape properties

---

## 📦 Package Dependencies

### Standard Dependencies (Always Include)

```json
{
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "@digo-org/digo-api": "latest",
  "main": "/index.tsx"
}
```

### Library-Specific

**Recharts**:
```json
{
  "recharts": "^2.15.0"
}
```

**Three.js**:
```json
{
  "@react-three/fiber": "^9.0.0",
  "@react-three/drei": "^9.114.0",
  "three": "^0.169.0"
}
```

---

## ✅ Validation Checklist

Before finalizing any artifact:

**Basic Structure**:
- [ ] Named export: `export class Asset extends DigoAsset`
- [ ] Override keyword on render method
- [ ] Spread operator FIRST in all object mappings
- [ ] No null values in data

**TimeArray Visualizations**:
- [ ] Identified correct pattern (A, B, or C)
- [ ] Pattern A/C: Instance parameters with isGlobal: false
- [ ] Pattern B: Direct access, NO instance parameters for array data
- [ ] timeArray mapped correctly (x-axis or series depending on pattern)

**Parameters**:
- [ ] Instance parameters for row-varying data (only if multiple rows)
- [ ] Global parameters for visualization-wide settings
- [ ] Proper grouping with capitalized names
- [ ] Type definitions include min/max/defaults where applicable

**Library-Specific**:
- [ ] React 19: Updated Three.js packages if using 3D
- [ ] Recharts: Using `fill` for colors
- [ ] Package.json has correct `main`: `/index.tsx`

**Files Required**:
- [ ] `/asset.tsx` - React component
- [ ] `/package.json` - Dependencies
- [ ] `/styles.css` - CSS (can be empty string)
- [ ] `/definition.json` - VizParameter array

---

## 📁 Working Examples Location

All working artifacts with `_WORKING.json` suffix:

1. **Line Charts**:
   - `tests/results/orchestrator/002-quarterly-revenue-line-chart/variations/A-multi-company-comparison-WORKING.json`
   - `tests/results/orchestrator/002-quarterly-revenue-line-chart/variations/B-single-line-quarterly-evolution-WORKING.json`
   - `tests/results/orchestrator/002-quarterly-revenue-line-chart/variations/C-multi-year-quarterly-comparison-WORKING.json`

2. **3D Visualization**:
   - `tests/results/visuals-agent/001-3d-cube-threejs/DIGO_ARTIFACT_WORKING.json`

3. **Pie Chart**:
   - `tests/results/visuals-agent/002-pie-chart-recharts/DIGO_ARTIFACT_WORKING.json`

4. **Bar Chart**:
   - `tests/results/orchestrator/001-complete-bar-chart-project/`

---

## 🚨 Common Mistakes to Avoid

1. **Spread operator last**: Will break visualization rendering
2. **Default export**: Runtime won't find the component
3. **Using instance parameters for single-row timeArray**: Use direct access instead
4. **Recharts color property**: Use `fill` not `color`
5. **Three.js v8 with React 19**: Update to v9+
6. **Null values in data**: Replace with appropriate defaults
7. **Missing override keyword**: May cause inheritance issues

---

**Document End**
