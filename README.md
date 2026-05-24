# LFP Emissions Dashboard

**Lake Forest Park, WA — Community GHG Inventory & Emissions Dashboard**

A public, peer-reviewable static website publishing Lake Forest Park's community greenhouse gas
(GHG) inventory in conformance with the **Global Protocol for Community-Scale GHG Inventories (GPC) v1.1**.
Includes an interactive dashboard, consumption-based (Scope 3) footprint, and urban canopy (AFOLU) sink.

🔗 **Live site:** [kelaxten.github.io/lfp-climate](https://kelaxten.github.io/lfp-climate/)

> **DRAFT.** Figures pending reconciliation with primary source PDFs. See `METHODOLOGY.md` for details.

---

## What this builds

| Deliverable | View |
|-------------|------|
| **#2** GPC-keyed GHG inventory | `/inventory` — sortable table, notation keys, source citations |
| **#3** Public emissions dashboard | `/dashboard` — trend, sector split, wedge scenarios to 2050 |
| **#6** Consumption-based footprint | `/consumption` — Scope 3 supply-chain, explainer, next steps |
| **#7** AFOLU / canopy sink | `/canopy` — C→CO₂e conversion, i-Tree methodology |

---

## Tech stack

- **React 18 + Vite** — static build for GitHub Pages
- **Recharts** — charts with accessible table fallbacks
- **PapaParse** — runtime CSV parsing (no build step for data)
- **React Router** (hash router) — deep links work on GitHub Pages
- **Plain CSS** — no framework dependencies; highly portable

---

## Local development

```bash
git clone https://github.com/kelaxten/lfp-climate.git
cd lfp-climate
npm install
npm run dev        # → http://localhost:5173/lfp-climate/
```

## Build & preview

```bash
npm run build      # → dist/
npm run preview    # preview the production build locally
```

---

## Repository structure

```
lfp-climate/
├── README.md
├── METHODOLOGY.md          # Full methodology, caveats, fork instructions
├── LICENSE                 # MIT (code) + CC BY 4.0 (data)
├── package.json
├── vite.config.js          # base: '/lfp-climate/' for GitHub Pages
├── .github/workflows/
│   └── deploy.yml          # CI: build + deploy to Pages on push to main
├── public/
│   └── favicon.svg
├── public/
│   ├── favicon.svg
│   └── data/               # THE SOURCE OF TRUTH — edit these to update the site
│       ├── manifest.json       # City metadata, years, disclaimer
│       ├── inventory_2019.csv  # GPC inventory, baseline year
│       ├── inventory_2023.csv  # GPC inventory, latest year
│       ├── wedge_scenarios.csv # BAU / ABAU / Local Action / Target to 2050
│       ├── consumption_based.csv # Scope 3 supply-chain categories
│       ├── canopy_afolu.csv    # Urban canopy metrics
│       └── sources.csv         # Citation registry (all source metadata)
└── src/
    ├── main.jsx
    ├── App.jsx             # Router + data loading
    ├── index.css           # Design tokens + global styles
    ├── lib/
    │   ├── loadData.js     # Fetch + parse all CSVs, join sources
    │   ├── gpc.js          # GPC constants (sectors, scopes, notation keys)
    │   └── format.js       # MTCO₂e formatting, C→CO₂e conversion
    ├── components/
    │   ├── Layout.jsx      # Nav + footer
    │   ├── Citation.jsx    # Inline source reference w/ tooltip
    │   ├── NotationKey.jsx # IE/NE/NO/C badge
    │   ├── StatCard.jsx    # Headline metric tile
    │   ├── WedgeChart.jsx  # Scenario lines + data table fallback
    │   └── DataTable.jsx   # Sortable table w/ a11y
    └── views/
        ├── Overview.jsx    # Landing + stat cards
        ├── Inventory.jsx   # GPC table, year selector, download CSV
        ├── Dashboard.jsx   # Trend + sector + wedge charts
        ├── Consumption.jsx # Scope 3 footprint
        ├── Canopy.jsx      # AFOLU sink
        └── Methodology.jsx # GPC completeness map + sources
```

---

## Data schemas

All values in **MTCO₂e** (metric tons CO₂-equivalent) unless the `unit` column says otherwise.
Every data row has a `source_id` that joins to `sources.csv`.

### `inventory_{year}.csv`
```
gpc_refno, sector, subsector, scope, activity, value_mtco2e,
notation_key, source_id, notes
```

### `wedge_scenarios.csv`
```
year, scenario, value_pct_of_2019, value_mtco2e, footprint,
confirmed, source_id, notes
```

### `consumption_based.csv`
```
category, value_mtco2e, pct_of_cbei, method, confirmed,
source_id, notes
```

### `canopy_afolu.csv`
```
metric, value, unit, year, method, confirmed, source_id, notes
```
*C values are in tonnes C; conversion to MTCO₂e (×44/12) is applied in code, not in the CSV.*

### `sources.csv`
```
source_id, citation, url, accessed, type, reliability_note
```

### `manifest.json`
City metadata, baseline/latest year, GPC version, disclaimer, confirmed figures.
Drives the draft banner and headline stat cards.

---

## Updating the data

**To add a new inventory year:**
1. Create `data/inventory_YYYY.csv` with the same column schema
2. Add any new sources to `data/sources.csv`
3. Update `manifest.json` → `latest_year` and `available_years`
4. Push to `main` → site rebuilds automatically via GitHub Actions

**To correct an existing figure:**
Edit the relevant CSV. If a value changes from `NE` to a confirmed number, remove the `notation_key`
value and fill `value_mtco2e`. No component code changes needed.

---

## Deploying to GitHub Pages

### Automatic (recommended)
Push to `main`. The GitHub Actions workflow (`.github/workflows/deploy.yml`) will:
1. Install dependencies (`npm ci`)
2. Build (`npm run build`)
3. Add `.nojekyll` to the output
4. Deploy `dist/` to GitHub Pages

**First-time setup:** In repo Settings → Pages → Source → select "GitHub Actions".

### Manual fallback
```bash
npm run build
# Then push dist/ to gh-pages branch, or use gh-pages npm package
npx gh-pages -d dist
```

---

## Fork for another city

This project is designed so another small city can fork it and get their own inventory site:

1. **Fork** [kelaxten/lfp-climate](https://github.com/kelaxten/lfp-climate)
2. **Edit** `data/manifest.json` — update `city`, `baseline_year`, `latest_year`, `available_years`, `last_updated`, `maintainer`, `disclaimer`
3. **Replace** the CSV files in `data/` with your city's data (same column schemas above)
4. **Update** `vite.config.js` → `base: '/your-repo-name/'`
5. **Update** `.github/workflows/deploy.yml` if repo name differs
6. **Enable** GitHub Pages: Settings → Pages → Source: GitHub Actions
7. **Push** to `main` — site builds and deploys automatically

No React/component code changes needed — all content comes from CSVs.

---

## License

- **Code:** [MIT License](./LICENSE)
- **Data:** [Creative Commons Attribution 4.0 (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/)
  — Attribute: *LFP Climate Hub + original sources (see sources.csv)*

---

## Methodology

See [METHODOLOGY.md](./METHODOLOGY.md) for:
- Full GPC sector/scope documentation
- Source access issues and reliability notes (403 fetch warnings)
- PSREAP methodology change caveat
- Consumption-based inventory options
- i-Tree assessment instructions
- C→CO₂e conversion documentation
