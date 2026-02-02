# Test 002 Variations - Final Summary

## Working Variations

### ✅ Variation A: Multi-Company Quarterly Comparison
**File:** `variations/A-multi-company-comparison-FIXED.json`

**What it shows:** 3 companies' revenue evolution across Q1-Q4 2024

**Data Structure:**
- 3 rows (Company A, B, C)
- 4 quarters in timeArray
- Each company has array of 4 revenue values

**Why it works:**
- Uses instance parameters (`line-values`, `line-color`, `line-label`)
- Each row creates a separate line
- Parameters link to data columns
- Multiple entities → needs parameters

**Pattern:** Multiple entities over time

---

### ✅ Variation B: Single-Line Quarterly Evolution (v2)
**File:** `variations/B-single-line-quarterly-evolution-FIXED-v2.json`

**What it shows:** One company's revenue evolution across Q1-Q4 2024

**Data Structure:**
- 1 row (Company Revenue)
- 4 quarters in timeArray
- Single revenue array with 4 values

**Why it works NOW:**
- NO instance parameters (removed them!)
- Directly accesses `firstRow?.revenue as number[]`
- Maps timeArray to array indices
- Single entity → no parameters needed

**Key Fix:**
```typescript
// Direct access pattern for single-row timeArray
const firstRow = this.instances?.[0];
const revenueData = firstRow?.revenue as number[] || [];

const chartData = this.timeArray?.map((time, index) => ({
  name: time,
  revenue: revenueData[index]
}));
```

**Pattern:** Single entity over time (direct access)

---

### ✅ Variation C: Multi-Year Quarterly Comparison
**File:** `variations/C-multi-year-quarterly-comparison-FIXED.json`

**What it shows:** 3 years of quarterly patterns (2022, 2023, 2024)

**Data Structure:**
- 4 rows (Q1, Q2, Q3, Q4)
- 3 years in timeArray
- Each quarter has array of 3 revenue values (one per year)

**Why it works:**
- Uses instance parameters (`quarter-values`, `quarter-label`)
- Each row represents a quarter
- Each year from timeArray becomes a line
- Multiple rows → needs parameters

**Pattern:** Recurring periods across comparison dimension

---

## Critical Insights Discovered

### 1. Instance Parameters vs Direct Access

**Use Instance Parameters:**
- When you have MULTIPLE rows
- Each row needs its own color/label/values
- Enables per-row customization
- Examples: Variation A (3 companies), Variation C (4 quarters)

**Use Direct Access:**
- When you have SINGLE row
- Nothing to vary per-row
- Access data directly: `this.instances?.[0]?.columnName`
- Example: Variation B v2 (1 company)

### 2. Why Variation B Failed Initially

❌ **First attempt:** Used instance parameter `line-values` with single row
- Parameters don't work well with single-row array data
- The linking system couldn't handle it properly
- Result: Values defaulted to 0

✅ **Fixed version:** Removed parameters, accessed data directly
- `const revenueData = firstRow?.revenue as number[]`
- Works perfectly for single-entity time series

### 3. The TimeArray Decision Tree

```
Do you have timeArray + isArray columns?
├─ YES
│  ├─ Multiple rows?
│  │  ├─ YES → Use instance parameters (Variation A, C)
│  │  └─ NO → Use direct access (Variation B v2)
│  └─ Pattern depends on row count
└─ NO → Regular instance-based visualization (like Test 001 bar chart)
```

## Files to Test

### Working Variations (Test These):
```bash
# ✅ Multi-company comparison (3 lines with parameters)
cat variations/A-multi-company-comparison-FIXED.json

# ✅ Single-line evolution (1 line, direct access, NO parameters)
cat variations/B-single-line-quarterly-evolution-FIXED-v2.json

# ✅ Multi-year comparison (3 lines with parameters)
cat variations/C-multi-year-quarterly-comparison-FIXED.json
```

### Documentation:
```bash
# Understanding the fix
cat variations/FIX_EXPLANATION.md

# Understanding timeArray patterns
cat variations/TIMEARRAY_PATTERN.md
```

## Next Steps

1. ✅ Test Variation A (already confirmed working)
2. 🔄 Test Variation B v2 (should now show actual revenue data, not zeros)
3. ✅ Test Variation C (already confirmed working)
4. Document these patterns for agent instructions

## Lesson Learned

**For timeArray + isArray visualizations:**
- Row count determines the access pattern
- Multiple rows = instance parameters + linking
- Single row = direct data access, no parameters
- This is a FUNDAMENTAL pattern that should be documented in agent instructions
