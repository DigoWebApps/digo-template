# DIGO Agent Testing

This directory contains the testing infrastructure for validating DIGO agents (data-agent, visuals-agent, links-agent, and orchestrator).

## Overview

The testing system allows you to:
- Invoke agents with test prompts
- Validate agent outputs against schemas
- Save all test results with artifacts for review
- Track test history in git

## Directory Structure

```
tests/
├── README.md                 # This file
├── test-harness.ts          # Core testing utilities
├── run-test.ts              # CLI test runner (manual)
└── results/                 # All test results (committed to git)
    ├── data-agent/
    │   └── 001-test-description/
    │       ├── request.txt          # The prompt sent to agent
    │       ├── response.json        # Full agent response
    │       ├── artifact.json        # Extracted artifact
    │       └── metadata.json        # Test metadata & validation results
    ├── visuals-agent/
    │   └── 001-test-description/
    │       ├── request.txt
    │       ├── response.json
    │       ├── metadata.json
    │       └── artifact/            # CODE_FILES extracted
    │           ├── asset.tsx
    │           ├── package.json
    │           ├── styles.css
    │           └── definition.json
    ├── links-agent/
    └── orchestrator/
```

## Running Tests

### Manual Testing (Current Implementation)

Since we're running inside Claude Code, tests must be run manually by directly invoking agents:

1. **Invoke an agent directly in this chat**, for example:
   ```
   "I need you to act as the data-agent and get GDP data for top 10 countries in 2024"
   ```

2. **The agent will respond** with a `[TEXT, ARTIFACT]` format

3. **Save the results** by copying the response and using the test runner:
   ```bash
   npm run test:agent data-agent "Get GDP data for top 10 countries in 2024"
   # Then paste the agent response when prompted
   ```

### Automated Testing (Future)

In the future, we could create an automated test runner that uses the Claude Code Task tool to invoke agents programmatically.

## Test Workflow

### Phase 1: Direct Agent Testing
Test each agent individually by explicitly specifying which agent to use:

**Data Agent Tests:**
```
Test 1: "Get GDP data for top 10 countries in 2024"
Test 2: "Monthly temperature in NYC for 2024"
Test 3: "Top 5 most populated cities with their population"
Test 4: "Stock prices for AAPL over the last year"
```

**Visuals Agent Tests:**
```
Test 1: "Create a bar chart visualization with recharts"
Test 2: "Build a 3D scatter plot with three.js"
Test 3: "Make an animated line chart"
Test 4: "Create a simple pie chart visualization"
```

**Links Agent Tests:**
```
Test 1: Given data and viz, "Link the sales column to bar-value parameter"
Test 2: Given data and viz, "Connect all numeric columns to visualization parameters"
Test 3: Given data and viz, "Map category to bar-color and value to bar-height"
```

### Phase 2: Orchestrator Testing
Test complete workflows WITHOUT specifying which agent:

```
Test 1: "Show me sales data for Q4 2024 as a bar chart"
Test 2: "Get temperature data and create a line chart"
Test 3: "Create a 3D visualization of earthquake data from last month"
```

## Validation

The test harness automatically validates:

### Data Agent Artifacts
- ✅ Has `DATA_TABLE_DEFINITION` object
- ✅ Contains `timeArray`, `columns`, `rows` arrays
- ✅ Columns have `id`, `name`, `type`, `definition`
- ✅ Rows have `id`, `name`, `hidden`
- ✅ Time series consistency (isArray for time-based data)

### Visuals Agent Artifacts
- ✅ Has `CODE_FILES` object
- ✅ Contains all 4 required files: `/asset.tsx`, `/package.json`, `/styles.css`, `/definition.json`
- ✅ asset.tsx extends DigoAsset class
- ✅ package.json has required dependencies
- ✅ definition.json is valid VizParameter array
- ✅ Parameters have proper structure (id, name, group, isGlobal, type, definition)

### Links Agent Artifacts
- ✅ Has `LINKS` object
- ✅ Contains key-value mappings (parameter-id → column-id)
- ✅ All values are strings

## Interpreting Results

After each test, you'll see:
- ✅ **PASSED** - Artifact is valid and follows schema
- ❌ **FAILED** - Artifact has validation errors
- ⚠️ **WARNINGS** - Artifact is valid but has minor issues

All results are saved to `tests/results/` for review.

## Best Practices

1. **Test incrementally**: Start with simple cases, then move to complex ones
2. **Review artifacts**: Open the saved JSON/code files to inspect agent outputs
3. **Track issues**: Document any problems in the test metadata
4. **Version control**: Commit test results to track agent improvements over time
5. **Compare outputs**: Use git diff to see how agents evolve across tests

## Common Issues

### Agent doesn't follow [TEXT, ARTIFACT] format
- Check that agent instructions specify the output format clearly
- Verify the agent is using the correct response structure

### Missing required fields
- Review agent instructions for schema validation step
- Ensure agent is fetching latest types from @digo-org/digo-api

### Type mismatches
- Verify agent understands the parameter/column type system
- Check that isArray is used correctly for time series data

## Next Steps

1. Run Phase 1 tests (direct agent testing)
2. Review all artifacts and validation results
3. Document issues and patterns
4. Refine agent instructions based on findings
5. Run Phase 2 tests (orchestrator testing)
6. Iterate and improve
