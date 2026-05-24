# LFP Emissions Inventory — Methodology & Data Documentation

**City:** Lake Forest Park, WA  
**GPC Version:** 1.1  
**Reporting Level:** BASIC (partial BASIC+)  
**Baseline year:** 2019  
**Latest year:** 2023  
**Last updated:** 2026-05-24  
**Maintainer:** LFP Climate Hub

---

> **DRAFT FOR REVIEW.** Several figures are pending reconciliation with primary source PDFs
> (the Cascadia Wedge Memo and Fehr & Peers VMT Study returned 403 errors during data collection).
> Confirmed figures are flagged in the data; unconfirmed values use the GPC notation key NE
> (Not Estimated) rather than estimates. Do not cite as final.

---

## 1. GPC Framework & Reporting Boundary

This inventory follows the **Global Protocol for Community-Scale GHG Inventories (GPC) v1.1**.

**Boundary:** Geographic — the Lake Forest Park city limits.

**Sectors covered:**
- **Stationary Energy** (BASIC: Scope 1+2 building energy)
- **Transportation** (BASIC: on-road Scope 1+3; BASIC+: aviation, off-road)
- **Waste** (BASIC: Scope 3 solid waste disposal; BASIC+: wastewater)
- **IPPU** (BASIC+: refrigerant fugitives)
- **AFOLU** (BASIC+: urban canopy sequestration)

**GPC Notation Keys:**
| Key | Meaning |
|-----|---------|
| `IE` | Included Elsewhere — emission exists, counted in another row |
| `NE` | Not Estimated — emission exists but not quantified |
| `NO` | Not Occurring — emission source is absent |
| `C`  | Confidential — data withheld |

A blank `value_mtco2e` with a notation key is **not zero**. It means the data is absent or deferred.
Never display notation-key rows as zero in charts.

---

## 2. Source Data & Reliability Notes

### Primary sources (with known access issues)

**Cascadia Consulting Group — Wedge Memo (June 2025)**  
`src-cascadia-wedge`  
Direct PDF fetch returned **HTTP 403** during research. Scenario trajectory percentages
(BAU +26%, ABAU −56%, target milestones) and sectoral share estimates (~32% aviation, ~19% natural gas,
~7% refrigerants, ~6% off-road) were confirmed via:
- Indexed search snippets
- CitizenPortal.ai secondary coverage of the May 15, 2025 CPAT presentation (`src-citizenportal-wedge`)

⚠ **Reconcile cell-level wedge magnitudes against the source PDF before any public launch.**
The absolute MTCO₂e values behind the percentage figures are not confirmed.

---

**Fehr & Peers — VMT Reduction Target & Strategies (2025)**  
`src-fehrpeers-vmt`  
Direct PDF fetch returned **HTTP 403**. On-road VMT and emissions figures confirmed via indexed snippets:
- On-road total 2019: **25,364 MTCO₂e** ✓
- On-road total 2022: **23,322 MTCO₂e** ✓
- On-road total 2023: **23,450 MTCO₂e** ✓
- Passenger vehicle only, 2023: **23,510 MTCO₂e** on **56,142,000 VMT** ✓

Note: passenger-only (23,510) and total (23,450) come from different table cells in the source;
the apparent inversion (passenger > total) may reflect rounding or different scope inclusions.
Reconcile against source PDF.

---

**King County PSREAP**  
`src-psreap`  
Methodology changed between 2017, 2019, and 2022 data releases. Historical comparisons require
back-casting to a consistent methodology. This affects waste sector figures and any
consumption-based downscaling using PSREAP data.

---

## 3. Consumption-Based Inventory (Deliverable #6)

No consumption-based emissions inventory (CBEI) currently exists for Lake Forest Park specifically.

**Options for developing one:**

**Option A — King County PSREAP downscale:**  
Obtain the King County PSREAP CBEI dataset and allocate LFP's share by population (≈2.6% of
unincorporated KC + municipal) and/or income (income-weighted may be more appropriate given
LFP's median household income significantly exceeds KC median).

**Option B — Spend-based EEIO:**  
Apply the USEEIO v2 (US Environmentally-Extended Input-Output) model to BLS Consumer Expenditure
Survey data stratified by LFP's income distribution. This is the more transparent and reproducible
approach for a wealthy outlier community where per-capita consumption emissions are likely to be
well above county average.

**Precedent:**
- Edmonds, WA — comparable bedroom community — consumption footprint ≈44% larger than territorial
- Paris, France — consumption footprint >2× territorial total (imported goods & services)
- LFP's higher income profile suggests the gap is larger than Edmonds

**Double-counting caveat:** On-road transport fuels appear in both the territorial GPC inventory
(Scope 1+3 under Transportation) and in the consumption-based category "Transport fuels."
These are separate accounting boundaries, not additive. The consumption total must be presented
with an explicit boundary statement.

---

## 4. AFOLU / Urban Canopy (Deliverable #7)

**Current status:** Canopy cover ~50% confirmed qualitatively from the LFP Climate Action Plan (2024).
All sequestration and carbon stock figures are **NE (Not Estimated)**.

**To quantify:**
1. Run an **i-Tree Canopy** assessment (web-based, free, requires ~2 hrs of photo interpretation)
   → provides statistically-sampled canopy cover, tree composition, and sequestration estimate
2. For more precision: **i-Tree Eco** full inventory (requires field data collection)
3. Contact **WA DNR Urban & Community Forestry** program for assistance

**C → CO₂e conversion:**
i-Tree outputs tonnes of carbon (C). The GHG inventory uses MTCO₂e:

```
CO₂e (tonnes) = C (tonnes) × (44/12) ≈ C × 3.6667
```

Per IPCC AR5 (GWP₁₀₀ = 1 for CO₂). The conversion is applied in `src/lib/format.js:carbonToMTCO2e()`.
**The CSV stores raw measured values.** The conversion is code-only, making the method transparent.

---

## 5. Stationary Energy

**Natural gas (Scope 1):** Confirmed as ~19% of "all" emissions / ~28% of "core" from the Cascadia
Wedge Memo narrative. Absolute MTCO₂e not transcribed (PDF 403). This is LFP's dominant non-transportation
source and the primary remaining decarbonization lever.

**Electricity (Scope 2):** LFP is served by two utilities:
- **Seattle City Light (SCL):** ~carbon-neutral (hydroelectric dominant); customers carry near-zero Scope 2
- **PSE (Puget Sound Energy):** Historically carbonized; eliminated coal as of January 1, 2026 per CETA.
  CETA requires GHG-neutral electricity by 2030 and 100% clean by 2045.

City-scale electricity consumption totals are not available from current sources. PSE's 2024 emissions
intensity is documented in UTC Docket 250410.

---

## 6. Transportation

**On-road (BASIC reporting):** The dominant confirmed source.
- ~90%+ of LFP VMT is transboundary (residents commuting out); technically Scope 3 (IX/XI per GPC)
- GPC BASIC reporting combines Scope 1 + 3 on-road; the split is not available from current data
- Passenger vehicle share ~99% of total (LFP has minimal freight/transit activity)

**Aviation (BASIC+ Scope 3):** ~32% of "all" emissions per Wedge Memo. Income-allocated per-capita
method. Not transcribed as absolute MTCO₂e. LFP's high income means aviation is proportionately
the single largest emissions source in the "all footprint" accounting.

**Off-road (~6%):** Lawn and garden equipment, construction equipment. Not quantified at city scale.

---

## 7. Waste & IPPU

**Solid waste (Scope 3, ~2%):** LFP waste is exported (Scope 3). PSREAP has county-level data;
LFP share not compiled.

**Wastewater:** Not estimated in available sources.

**Refrigerants (HFCs, ~7%):** Fugitive emissions from HVAC/refrigeration. Aggregate share confirmed
from Wedge Memo narrative; not speciated. A growing category as older HFC equipment ages.

---

## 8. Forking This Project for Another City

See the **[README.md](./README.md)** for step-by-step fork instructions.

All data is in `/data/` as flat CSV files. To adapt for another city:
1. Edit `manifest.json` (city name, years, disclaimer)
2. Replace the CSV files with your city's data (same column schema)
3. Update `vite.config.js` base path to match your repo name
4. Enable GitHub Pages → Source: GitHub Actions

No component code changes are needed to swap cities.

**Licensing:**
- Code: MIT
- Data: CC BY 4.0 (attribute LFP Climate Hub + original sources)

---

*For questions or corrections, open an issue at [github.com/kelaxten/lfp-climate](https://github.com/kelaxten/lfp-climate).*
