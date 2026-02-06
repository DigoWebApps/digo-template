# DIGO Project Session Summary
## Vaccine Efficacy Radial Sunburst Visualization

**Date:** February 5, 2026
**Time:** ~18:00 - 20:36 CET (~2.5 hours)
**Model:** Claude Opus 4.5 (`claude-opus-4-5-20251101`)
**Platform:** Claude Code CLI on WSL2 (Linux)

---

## Session Cost & Token Estimates

| Metric | Estimate |
|---|---|
| **Model** | Claude Opus 4.5 |
| **Input price** | $15 / 1M tokens |
| **Output price** | $75 / 1M tokens |
| **Estimated input tokens** | ~250,000 - 350,000 |
| **Estimated output tokens** | ~50,000 - 80,000 |
| **Estimated session cost** | ~$7.50 - $11.25 |
| **Context windows used** | 2 (original hit limit, continued in new session) |
| **Total user turns** | ~18 |
| **Total tool calls** | ~60+ (Read, Write, Edit, Grep, Glob, Bash, WebFetch, Task) |

> **Note:** Exact token counts and costs are available in the Anthropic billing dashboard. These are estimates based on conversation length, code volume, and schema fetches.

---

## Context & Objective

The user requested a **complete DIGO artifact project** to visualize vaccine efficacy data using a premium D3.js radial sunburst chart. The project required:

- A structured **data table** (13 vaccines, 6 parameters)
- A **D3.js visualization** encoding all 6 data dimensions simultaneously
- **Parameter links** connecting data columns to visualization parameters
- Iterative **bug fixes** based on live preview testing

### DIGO System

DIGO is a hierarchical multi-agent system for generating interactive data visualizations. Artifacts consist of:

- `DATA_TABLE_DEFINITION` — structured tabular data
- `CODE_FILES` — React/D3.js visualization code (asset.tsx, definition.json, package.json, styles.css)
- `LINKS` — mappings from visualization parameters to data columns

---

## Conversation Timeline

### Phase 1: Data Creation
| # | User Request | Action |
|---|---|---|
| 1 | "Create a table with a vaccine efficacy comparison" | Used `data-agent` to create DATA_TABLE_DEFINITION with 13 vaccines and 6 columns |
| 2 | "Create a JSON with the DATA_TABLE_DEFINITION" | Output clean JSON artifact |
| 3 | "Save it as DATA_TABLE_DEFINITION.json" | Saved to disk |

### Phase 2: Visualization Creation
| # | User Request | Action |
|---|---|---|
| 4 | "Create area graph viz with that data" | Used `visuals-agent` to create Recharts AreaChart (`CODE_FILES.json`) |
| 5 | "Think of a better visualization. Use D3.js" | Created **Radial Efficacy Sunburst** using D3.js (`CODE_FILES_D3.json`) |
| 6 | "Create the links" | Used `links-agent` to create LINKS mapping 6 parameters to 6 columns |

### Phase 3: Bug Fixes (Iterative)
| # | Issue | Root Cause | Fix |
|---|---|---|---|
| 7 | "Missing Type Element" in preview | `definition.json` used numeric type values (`0`, `1`, `2`, `3`) instead of string enums | Replaced all types with `"NUMBER"`, `"BOOLEAN"`, `"COLOR"`, `"TEXT"` |
| 8 | "Let me choose Vaccine Type colors" | No color parameters for vaccine types | Added 6 COLOR parameters + dynamic `typeColors` map from `globalParameters` |
| 9 | Some colors shown as black (e.g., "Recombinant") | Exact string matching failed: `"Recombinant (protein subunit)"` vs key `"recombinant"` | Added fuzzy matching with `startsWith` / `includes` fallback |
| 10 | Vaccine name and disease labels overlapping | Both labels along the same radial line at bar-relative position | Moved to fixed `outerR + 16` position with perpendicular `dy` stacking (`-0.5em` / `1em`) |
| 11 | Labels still overlapping | Long text extending along radial direction | Perpendicular offset via SVG `dy` attribute under rotation transform |
| 12 | Dose indicator dots invisible (faded) | `linearGradient` with vertical direction caused reversed gradient on bottom-half bars, making inner region opaque | Changed to `radialGradient` with `userSpaceOnUse`; dots changed to white fill + colored stroke |
| 13 | "YEAR APPROVED" label almost invisible | 7px text at 0.25 opacity inside hub | Removed hub label; added proper legend entry in bottom-left with gradient bar + year range |
| 14 | "Save everything as a complete ARTIFACT" | N/A | Combined all 3 artifact types into `ARTIFACT.json` |

### Phase 4: Continuation Session (Context Overflow)
| # | Issue | Root Cause | Fix |
|---|---|---|---|
| 15 | Tooltips showing wrong vaccine data (shifted) | **90-degree offset** between D3 arc convention (`sin(θ), -cos(θ)`) and standard trig (`cos(θ), sin(θ)`) used for label/dot/hover positions | Replaced `cos(midAngle)` with `sin(midAngle)` for x, `sin(midAngle)` with `-cos(midAngle)` for y; subtracted 90 from rotation angle |

---

## Files Produced

| File | Size | Description |
|---|---|---|
| `DATA_TABLE_DEFINITION.json` | 6.4 KB | 13 vaccines, 6 columns (name, disease, efficacy, doses, year, type) |
| `CODE_FILES_D3.json` | 27.4 KB | D3.js Radial Efficacy Sunburst (4 files) |
| `CODE_FILES.json` | — | Recharts AreaChart (earlier version, superseded) |
| `LINKS.json` | 0.3 KB | 6 parameter-to-column mappings |
| `ARTIFACT.json` | 33.8 KB | Combined complete artifact (DATA_TABLE + CODE_FILES + LINKS) |

### Code Breakdown (`/asset.tsx`)
- **426 lines** of TypeScript/React/D3.js
- Functional `RadialChart` component with D3.js imperative rendering
- `Asset` class extending `DigoAsset` (DIGO framework)
- 21 parameters in 6 groups (Appearance, Display, Animation, Layout, Type Colors, Data)
- Features: animated elastic bars, radial gradients, year ring, dose dots, fuzzy type matching, responsive resize, interactive tooltips

---

## Data: 13 Vaccines

| Vaccine | Disease | Efficacy | Doses | Year | Type |
|---|---|---|---|---|---|
| Pfizer-BioNTech (Comirnaty) | COVID-19 | 95.0% | 2 | 2020 | mRNA |
| Moderna (Spikevax) | COVID-19 | 94.1% | 2 | 2020 | mRNA |
| Johnson & Johnson (Janssen) | COVID-19 | 66.0% | 1 | 2021 | Viral vector |
| AstraZeneca (Vaxzevria) | COVID-19 | 76.0% | 2 | 2021 | Viral vector |
| MMR II (Merck) | Measles, Mumps, Rubella | 97.0% | 2 | 1971 | Live attenuated |
| Seasonal Influenza (Fluzone) | Influenza | 50.0% | 1 | 1945 | Inactivated / Recombinant |
| Gardasil 9 (Merck) | HPV | 97.0% | 2 | 2006 | Recombinant |
| IPV (IPOL, Sanofi) | Polio | 99.0% | 4 | 1955 | Inactivated |
| Hepatitis B (Recombivax HB) | Hepatitis B | 95.0% | 3 | 1982 | Recombinant |
| DTaP (Infanrix / Daptacel) | Diphtheria, Tetanus, Pertussis | 98.0% | 5 | 1991 | Inactivated (toxoid) |
| Varivax (Merck) | Chickenpox | 90.0% | 2 | 1995 | Live attenuated |
| Shingrix (GSK) | Shingles | 91.0% | 2 | 2017 | Recombinant |
| Prevnar 13 (Pfizer) | Pneumococcal Disease | 75.0% | 4 | 2010 | Conjugate |

---

## Key Technical Learnings

1. **ParameterType must be strings** — The DIGO `ParameterType` enum uses `"NUMBER"`, `"BOOLEAN"`, `"COLOR"`, `"TEXT"` etc., NOT numeric indices. Using integers causes "Missing Type Element" errors.

2. **D3 arc vs trig convention** — D3 `d3.arc()` measures angles from 12 o'clock clockwise using `(r*sin(θ), -r*cos(θ))`. Standard `Math.cos/sin` uses 3 o'clock convention with `(r*cos(θ), r*sin(θ))`. Mixing them creates a 90-degree offset.

3. **SVG radialGradient for circular layouts** — `linearGradient` with default `objectBoundingBox` doesn't follow radial arc direction. Use `radialGradient` with `gradientUnits="userSpaceOnUse"` centered at the chart origin.

4. **SVG text perpendicular stacking** — Under a `rotate()` transform, the `dy` attribute offsets text perpendicular to the rotation direction, enabling clean label stacking at the same anchor point.

5. **Fuzzy type matching** — Data values like `"Recombinant (protein subunit)"` don't match keys like `"recombinant"`. Use `startsWith` / `includes` for resilient lookups.

---

*Generated by Claude Opus 4.5 via Claude Code CLI*
