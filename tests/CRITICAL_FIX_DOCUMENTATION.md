# Critical Fix: Spread Operator Position in Data Mapping

## Problem Discovery

Test 001 (bar chart) was not displaying any graph even though there were no errors and the links were properly configured. The issue was identified by comparing with a working example provided by the user.

## Root Cause

**The position of the spread operator (`...instance`) in the data mapping was incorrect.**

### What Was Wrong

```typescript
// ❌ INCORRECT - Spread at the END
const chartData = this.instances?.map((instance, index) => ({
  name: instance['bar-label'] as string || `Item ${index + 1}`,
  value: instance['bar-value'] as number || 0,
  color: instance['bar-color'] as string || '#3b82f6',
  ...instance  // This overwrites name and value!
})) || [];
```

**Problem:** When `...instance` is placed at the END of the object literal, it spreads all properties from the instance object AFTER we've defined `name`, `value`, and `color`. This means if the instance object has its own properties, they will OVERWRITE our simplified `name` and `value` properties.

### Correct Pattern

```typescript
// ✅ CORRECT - Spread at the BEGINNING
const chartData = this.instances?.map((instance, index) => ({
  ...instance,  // Spread all properties FIRST
  name: instance['bar-label'] || `Item ${index + 1}`,
  value: instance['bar-value']
})) || [];
```

**Solution:** When `...instance` is placed at the BEGINNING, it spreads all instance properties first, and THEN we override specific properties (`name` and `value`) with our simplified versions. This ensures that Recharts (and other visualization libraries) receive clean, predictable property names for their `dataKey` references.

## Why This Matters

### JavaScript Object Spread Mechanics

In JavaScript, when you use the spread operator in an object literal, the ORDER matters:

```javascript
// Properties defined LATER override properties defined EARLIER
const obj = {
  ...{ a: 1, b: 2 },
  b: 3  // Overrides b from the spread
};
// Result: { a: 1, b: 3 }

// Properties defined EARLIER are overridden by the spread
const obj2 = {
  b: 3,
  ...{ a: 1, b: 2 }  // Spread overrides b
};
// Result: { a: 1, b: 2 }
```

### Impact on Visualization Libraries

Recharts (and most charting libraries) use `dataKey` props to specify which property to read from the data array:

```typescript
<XAxis dataKey="name" />
<Bar dataKey="value" />
```

If our data objects don't have clean `name` and `value` properties (because they were overwritten by the spread), the chart won't render correctly.

## Complete Working Example

```typescript
import { DigoAsset } from '@digo-org/digo-api';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell
} from 'recharts';

export class Asset extends DigoAsset {
  constructor() {
    super();
  }

  override render() {
    // CRITICAL: ...instance comes FIRST
    const chartData = this.instances?.map((instance, index) => ({
      ...instance,
      name: instance['bar-label'] || `Item ${index + 1}`,
      value: instance['bar-value']
    })) || [];

    return (
      <div style={{
        width: '100%',
        height: '100%',
        backgroundColor: this.globalParameters['background-color'] as string || '#ffffff',
        padding: (this.globalParameters['chart-padding'] as number || 20) + 'px',
        fontFamily: 'sans-serif',
        boxSizing: 'border-box'
      }}>
        {this.globalParameters['show-title'] && (
          <h2 style={{
            textAlign: 'center',
            margin: '0 0 20px 0',
            fontSize: '24px',
            color: '#1f2937',
            fontWeight: 'bold',
          }}>
            {this.globalParameters['chart-title'] as string || 'Bar Chart'}
          </h2>
        )}

        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            {this.globalParameters['show-grid'] && (
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            )}

            <XAxis dataKey="name" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />

            {this.globalParameters['show-tooltip'] && (
              <Tooltip cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }} />
            )}

            <Bar
              dataKey="value"
              radius={[
                this.globalParameters['bar-radius'] as number || 4,
                this.globalParameters['bar-radius'] as number || 4,
                0,
                0
              ]}
              animationDuration={200}
              animationEasing={'ease-in-out'}
            >
              {chartData.map((instance, index) => {
                const fillColor = instance['bar-color'] as string || '#3b82f6';
                return (
                  <Cell key={`cell-${index}`} fill={fillColor} />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }
}
```

## Files Updated

### 1. Visuals Agent Instructions
**File:** `.claude/agents/visuals-agent.md`

**Changes:**
- Added comprehensive "Instance Parameters - CRITICAL MAPPING PATTERN" section
- Included side-by-side comparison of correct vs incorrect patterns
- Added explanation of why spread position matters
- Added complete working example
- Added critical reminder about spread operator position

### 2. Test Artifacts

**Updated with correct pattern:**
1. `tests/results/orchestrator/001-complete-bar-chart-project/artifacts/code-files/asset.tsx`
2. `tests/results/orchestrator/001-complete-bar-chart-project/DIGO_ARTIFACT.json`
3. `tests/results/orchestrator/002-quarterly-revenue-line-chart/artifacts/code-files/asset.tsx`
4. `tests/results/orchestrator/002-quarterly-revenue-line-chart/DIGO_ARTIFACT.json`
5. `tests/results/visuals-agent/002-pie-chart-recharts/DIGO_ARTIFACT.json`

**No changes needed:**
- `tests/results/visuals-agent/001-3d-cube-threejs/DIGO_ARTIFACT.json` (uses only global parameters)

## Testing Status

✅ **Test 001 - Bar Chart**: Working correctly (confirmed by user)
🔄 **Test 002 - Line Chart**: Updated, ready for testing
🔄 **Visuals Test 002 - Pie Chart**: Updated, ready for testing
✅ **Visuals Test 001 - 3D Cube**: Working (no instances used)

## Key Takeaways

1. **Spread operator position is CRITICAL** - Always put `...instance` FIRST
2. **JavaScript object spread order matters** - Later properties override earlier ones
3. **Visualization libraries expect predictable property names** - Clean `name` and `value` properties
4. **This pattern applies universally** - Works for Recharts, D3, and other libraries
5. **Future agents must follow this pattern** - Now documented in visuals-agent.md

## Prevention Measures

### For AI Agents
The visuals-agent.md now includes:
- Explicit "CRITICAL" warnings about spread operator position
- Side-by-side correct vs incorrect examples
- Explanation of WHY it matters
- Complete working examples
- Added to CRITICAL REMINDERS section

### For Testing
- Test harness should validate data mapping patterns
- Check for spread operator position in asset.tsx files
- Verify chartData structure has clean name/value properties

## References

- Working example provided by user (analyzed to extract pattern)
- JavaScript object spread semantics (ECMAScript specification)
- Recharts documentation on dataKey usage
- DIGO API types and patterns
