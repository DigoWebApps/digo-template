# Test 002 Variations: Line Chart Time Series Patterns

## Problem with Original Test

The original test 002 had a **semantic mismatch** between data structure and visualization:

**Data Structure:**
- `timeArray`: ["Q1 2024", "Q2 2024", "Q3 2024", "Q4 2024"]
- `columns`: revenue (isArray: true)
- `rows`: Single row with revenue array [125000, 148000, 162000, 195000]

**Visualization Structure:**
- Expected instance parameters: `line-value`, `line-label`, `line-color`
- These are per-row parameters, but there's only ONE row
- The `line-label` and `line-color` instance parameters cannot be linked to anything meaningful

**Result:** The visualization works technically but makes no semantic sense - you have a time series data table but a non-time-series visualization setup.

## Three Semantic Variations

### Variation A: Multiple Companies Quarterly Comparison

**Use Case:** Compare quarterly revenue across multiple companies

**Data Structure:**
```json
{
  "timeArray": ["Q1 2024", "Q2 2024", "Q3 2024", "Q4 2024"],
  "rows": [
    {"name": "Company A", "revenue": [125000, 148000, 162000, 195000]},
    {"name": "Company B", "revenue": [98000, 115000, 138000, 156000]},
    {"name": "Company C", "revenue": [145000, 132000, 158000, 178000]}
  ]
}
```

**Visualization:**
- Each company (row) becomes a separate line
- X-axis: Quarters from timeArray
- Y-axis: Revenue values
- Each line has its own color (from `company_color` column)

**Key Pattern:**
```typescript
const chartData = this.timeArray?.map((timeLabel, timeIndex) => {
  const dataPoint: any = { name: timeLabel };

  // For each instance (company), add its value at this time point
  this.instances?.forEach((instance) => {
    const companyName = instance.name as string;
    const revenueArray = instance['revenue'] as number[];
    dataPoint[companyName] = revenueArray[timeIndex];
  });

  return dataPoint;
}) || [];
```

**Result:** Multiple overlapping lines, one per company, showing comparative growth patterns.

---

### Variation B: Single Line Showing Quarterly Evolution

**Use Case:** Show how ONE company's revenue evolved over quarters

**Data Structure:**
```json
{
  "timeArray": ["Q1 2024", "Q2 2024", "Q3 2024", "Q4 2024"],
  "rows": [
    {"name": "Company Revenue", "revenue": [125000, 148000, 162000, 195000]}
  ]
}
```

**Visualization:**
- Single line showing quarterly evolution
- X-axis: Quarters from timeArray
- Y-axis: Revenue values
- Simple, clear time series visualization

**Key Pattern:**
```typescript
const chartData = this.timeArray?.map((timeLabel, timeIndex) => {
  const revenueArray = this.instances?.[0]?.['revenue'] as number[] || [];

  return {
    name: timeLabel,
    revenue: revenueArray[timeIndex] || 0
  };
}) || [];
```

**Result:** Single line showing clear upward revenue trend across quarters.

---

### Variation C: Multi-Year Quarterly Comparison

**Use Case:** Compare quarterly patterns across multiple years

**Data Structure:**
```json
{
  "timeArray": ["2022", "2023", "2024"],
  "rows": [
    {"name": "Q1", "revenue": [98000, 112000, 125000]},
    {"name": "Q2", "revenue": [115000, 128000, 148000]},
    {"name": "Q3", "revenue": [132000, 145000, 162000]},
    {"name": "Q4", "revenue": [148000, 172000, 195000]}
  ]
}
```

**Visualization:**
- Each year becomes a separate line
- X-axis: Quarters (Q1, Q2, Q3, Q4) from rows
- Y-axis: Revenue values
- Each line represents a different year's performance

**Key Pattern:**
```typescript
const chartData = this.instances?.map((instance) => {
  const dataPoint: any = { name: instance.name as string };

  // For each year in timeArray, add its value
  this.timeArray?.forEach((year, yearIndex) => {
    const revenueArray = instance['revenue'] as number[];
    dataPoint[year] = revenueArray[yearIndex];
  });

  return dataPoint;
}) || [];
```

**Result:** Multiple lines showing year-over-year quarterly patterns - easy to see if Q4 is always highest, etc.

---

## Key Insights

### When to Use Each Variation

1. **Variation A (Multi-Company):**
   - Comparing multiple entities over the same time period
   - Each entity is a row, time periods in timeArray
   - Examples: Company comparison, product comparison, regional comparison

2. **Variation B (Single Evolution):**
   - Tracking one entity's changes over time
   - Simplest time series visualization
   - Examples: Revenue growth, user growth, stock price

3. **Variation C (Multi-Year):**
   - Comparing patterns across different time periods
   - Rows are recurring periods (quarters, months), timeArray is the comparison dimension (years)
   - Examples: Year-over-year comparison, seasonal pattern analysis

### Data Structure Patterns

**Pattern 1: Rows as Entities, timeArray as Time**
```
rows = [Entity1, Entity2, Entity3]
timeArray = [Time1, Time2, Time3, Time4]
columns[i].isArray = true
→ Use Variation A pattern
```

**Pattern 2: Single Entity, timeArray as Time**
```
rows = [SingleEntity]
timeArray = [Time1, Time2, Time3, Time4]
columns[i].isArray = true
→ Use Variation B pattern
```

**Pattern 3: Rows as Recurring Time, timeArray as Comparison Dimension**
```
rows = [Q1, Q2, Q3, Q4]
timeArray = [Year1, Year2, Year3]
columns[i].isArray = true
→ Use Variation C pattern
```

### Critical Implementation Details

1. **Spread Operator Position:** Always `...instance` FIRST in data mapping
2. **Dynamic Line Creation:** Use `.map()` over instances or timeArray to create multiple `<Line>` components
3. **Color Management:** Store colors in data columns or extract from instances
4. **Legend Configuration:** Essential for multi-line charts to identify each line
5. **Tooltip Formatting:** Currency formatting for revenue data

### Testing Each Variation

Each variation is a complete DIGO artifact ready to copy-paste:

```bash
# Variation A
cat variations/A-multi-company-comparison.json

# Variation B
cat variations/B-single-line-quarterly-evolution.json

# Variation C
cat variations/C-multi-year-quarterly-comparison.json
```

All three should render correctly in the DIGO app and demonstrate proper handling of time series data with different semantic structures.
