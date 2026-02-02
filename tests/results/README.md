# DIGO Testing Results - Documentation Index

**Last Updated**: January 29, 2026
**Status**: ✅ All Tests Passing

---

## 📚 Documentation Files

### 1. [TEST_SUMMARY.md](./TEST_SUMMARY.md)
**Start here for high-level overview**

Overview of all test results, critical discoveries, and next steps.
- Test suite results (5 artifacts, all passing)
- Critical discoveries (6 major patterns)
- Required agent updates
- Impact assessment
- Verification checklist

**Best for**: Understanding what was tested and what was learned

---

### 2. [TESTING_LEARNINGS.md](./TESTING_LEARNINGS.md)
**Comprehensive technical reference**

Detailed documentation of every pattern, fix, and discovery.
- Critical discoveries with code examples
- TimeArray visualization patterns (A, B, C)
- Library-specific patterns (Recharts, Three.js)
- Checklists for artifact creation
- Agent instruction update recommendations

**Best for**: Deep-dive technical understanding and implementation guidance

---

### 3. [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
**Quick lookup during development**

Essential patterns and rules in concise format.
- Critical rules (spread operator, export, isArray)
- TimeArray patterns (code snippets)
- Library-specific quick tips
- Working example locations

**Best for**: Quick checks while coding

---

## 🎯 Working Artifacts (All Suffixed _WORKING.json)

### Line Chart Variations

#### A: Multi-Company Comparison
**Location**: `orchestrator/002-quarterly-revenue-line-chart/variations/A-multi-company-comparison-WORKING.json`

**Pattern**: Multiple instances, each creates a series (3 companies × 4 quarters)

**Key Code**:
```typescript
{this.instances?.map((instance, idx) => (
  <Line dataKey={instance['line-label']} stroke={instance['line-color']} />
))}
```

---

#### B: Single Line Quarterly Evolution
**Location**: `orchestrator/002-quarterly-revenue-line-chart/variations/B-single-line-quarterly-evolution-WORKING.json`

**Pattern**: Single instance with array parameter (1 company × 4 quarters)

**Key Code**:
```typescript
const values = this.instances?.[0]['line-values'] as number[];
const chartData = this.timeArray?.map((time, idx) => ({
  name: time,
  value: values[idx]
}));
```

**Critical**: Requires `isArray: true` on parameter

---

#### C: Multi-Year Quarterly Comparison
**Location**: `orchestrator/002-quarterly-revenue-line-chart/variations/C-multi-year-quarterly-comparison-WORKING.json`

**Pattern**: Inverted structure (4 quarters × 3 years)

**Key Code**:
```typescript
{this.timeArray?.map((year, idx) => (
  <Line dataKey={year} stroke={colors[idx]} />
))}
```

**Critical**: TimeArray becomes series, not x-axis

---

### Visualization Examples

#### 3D Cube (Three.js)
**Location**: `visuals-agent/001-3d-cube-threejs/DIGO_ARTIFACT_WORKING.json`

**Pattern**: Instance parameters for multiple 3D objects

**Key Learning**: React 19 requires @react-three/fiber v9+

**Packages**:
```json
{
  "@react-three/fiber": "^9.0.0",
  "@react-three/drei": "^9.114.0",
  "three": "^0.169.0"
}
```

---

#### Pie Chart (Recharts)
**Location**: `visuals-agent/002-pie-chart-recharts/DIGO_ARTIFACT_WORKING.json`

**Pattern**: Instance parameters for customizable slices

**Key Learnings**:
1. Use `fill` property for colors, not `color`
2. Custom label renderer for inside/outside positioning

**Key Code**:
```typescript
const data = this.instances?.map((instance) => ({
  ...instance,  // ← FIRST!
  fill: instance['slice-color'] as string
}));
```

---

## 🔑 Critical Patterns (Must Know)

### 1. Spread Operator Position
**CRITICAL**: Must be FIRST in object mapping

```typescript
// ✅ CORRECT
const data = this.instances?.map((instance) => ({
  ...instance,  // ← FIRST!
  name: instance['label']
}));

// ❌ WRONG - Will break rendering
const data = this.instances?.map((instance) => ({
  name: instance['label'],
  ...instance  // ← WRONG!
}));
```

---

### 2. isArray Property
**NEW DISCOVERY**: VizParameter supports `isArray` property

When linking to DataColumn with `isArray: true`, VizParameter MUST also have `isArray: true`.

```json
{
  "id": "line-values",
  "type": "NUMBER",
  "isGlobal": false,
  "isArray": true  // ← REQUIRED for array data
}
```

---

### 3. Export Pattern
**CRITICAL**: Use named export, not default

```typescript
// ✅ CORRECT
export class Asset extends DigoAsset { }

// ❌ WRONG
export default class Asset extends DigoAsset { }
```

---

## 📊 TimeArray Pattern Decision Tree

```
Does visualization use timeArray?
│
├─ NO → Use standard instance parameters
│
└─ YES → What structure?
    │
    ├─ Multiple entities over time? → Pattern A
    │   Example: 3 companies, 4 quarters
    │   Each row = entity
    │   TimeArray = x-axis
    │   Parameter: isArray: true
    │
    ├─ Single entity, array of values? → Pattern B
    │   Example: 1 company, 4 quarters
    │   One row with array
    │   TimeArray = x-axis
    │   Parameter: isArray: true
    │
    └─ Categories across time periods? → Pattern C
        Example: 4 quarters, 3 years
        Each row = category
        TimeArray = series
        Parameter: isArray: true
```

---

## 🚨 Common Errors & Fixes

### Error 1: "Line showing at 0"
**Cause**: Missing `isArray: true` on parameter
**Fix**: Add `"isArray": true` to VizParameter definition
**Test**: Variation B

---

### Error 2: "Cannot read properties of undefined (reading 'ReactCurrentOwner')"
**Cause**: @react-three/fiber v8 incompatible with React 19
**Fix**: Update to v9.0.0+
**Test**: 3D Cube

---

### Error 3: "Pie chart slices are black"
**Cause**: Using `color` instead of `fill` property
**Fix**: Map to `fill` property and use `<Cell fill={entry.fill} />`
**Test**: Pie Chart

---

### Error 4: "Labels always outside"
**Cause**: Default label renderer doesn't respect position parameter
**Fix**: Implement custom `renderCustomLabel` function
**Test**: Pie Chart

---

### Error 5: "No exposed parameters"
**Cause**: All parameters are `isGlobal: true`
**Fix**: Add instance parameters with `isGlobal: false`
**Test**: All variations

---

## 🔄 Development Workflow

### When creating new TimeArray visualization:

1. **Identify pattern** (A, B, or C)
2. **Create VizParameters** with `isArray: true` for array data
3. **Set instance parameters** with `isGlobal: false`
4. **Map data correctly**:
   - Spread operator FIRST
   - Map timeArray to x-axis or series
   - Access array parameters correctly
5. **Test with real data**
6. **Verify parameters are linkable**

---

## 📦 Package Version Requirements

### React 19 Projects
```json
{
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "@digo-org/digo-api": "latest"
}
```

### With Three.js
```json
{
  "@react-three/fiber": "^9.0.0",      // ← v9+ required for React 19
  "@react-three/drei": "^9.114.0",     // ← v9+ required
  "three": "^0.169.0"
}
```

### With Recharts
```json
{
  "recharts": "^2.15.0"
}
```

---

## 🎯 Next Actions

### Immediate
- [ ] Update `.claude/agents/visuals-agent.md`
- [ ] Update `.claude/agents/links-agent.md`
- [ ] Add WORKING artifacts to official examples

### Short-term
- [ ] Update DIGO API type definitions
- [ ] Create automated validation tests
- [ ] Update user documentation

### Long-term
- [ ] Build artifact validation tool
- [ ] Create interactive pattern examples
- [ ] Enhance orchestrator with pattern detection

---

## 📧 Questions?

For questions about these patterns or to report issues:
1. Review [TESTING_LEARNINGS.md](./TESTING_LEARNINGS.md) for detailed explanations
2. Check [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) for pattern examples
3. Examine WORKING artifacts for implementation details

---

**Testing Completed**: January 29, 2026
**All Tests**: ✅ PASSING
**Total Artifacts**: 5
**Critical Patterns Identified**: 6
**Documentation Files**: 4
