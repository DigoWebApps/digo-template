# Fix Explanation: Adding Linkable Instance Parameters

## Problem with Original Variations

All three original variations had **NO linkable instance parameters**, which meant:
- No parameters showed up in the DIGO UI to link
- The visualization accessed data directly from `instance['revenue']` and `instance.name`
- The LINKS object was empty (`{}`)

**Why this is wrong:**
In DIGO, visualizations must expose **instance parameters** (isGlobal: false) that can be **linked** to data table columns. This creates the connection between data and visualization.

## The Fix

Each fixed variation now includes:

### 1. Instance Parameters in definition.json
```json
{
  "id": "line-values",
  "name": "Line Values",
  "isGlobal": false,  // Makes it an instance parameter
  "group": "Data",
  "type": "NUMBER",
  "definition": { "defaultValue": 0, "min": 0 }
}
```

### 2. LINKS Object
```json
"LINKS": {
  "line-values": "revenue"  // Links parameter to data column
}
```

### 3. Asset.tsx Accesses Parameters (Not Direct Data)
```typescript
// ❌ WRONG - Direct data access
const revenueArray = instance['revenue'] as number[];

// ✅ CORRECT - Access through parameter
const revenueArray = instance['line-values'] as number[];
```

## Fixed Variations

### Variation A - Multi-Company Comparison (FIXED)

**Instance Parameters Added:**
- `line-values` (NUMBER) → Links to `revenue` column
- `line-color` (COLOR) → Links to `company_color` column
- `line-label` (TEXT) → Links to `company_name` column

**LINKS:**
```json
{
  "line-values": "revenue",
  "line-color": "company_color",
  "line-label": "company_name"
}
```

**Asset.tsx Changes:**
```typescript
// Accesses parameters instead of direct data
const companyName = instance['line-label'] as string;
const revenueArray = instance['line-values'] as number[];
const lineColor = instance['line-color'] as string;
```

---

### Variation B - Single Line Evolution (FIXED)

**Instance Parameters Added:**
- `line-values` (NUMBER) → Links to `revenue` column

**LINKS:**
```json
{
  "line-values": "revenue"
}
```

**Asset.tsx Changes:**
```typescript
// Accesses parameter
const revenueArray = this.instances?.[0]?.['line-values'] as number[] || [];
```

**Note:** For single line visualization, `line-color` is kept as a **global parameter** since there's only one line. No need for per-instance colors.

---

### Variation C - Multi-Year Comparison (FIXED)

**Instance Parameters Added:**
- `quarter-values` (NUMBER) → Links to `revenue` column
- `quarter-label` (TEXT) → Links to `quarter_label` column

**LINKS:**
```json
{
  "quarter-values": "revenue",
  "quarter-label": "quarter_label"
}
```

**Asset.tsx Changes:**
```typescript
// Accesses parameters
const quarterName = instance['quarter-label'] as string;
const revenueArray = instance['quarter-values'] as number[];
```

**Note:** Year colors are hardcoded in an array since years come from timeArray, not rows.

---

## Key Principles

### 1. Parameters are the Interface
**Data flows through parameters:**
```
Data Column → LINKS → Instance Parameter → Asset.tsx
```

### 2. isGlobal Determines Scope
- **isGlobal: true** → One value for entire visualization (background color, title)
- **isGlobal: false** → One value per row (line values, colors, labels)

### 3. Every Linkable Value Needs a Parameter
If you want to link a data column to the visualization, you MUST:
1. Create an instance parameter (isGlobal: false) in definition.json
2. Add the link in LINKS object
3. Access it through `instance['parameter-id']` in asset.tsx

### 4. Parameter Types Must Match Column Types
- NUMBER column → NUMBER parameter
- COLOR column → COLOR parameter
- TEXT column → TEXT parameter
- isArray column → Access as array: `instance['param'] as number[]`

## Testing the Fixed Variations

All three fixed variations now have proper linkable parameters:

```bash
# Variation A - Multi-company (3 linkable parameters)
cat variations/A-multi-company-comparison-FIXED.json

# Variation B - Single line (1 linkable parameter)
cat variations/B-single-line-quarterly-evolution-FIXED.json

# Variation C - Multi-year (2 linkable parameters)
cat variations/C-multi-year-quarterly-comparison-FIXED.json
```

When you paste these into DIGO:
1. You'll see the instance parameters in the Visuals panel
2. You can link them to data columns
3. The LINKS object pre-populates these connections
4. The visualization will work correctly
