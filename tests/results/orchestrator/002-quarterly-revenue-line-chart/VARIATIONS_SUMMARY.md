# Test 002: Line Chart Variations Summary

## Problem Identified

The original test 002 had a **semantic mismatch** between data structure and visualization:

- **Data:** Time series with quarters in `timeArray` and a single row with revenue array
- **Visualization:** Instance-based parameters (`line-value`, `line-label`, `line-color`) expecting multiple rows
- **Result:** Works technically but makes no semantic sense - unlinked parameters with nowhere to map

## Solution: Three Semantic Variations

Created three variations that properly handle time series data with different use cases:

### ✅ Variation A: Multi-Company Quarterly Comparison
**File:** `variations/A-multi-company-comparison.json`

**Scenario:** Compare 3 companies' quarterly revenue over 2024

**Data:**
- 3 rows (Company A, B, C)
- 4 quarters in timeArray
- Each company has revenue array with 4 values

**Visualization:**
- 3 overlapping lines (one per company)
- X-axis: Quarters
- Y-axis: Revenue
- Each line has unique color

**Pattern:** Rows = Entities, timeArray = Time periods

---

### ✅ Variation B: Single Line Quarterly Evolution
**File:** `variations/B-single-line-quarterly-evolution.json`

**Scenario:** Track ONE company's revenue evolution across quarters

**Data:**
- 1 row (Company Revenue)
- 4 quarters in timeArray
- Single revenue array with 4 values

**Visualization:**
- Single line showing quarterly growth
- X-axis: Quarters
- Y-axis: Revenue
- Clean, simple time series

**Pattern:** Single entity, timeArray = Time periods

---

### ✅ Variation C: Multi-Year Quarterly Comparison
**File:** `variations/C-multi-year-quarterly-comparison.json`

**Scenario:** Compare quarterly patterns across 2022, 2023, 2024

**Data:**
- 4 rows (Q1, Q2, Q3, Q4)
- 3 years in timeArray
- Each quarter has revenue array with 3 values (one per year)

**Visualization:**
- 3 overlapping lines (one per year)
- X-axis: Quarters (Q1-Q4)
- Y-axis: Revenue
- Each year has unique color

**Pattern:** Rows = Recurring time periods, timeArray = Comparison dimension

---

## Key Technical Patterns

### Pattern 1: timeArray → chartData (Variation A & B)
```typescript
const chartData = this.timeArray?.map((timeLabel, timeIndex) => {
  // Create data point for this time period
  const dataPoint = { name: timeLabel, ... };
  // Extract values from instances at this timeIndex
  return dataPoint;
});
```

### Pattern 2: instances → chartData (Variation C)
```typescript
const chartData = this.instances?.map((instance) => {
  // Create data point for this instance (quarter)
  const dataPoint = { name: instance.name };
  // Extract values across timeArray for this instance
  return dataPoint;
});
```

### Pattern 3: Dynamic Line Creation
```typescript
{this.instances?.map((instance) => (
  <Line
    key={instance.id}
    dataKey={instance.name}
    stroke={instance['color']}
  />
))}
```

## Files Created

```
002-quarterly-revenue-line-chart/
├── variations/
│   ├── A-multi-company-comparison.json       (Complete DIGO artifact)
│   ├── B-single-line-quarterly-evolution.json (Complete DIGO artifact)
│   ├── C-multi-year-quarterly-comparison.json (Complete DIGO artifact)
│   └── README.md                              (Detailed documentation)
└── VARIATIONS_SUMMARY.md                      (This file)
```

## Testing Instructions

Each variation file is a complete, ready-to-test DIGO artifact:

```bash
# Copy any variation to clipboard and paste into DIGO app
cat variations/A-multi-company-comparison.json
cat variations/B-single-line-quarterly-evolution.json
cat variations/C-multi-year-quarterly-comparison.json
```

## Lessons Learned

1. **Time series data requires semantic planning:** Match visualization type to data structure
2. **timeArray can serve different roles:** Time periods OR comparison dimensions
3. **Rows can represent different things:** Entities OR recurring time periods
4. **Dynamic line creation:** Essential for multi-line charts
5. **Data transformation patterns:** Two main patterns depending on data orientation

## Next Steps

1. Test all three variations in DIGO app
2. Document which pattern works best for different use cases
3. Update agent instructions with time series handling guidelines
4. Consider creating specialized time series visualization templates
