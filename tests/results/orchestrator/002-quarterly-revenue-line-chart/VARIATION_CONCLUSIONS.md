# TimeArray Line Chart Variations - Complete Analysis

## Overview

This document summarizes the complete exploration of Test 002, where three different semantic variations of time-series line charts were developed to properly handle `timeArray` and `isArray` data columns.

---

## Original Problem

Test 002's initial implementation had a **semantic mismatch**:
- **Data**: Single row with array column `revenue: [125000, 148000, 162000, 195000]`
- **Visualization**: Instance parameters for `line-value`, `line-label`, `line-color`
- **Issue**: Instance parameters are per-row, but there was only ONE row - nothing to vary

This led to the creation of three properly designed variations.

---

## The Three Variations

### Variation A: Multiple Companies Quarterly Comparison

**Use Case:** Compare quarterly revenue across multiple companies

**Data Structure:**
- **Rows**: 3 companies (Company A, B, C)
- **timeArray**: 4 quarters (Q1-Q4 2024)
- **Columns**: `revenue` (isArray: true), `company_color`, `company_name`

**Visualization Pattern:**
- Each company becomes a separate line
- X-axis: Quarters from timeArray
- Y-axis: Revenue values
- Each line has its own color

**Implementation:**
```typescript
// Transform: timeArray indices become X-axis points
const chartData = this.timeArray?.map((timeLabel, timeIndex) => {
  const dataPoint: any = { name: timeLabel };

  // For each company, add its revenue at this time point
  this.instances?.forEach((instance) => {
    const companyName = instance['line-label'] as string;
    const revenueArray = instance['line-values'] as number[];
    dataPoint[companyName] = revenueArray[timeIndex];
  });

  return dataPoint;
});

// Render: Create a line for each company
{this.instances?.map((instance, idx) => (
  <Line
    key={idx}
    dataKey={instance['line-label'] as string}
    stroke={instance['line-color'] as string}
  />
))}
```

**Instance Parameters:**
- `line-values` (NUMBER, isArray: true) → Links to `revenue`
- `line-color` (COLOR) → Links to `company_color`
- `line-label` (TEXT) → Links to `company_name`

**Files:** `A-multi-company-comparison-WORKING.json`

---

### Variation B: Single Line Quarterly Evolution

**Use Case:** Show how ONE company's revenue evolved over quarters

**Data Structure:**
- **Rows**: 1 row (Company Revenue)
- **timeArray**: 4 quarters (Q1-Q4 2024)
- **Columns**: `revenue` (isArray: true)

**Visualization Pattern:**
- Single line showing quarterly evolution
- X-axis: Quarters from timeArray
- Y-axis: Revenue values
- Simple, clear time series

**Implementation:**
```typescript
// Direct access to the single row's array data
const firstRow = this.instances?.[0];
const revenueData = firstRow?.revenue as number[] || [];

// Map timeArray to chart data
const chartData = this.timeArray?.map((timeLabel, index) => ({
  name: timeLabel,
  revenue: revenueData[index] || 0
}));

// Render: Single line
<Line
  type="monotone"
  dataKey="revenue"
  stroke={this.globalParameters['line-color'] as string}
/>
```

**Parameters:**
- **NO instance parameters** (nothing to vary per-row)
- Only global parameters for styling (background, title, line-color, etc.)

**Critical Insight:**
- First attempt used instance parameter `line-values`, which failed (showed line at 0)
- Correct pattern: Direct access to `firstRow?.revenue` for single-row timeArray data

**Files:** `B-single-line-quarterly-evolution-WORKING.json` (v2 fixed version)

---

### Variation C: Multi-Year Quarterly Comparison

**Use Case:** Compare quarterly patterns across multiple years

**Data Structure:**
- **Rows**: 4 quarters (Q1, Q2, Q3, Q4)
- **timeArray**: 3 years (2022, 2023, 2024)
- **Columns**: `revenue` (isArray: true), `quarter_label`

**Visualization Pattern:**
- Each year becomes a separate line
- X-axis: Quarters (from row names)
- Y-axis: Revenue values
- Inverted structure: rows are categories, timeArray is series

**Implementation:**
```typescript
// Transform: rows become X-axis categories
const chartData = this.instances?.map((instance) => {
  const quarterName = instance['quarter-label'] as string;
  const yearlyValues = instance['quarter-values'] as number[];

  const dataPoint: any = { quarter: quarterName };

  // For each year in timeArray, add its value
  this.timeArray?.forEach((year, index) => {
    dataPoint[year] = yearlyValues[index] || 0;
  });

  return dataPoint;
});

// Render: Create a line for each year
{this.timeArray?.map((year, index) => (
  <Line
    key={index}
    dataKey={year}
    stroke={colors[index % colors.length]}
  />
))}
```

**Instance Parameters:**
- `quarter-values` (NUMBER, isArray: true) → Links to `revenue`
- `quarter-label` (TEXT) → Links to `quarter_label`

**Files:** `C-multi-year-quarterly-comparison-WORKING.json`

---

## Critical Patterns Discovered

### Pattern Decision Tree

```
Do you have timeArray + isArray columns?
├─ Multiple rows?
│  ├─ YES → Use instance parameters (Variation A, C)
│  │         - Loop over instances to create multiple lines
│  │         - Each instance has parameters for values, color, label
│  └─ NO → Use direct access (Variation B)
│            - Access firstRow?.columnName directly
│            - No instance parameters needed
```

### Instance Parameters vs Direct Access

**Use Instance Parameters:**
- Multiple rows (Variation A: 3 companies, Variation C: 4 quarters)
- Each row needs distinct values, colors, labels
- Parameters enable per-row customization
- Access via: `instance['parameter-id']`

**Use Direct Access:**
- Single row (Variation B: 1 company)
- Nothing to vary per-row
- Direct column access
- Access via: `this.instances?.[0]?.columnName`

### Spread Operator Position

**CRITICAL:** Always put `...instance` FIRST:

```typescript
// ✅ CORRECT
const data = this.instances?.map((instance) => ({
  ...instance,
  name: instance['line-label'],
  value: instance['line-values']
}));

// ❌ WRONG
const data = this.instances?.map((instance) => ({
  name: instance['line-label'],
  value: instance['line-values'],
  ...instance  // Overwrites name/value!
}));
```

---

## Data Flow Architecture

### For Instance Parameters (Variation A, C)

```
Data Column → LINKS → Instance Parameter → Asset.tsx
     ↓
revenue (isArray)  →  "line-values": "revenue"  →  instance['line-values']
company_color      →  "line-color": "company_color"  →  instance['line-color']
```

### For Direct Access (Variation B)

```
Data Column → Instance Property (no linking)
     ↓
revenue (isArray)  →  this.instances?.[0]?.revenue
```

---

## When to Use Each Variation

### Variation A: Multi-Entity Comparison
**Examples:**
- Multiple companies over same time period
- Multiple products sales over months
- Multiple regions revenue over quarters

**Key Characteristic:** Comparing different entities over the same time dimension

### Variation B: Single Entity Evolution
**Examples:**
- Single company revenue growth
- User count over time
- Stock price history

**Key Characteristic:** Tracking one entity's changes over time

### Variation C: Recurring Periods Across Dimensions
**Examples:**
- Year-over-year quarterly patterns
- Month-over-month daily patterns
- Seasonal analysis across years

**Key Characteristic:** Comparing patterns (quarters, months) across different dimensions (years)

---

## Key Implementation Details

### 1. Global vs Instance Parameters

**Global Parameters (`isGlobal: true`):**
- Apply to entire visualization
- Examples: background-color, chart-title, show-grid, line-width
- One value for all instances

**Instance Parameters (`isGlobal: false`):**
- Apply per data row
- Examples: line-values, line-color, line-label
- Different value for each instance
- **Only needed when you have multiple rows**

### 2. Recharts Line Chart Pattern

```typescript
// Data transformation
const chartData = this.timeArray?.map(/* transform logic */);

// Render
<ResponsiveContainer>
  <LineChart data={chartData}>
    <XAxis dataKey="name" />
    <YAxis />
    <Tooltip />
    <Legend />
    {/* Dynamic line creation */}
    {this.instances?.map((instance, idx) => (
      <Line
        key={idx}
        dataKey={instance['line-label']}
        stroke={instance['line-color']}
      />
    ))}
  </LineChart>
</ResponsiveContainer>
```

### 3. TypeScript Type Assertions

Always use type assertions for parameter access:
```typescript
const revenueArray = instance['line-values'] as number[];
const companyName = instance['line-label'] as string;
const lineColor = instance['line-color'] as string;
```

---

## Files Reference

### Working Artifacts (Ready to Test)
- `A-multi-company-comparison-WORKING.json` - Multi-company comparison
- `B-single-line-quarterly-evolution-WORKING.json` - Single entity evolution (v2, direct access)
- `C-multi-year-quarterly-comparison-WORKING.json` - Multi-year quarterly patterns

### Failed Attempts (For Learning)
- `B-single-line-quarterly-evolution-FIXED.json` - First fix attempt (used instance parameters, failed)
- `B-single-line-quarterly-evolution.json` - Original (no linkable parameters)

---

## Lessons for Agent Instructions

### For Visuals Agent:

1. **Multi-row timeArray visualizations**: Use instance parameters with `isGlobal: false`
2. **Single-row timeArray visualizations**: Use direct access, NO instance parameters needed
3. **Spread operator**: Always put `...instance` FIRST in object mapping
4. **Dynamic component rendering**: Use `.map()` to create multiple `<Line>` components

### For Links Agent:

1. Only create links for instance parameters (`isGlobal: false`)
2. No links needed for single-row timeArray visualizations (direct access pattern)
3. Verify parameter types match column types

### For Data Agent:

1. `isArray: true` on columns when data varies over timeArray
2. Each row's array should have length matching timeArray length
3. Consider semantic meaning: are rows entities or recurring periods?

---

## Testing Results

All three working variations:
- ✅ Proper schema compliance
- ✅ Correct use of instance parameters vs direct access
- ✅ Working LINKS for multi-row patterns
- ✅ Empty LINKS for single-row pattern
- ✅ Proper spread operator positioning
- ✅ Named exports (`export class Asset extends DigoAsset`)

---

**End of Document**
