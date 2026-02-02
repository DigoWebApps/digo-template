# Critical Discovery: VizParameter isArray Property

## The Problem

All three variations were showing incorrect behavior (Variation B showing line at 0, others potentially not working correctly) because the instance parameters were **missing the `isArray` property**.

## The Root Cause

The visuals-agent.md instructions contained **WRONG INFORMATION**:

❌ **Incorrect statement (now removed):**
> "VizParameter objects should NEVER have an `isArray` property - this only exists on DataColumn definitions, NOT on VizParameter definitions"

✅ **Truth (from schema):**
VizParameter DOES support `isArray` as an optional property:

```typescript
export interface VizParameter extends Parameter {
  id:       string;
  name:     string;
  isGlobal: boolean;
  group?:   string;
  isArray?: boolean;  // ← This DOES exist!
}
```

## When to Use isArray on VizParameters

### Rule: Match the DataColumn Structure

**If linking to a DataColumn with `isArray: true`, the VizParameter MUST have `isArray: true`**

### Example: TimeArray Data

**DataColumn:**
```json
{
  "id": "revenue",
  "type": "NUMBER",
  "isArray": true,  // ← Array column
  "definition": { "defaultValue": 0, "min": 0 }
}
```

**VizParameter (MUST match):**
```json
{
  "id": "line-values",
  "name": "Line Values",
  "isGlobal": false,
  "group": "Data",
  "type": "NUMBER",
  "isArray": true,  // ← MUST be true to receive array!
  "definition": { "defaultValue": 0, "min": 0 }
}
```

**LINK:**
```json
"LINKS": {
  "line-values": "revenue"
}
```

**Result:** `instance['line-values']` receives the entire array: `[125000, 148000, 162000, 195000]`

## What Happens Without isArray

### ❌ Without isArray: true

```json
{
  "id": "line-values",
  "isGlobal": false,
  "type": "NUMBER",
  // Missing: "isArray": true
  "definition": { "defaultValue": 0 }
}
```

**Result:**
- Parameter cannot receive array data correctly
- Values default to 0 or undefined
- Visualization shows incorrect/empty data

### ✅ With isArray: true

```json
{
  "id": "line-values",
  "isGlobal": false,
  "type": "NUMBER",
  "isArray": true,  // ← Added!
  "definition": { "defaultValue": 0 }
}
```

**Result:**
- Parameter receives full array from linked column
- `instance['line-values'] as number[]` returns actual data
- Visualization displays correctly

## Fixed Variations

All three variations now have correct `isArray: true` on array parameters:

### Variation A - Multi-Company
```json
{
  "id": "line-values",
  "name": "Line Values",
  "isGlobal": false,
  "type": "NUMBER",
  "isArray": true,  // ← Added
  "definition": { "defaultValue": 0, "min": 0 }
}
```

### Variation B - Single Line
```json
{
  "id": "line-values",
  "name": "Line Values",
  "isGlobal": false,
  "type": "NUMBER",
  "isArray": true,  // ← Added
  "definition": { "defaultValue": 0, "min": 0 }
}
```

### Variation C - Multi-Year
```json
{
  "id": "quarter-values",
  "name": "Quarter Values",
  "isGlobal": false,
  "type": "NUMBER",
  "isArray": true,  // ← Added
  "definition": { "defaultValue": 0, "min": 0 }
}
```

## The Complete Pattern for TimeArray Visualizations

### Data Structure
```json
{
  "timeArray": ["Q1", "Q2", "Q3", "Q4"],
  "columns": [
    {
      "id": "revenue",
      "type": "NUMBER",
      "isArray": true  // ← Array column
    }
  ]
}
```

### VizParameter Definition
```json
{
  "id": "line-values",
  "isGlobal": false,
  "type": "NUMBER",
  "isArray": true,  // ← MUST match DataColumn
  "definition": { "defaultValue": 0 }
}
```

### LINKS
```json
{
  "line-values": "revenue"
}
```

### Asset.tsx Access
```typescript
// Access the array parameter
const revenueArray = instance['line-values'] as number[];

// Use with timeArray
const chartData = this.timeArray?.map((time, index) => ({
  name: time,
  value: revenueArray[index]
}));
```

## Key Takeaways

1. **VizParameter DOES support isArray** - the agent instructions were wrong
2. **isArray must match between DataColumn and VizParameter** when linked
3. **Without isArray on the parameter**, array data cannot be received correctly
4. **This applies to ALL array-based visualizations** - not just timeArray

## Testing Status

After adding `isArray: true`:
- ✅ Variation A: Should work (already was working)
- 🔄 Variation B: Should NOW show actual revenue line (was showing 0s)
- ✅ Variation C: Should work (already was working)

## Next Steps

1. Test Variation B with the fix
2. Document this pattern in agent instructions
3. Add validation in test harness to check isArray consistency between parameters and linked columns
