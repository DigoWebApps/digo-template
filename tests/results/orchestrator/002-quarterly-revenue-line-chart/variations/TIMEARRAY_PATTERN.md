# TimeArray Visualization Pattern - Critical Insight

## The Problem with Variation B (First Attempt)

**Why it showed a line at 0:**

The first fix attempted to use **instance parameters** (`line-values`) to access the array data, but this doesn't work for timeArray-based visualizations with a single row because:

1. Instance parameters expect one value per row
2. With only ONE row, there's nothing to "link" in a meaningful way
3. The parameter `line-values` was trying to hold an array, but the linking system doesn't handle this correctly
4. Result: The visualization couldn't access the array values, defaulted to 0

## The Correct Pattern: Direct Data Access for TimeArray

**For timeArray + isArray visualizations with a single row, do NOT use instance parameters. Access data directly:**

```typescript
// ✅ CORRECT for single-row timeArray visualization
const firstRow = this.instances?.[0];
const revenueData = firstRow?.revenue as number[] || [];

const chartData = this.timeArray?.map((timeLabel, index) => ({
  name: timeLabel,
  revenue: revenueData[index] || 0
})) || [];
```

**Why this works:**
- Directly accesses the row's array column (`revenue`)
- Maps timeArray indices to array values
- No parameters needed because there's only one row (nothing to vary per-row)

## When to Use Instance Parameters vs Direct Access

### Use Instance Parameters When:
✅ **Multiple rows** (Variation A, C)
- Each row represents a different entity (company, quarter, product)
- Need to loop over `this.instances` to create multiple lines/bars
- Each instance needs its own parameters: color, label, values
- Pattern: Parameters enable per-row customization

**Example (Variation A):**
```typescript
// 3 companies → 3 lines → need instance parameters
this.instances?.forEach((instance) => {
  const companyName = instance['line-label'];  // Parameter
  const revenueArray = instance['line-values']; // Parameter
  // Create line for this company
});
```

### Use Direct Access When:
✅ **Single row with timeArray** (Variation B v2)
- Only one entity being tracked over time
- timeArray provides the X-axis labels
- The single row's array column provides Y-axis values
- Pattern: Direct access because there's nothing to vary per-row

**Example (Variation B v2):**
```typescript
// 1 company → 1 line → no instance parameters needed
const firstRow = this.instances?.[0];
const revenueData = firstRow?.revenue as number[];  // Direct access

const chartData = this.timeArray?.map((time, i) => ({
  name: time,
  revenue: revenueData[i]
}));
```

## Three TimeArray Patterns

### Pattern 1: Multiple Entities Over Time (Variation A)
**Data Structure:**
- Rows = Entities (companies)
- timeArray = Time periods (quarters)
- Columns with isArray = true (revenue per time period)

**Visualization:**
- Multiple lines (one per entity)
- X-axis: timeArray
- Y-axis: Array values

**Access Pattern:**
```typescript
const chartData = this.timeArray?.map((time, timeIndex) => {
  const point: any = { name: time };
  this.instances?.forEach((instance) => {
    const values = instance['line-values'] as number[];  // Via parameter
    point[instance['line-label']] = values[timeIndex];
  });
  return point;
});
```

**Uses:** Instance parameters (multiple rows)

---

### Pattern 2: Single Entity Over Time (Variation B v2)
**Data Structure:**
- Rows = Single entity
- timeArray = Time periods (quarters)
- Columns with isArray = true (revenue per time period)

**Visualization:**
- Single line
- X-axis: timeArray
- Y-axis: Array values

**Access Pattern:**
```typescript
const firstRow = this.instances?.[0];
const values = firstRow?.revenue as number[];  // Direct access

const chartData = this.timeArray?.map((time, index) => ({
  name: time,
  revenue: values[index]
}));
```

**Uses:** Direct access (single row, no parameters needed)

---

### Pattern 3: Recurring Periods Across Dimensions (Variation C)
**Data Structure:**
- Rows = Recurring periods (Q1, Q2, Q3, Q4)
- timeArray = Comparison dimension (2022, 2023, 2024)
- Columns with isArray = true (revenue per year)

**Visualization:**
- Multiple lines (one per year from timeArray)
- X-axis: Row labels (quarters)
- Y-axis: Array values

**Access Pattern:**
```typescript
const chartData = this.instances?.map((instance) => {
  const point: any = { name: instance['quarter-label'] };  // Via parameter
  this.timeArray?.forEach((year, yearIndex) => {
    const values = instance['quarter-values'] as number[];  // Via parameter
    point[year] = values[yearIndex];
  });
  return point;
});
```

**Uses:** Instance parameters (multiple rows)

## Key Takeaway

**The decision between instance parameters vs direct access depends on the number of rows:**

- **Multiple rows** → Need instance parameters to distinguish between entities
- **Single row** → Use direct access, no parameters needed (nothing to vary)

This is why Variation B v2 removed instance parameters entirely and accesses `firstRow?.revenue` directly.
