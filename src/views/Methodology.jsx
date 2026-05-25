/**
 * Methodology — GPC completeness map, source list, fork instructions.
 * Renders from METHODOLOGY.md (loaded as raw text) + sources.csv data.
 */
import Citation from '../components/Citation.jsx'
import NotationKey from '../components/NotationKey.jsx'
import { NOTATION_KEYS } from '../lib/gpc.js'

// GPC completeness map — structured data for the table
const COMPLETENESS = [
  { sector: 'Stationary Energy (nat. gas)', scope: 1, gpc: 'BASIC', coverage: 'NE', gap: 'Absolute MTCO₂e not yet extracted. Cascadia GHG Inventory Report (separate from Wedge Memo) contains this — pending PDF review.' },
  { sector: 'Stationary Energy (electricity)', scope: 2, gpc: 'BASIC', coverage: 'NE', gap: 'City-scale electricity totals not available. PSE emissions intensity confirmed (0.377 MTCO₂e/MWh for 2024). CETA requires PSE to be GHG-neutral by 2030.' },
  { sector: 'Transportation (on-road)', scope: '1+3', gpc: 'BASIC', coverage: 'Confirmed', gap: 'Total on-road 2019/2022/2023 confirmed from Fehr & Peers VMT Study Table 2. Scope 1 vs. 3 split NE (>90% transboundary).' },
  { sector: 'Transportation (aviation)', scope: 3, gpc: 'BASIC+', coverage: 'NE', gap: 'Included in "all" footprint via Wedge Memo (income-allocated per-capita method). ~32% of all-footprint. Absolute value NE — largest remaining single-sector gap.' },
  { sector: 'Transportation (off-road)', scope: 1, gpc: 'BASIC+', coverage: 'NE', gap: '~6% of "all" per Wedge Memo. Not quantified at city scale.' },
  { sector: 'Waste (solid + wastewater)', scope: '1+3', gpc: 'BASIC', coverage: 'NE', gap: 'Exported waste = Scope 3. PSREAP has waste data. Cascadia GHG Inventory Report expected to contain LFP-specific figures.' },
  { sector: 'IPPU (refrigerants)', scope: 1, gpc: 'BASIC+', coverage: 'NE', gap: '~7% of "all" per Wedge Memo. HFC fugitive emissions; not speciated at city scale.' },
  { sector: 'AFOLU (urban canopy)', scope: 1, gpc: 'BASIC+', coverage: 'Partial', gap: 'Canopy area 1,476.72 ac (49.9%) confirmed from King County DNRP 2016 GIS study. Annual net sequestration and total carbon stock NE — i-Tree Eco/Canopy run needed.' },
  { sector: 'Consumption-based (CBEI)', scope: 3, gpc: 'BASIC+', coverage: 'Partial', gap: 'Spend-based EEIO estimate: ~123,835 MTCO₂e (±30–40%). EPA SCF v1.3.0 × BLS CE 2019 5th quintile × 5,400 HH. Not confirmed — LFP-specific spending survey or KC PSREAP downscale needed.' },
]

const COVERAGE_STYLES = {
  Confirmed: { bg: '#e8f5e9', color: '#1b5e20', border: '#a5d6a7' },
  Partial:   { bg: '#fff8e1', color: '#e65100', border: '#ffcc80' },
  NE:        { bg: '#fff3e0', color: '#bf360c', border: '#ffcc80' },
}

function CoverageBadge({ status }) {
  const s = COVERAGE_STYLES[status] ?? COVERAGE_STYLES.NE
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: 3,
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      fontSize: '0.75rem', fontWeight: 600,
    }}>
      {status}
    </span>
  )
}

export default function Methodology({ data }) {
  const { manifest, sources } = data

  return (
    <div>
      <h1 style={{ marginBottom: 8 }}>Methodology &amp; Sources</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--sp-6)', maxWidth: 680 }}>
        Full methodology, data coverage, open questions, and citation registry.
        Every number on the site traces to a row in{' '}
        <a href={`${import.meta.env.BASE_URL}data/sources.csv`} target="_blank" rel="noopener noreferrer">sources.csv</a>.
      </p>

      {/* Disclaimer */}
      <div className="draft-banner" role="alert" style={{ marginBottom: 'var(--sp-5)' }}>
        <strong>DRAFT.</strong> {manifest.disclaimer}
      </div>

      {/* §1 GPC Framework */}
      <section aria-labelledby="gpc-heading" className="card" style={{ marginBottom: 'var(--sp-5)' }}>
        <h2 id="gpc-heading">§1 GPC Framework</h2>
        <p>
          This inventory follows the <strong>Global Protocol for Community-Scale GHG Inventories (GPC) v1.1</strong>.
          LFP reports at <strong>BASIC</strong> level (minimum required sectors) with partial <strong>BASIC+</strong> coverage
          for aviation, IPPU, and AFOLU.
        </p>
        <p>
          <strong>Reporting boundary:</strong> Geographic (city limit). For transboundary flows (on-road VMT,
          aviation, imported goods), activity-based attribution is used.
        </p>
        <p><strong>GPC Notation Keys</strong> — required in all GPC inventory tables:</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 8 }}>
          {Object.entries(NOTATION_KEYS).map(([code, def]) => (
            <div key={code}>
              <NotationKey code={code} showLabel />
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2, maxWidth: 160 }}>{def.description}</div>
            </div>
          ))}
        </div>
        <p style={{ margin: 0, fontSize: 'var(--text-sm)' }}>
          Notation keys are first-class in this inventory. A blank cell with <NotationKey code="NE" showLabel={false} /> means
          the emission source <em>exists</em> but has not been quantified — not that emissions are zero.
        </p>
      </section>

      {/* §2 GPC Completeness Map */}
      <section aria-labelledby="completeness-heading" className="card" style={{ marginBottom: 'var(--sp-5)' }}>
        <h2 id="completeness-heading">§2 GPC Completeness Map</h2>
        <p style={{ marginBottom: 12 }}>
          Coverage status for each GPC sector × scope combination. "Confirmed" = value in the inventory CSV.
          "Partial" = narrative % confirmed but absolute MTCO₂e not transcribed. "NE" = not estimated.
        </p>
        <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
          <table aria-label="GPC completeness map">
            <thead>
              <tr>
                <th>Sector</th>
                <th>Scope</th>
                <th>GPC Level</th>
                <th>Coverage</th>
                <th>Gap / Note</th>
              </tr>
            </thead>
            <tbody>
              {COMPLETENESS.map((row, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 500 }}>{row.sector}</td>
                  <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{row.scope}</span></td>
                  <td>
                    <span style={{
                      padding: '1px 6px', borderRadius: 3, fontSize: '0.7rem', fontWeight: 600,
                      background: row.gpc === 'BASIC' ? '#e8f5e9' : '#e3f2fd',
                      color: row.gpc === 'BASIC' ? '#1b5e20' : '#0277bd',
                      border: `1px solid ${row.gpc === 'BASIC' ? '#a5d6a7' : '#90caf9'}`,
                    }}>
                      {row.gpc}
                    </span>
                  </td>
                  <td><CoverageBadge status={row.coverage} /></td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: 400 }}>{row.gap}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* §3 Open data questions */}
      <section aria-labelledby="open-heading" className="card" style={{ marginBottom: 'var(--sp-5)' }}>
        <h2 id="open-heading">§3 Open Questions &amp; Data Gaps</h2>

        {/* Status legend */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16, fontSize: 'var(--text-xs)' }}>
          {[
            { label: '✅ Resolved', bg: '#e8f5e9', color: '#1b5e20' },
            { label: '🔶 Partial', bg: '#fff8e1', color: '#e65100' },
            { label: '⏳ Open',    bg: '#fff3e0', color: '#bf360c' },
          ].map(s => (
            <span key={s.label} style={{ padding: '2px 8px', borderRadius: 3, background: s.bg, color: s.color, fontWeight: 600 }}>
              {s.label}
            </span>
          ))}
        </div>

        <ol style={{ paddingLeft: '1.25em', fontSize: 'var(--text-sm)' }}>
          <li style={{ marginBottom: 14 }}>
            <span style={{ background: '#e8f5e9', color: '#1b5e20', fontWeight: 700, fontSize: '0.7rem', padding: '1px 5px', borderRadius: 3, marginRight: 6 }}>✅ RESOLVED</span>
            <strong>Primary PDF access (wedge memo + VMT study).</strong> The Cascadia Consulting Wedge Memo
            and Fehr &amp; Peers VMT Study have been reviewed directly. All wedge scenario values (Tables 1 and 2)
            and on-road figures (2019/2022/2023) are confirmed. A prior data error (core-footprint
            BAU/ABAU/Local Action mislabeled as "all") was corrected in <code>wedge_scenarios.csv</code>.
          </li>
          <li style={{ marginBottom: 14 }}>
            <span style={{ background: '#fff3e0', color: '#bf360c', fontWeight: 700, fontSize: '0.7rem', padding: '1px 5px', borderRadius: 3, marginRight: 6 }}>⏳ OPEN</span>
            <strong>Stationary energy &amp; waste absolute values.</strong> The Cascadia Wedge Memo covers
            scenario trajectories but not the full sector breakdown with absolute MTCO₂e. The separate
            <strong> Cascadia GHG Inventory Report</strong> (distinct from the Wedge Memo) is expected to
            contain building natural gas, electricity, and waste sector absolute values for 2019.
            Reconciling these will fill the largest remaining NE gaps in the GPC table.
          </li>
          <li style={{ marginBottom: 14 }}>
            <span style={{ background: '#e8f5e9', color: '#1b5e20', fontWeight: 700, fontSize: '0.7rem', padding: '1px 5px', borderRadius: 3, marginRight: 6 }}>✅ RESOLVED</span>
            <strong>Canopy cover (#7).</strong> The 2016 King County DNRP GIS study confirms: total city area
            2,298.31 acres, canopy area 1,476.72 acres, canopy cover 49.9127%. Largest continuous canopy
            patch: 244.66 acres. Tallest tree: 191 ft (Big Tree Park). Study year is 2016 — a 2019 or
            current update has not been confirmed.
          </li>
          <li style={{ marginBottom: 14 }}>
            <span style={{ background: '#fff8e1', color: '#e65100', fontWeight: 700, fontSize: '0.7rem', padding: '1px 5px', borderRadius: 3, marginRight: 6 }}>🔶 PARTIAL</span>
            <strong>Consumption-based inventory (#6).</strong> A spend-based EEIO estimate has been calculated:
            ~123,835 MTCO₂e (±30–40%) using EPA Supply Chain GHG Emission Factors v1.3.0 × BLS Consumer
            Expenditure Survey 2019 highest income quintile × 5,400 LFP households. This is 2.6× the
            territorial core. Remaining steps: (A) validate spending assumptions against LFP-specific data;
            (B) downscale King County PSREAP CBEI as a cross-check; (C) sub-categorize food (meat vs.
            plant-based) and aviation. ⚠ Transport fuels in CBEI overlap with territorial Scope 1 on-road —
            do not add together; these are separate accounting boundaries.
          </li>
          <li style={{ marginBottom: 14 }}>
            <span style={{ background: '#fff3e0', color: '#bf360c', fontWeight: 700, fontSize: '0.7rem', padding: '1px 5px', borderRadius: 3, marginRight: 6 }}>⏳ OPEN</span>
            <strong>i-Tree assessment (AFOLU sequestration).</strong> With 1,476.72 confirmed canopy acres,
            an <strong>i-Tree Canopy</strong> or <strong>i-Tree Eco</strong> run is the logical next step.
            Regional Pacific Northwest benchmarks suggest ~0.3–1.5 MTCO₂e sequestered per canopy acre per year
            (440–2,200 MTCO₂e/yr total — 1–5% offset of core emissions). USDA Forest Service tools are free;
            contact WA DNR Urban &amp; Community Forestry program for facilitation.
          </li>
          <li>
            <span style={{ background: '#fff3e0', color: '#bf360c', fontWeight: 700, fontSize: '0.7rem', padding: '1px 5px', borderRadius: 3, marginRight: 6 }}>⏳ OPEN</span>
            <strong>PSREAP methodology consistency.</strong> King County PSREAP changed methodology between
            2017, 2019, and 2022 data releases. Any historical comparison using PSREAP data (waste, consumption)
            requires back-casting to a consistent method. Flag when using PSREAP-derived figures.
          </li>
        </ol>
      </section>

      {/* §4 C→CO₂e */}
      <section aria-labelledby="conversion-heading" className="card" style={{ marginBottom: 'var(--sp-5)' }}>
        <h2 id="conversion-heading">§4 C → CO₂e Conversion</h2>
        <p>
          Canopy carbon stock values from i-Tree are measured in <strong>tonnes of carbon (C)</strong>.
          The GHG inventory uses <strong>MTCO₂e (metric tonnes CO₂-equivalent)</strong>. Conversion:
        </p>
        <pre style={{
          background: 'var(--bg)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)', padding: 'var(--sp-3)',
          fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', overflow: 'auto',
        }}>
{`// format.js
export const C_TO_CO2E = 44 / 12  // ≈ 3.6667

export function carbonToMTCO2e(carbonTonnes) {
  return carbonTonnes * C_TO_CO2E
}
// CSV stores raw tonnes C; conversion applied in code only`}
        </pre>
        <p style={{ marginBottom: 0, fontSize: 'var(--text-sm)' }}>
          The manifest confirms <code>carbon_to_co2e_factor: {manifest.carbon_to_co2e_factor}</code>.
          Raw measured values are preserved in the CSV; only the display layer applies the conversion.
        </p>
      </section>

      {/* §5 Forking for another city */}
      <section aria-labelledby="fork-heading" className="card" style={{ marginBottom: 'var(--sp-5)' }}>
        <h2 id="fork-heading">§5 Fork for Another City</h2>
        <p>This project is designed to be forkable. To adapt it for a different city:</p>
        <ol style={{ paddingLeft: '1.25em', fontSize: 'var(--text-sm)' }}>
          <li style={{ marginBottom: 6 }}>Fork <a href="https://github.com/kelaxten/lfp-climate" target="_blank" rel="noopener noreferrer">kelaxten/lfp-climate</a> on GitHub.</li>
          <li style={{ marginBottom: 6 }}>Edit <code>/data/manifest.json</code> — update <code>city</code>, <code>baseline_year</code>, <code>latest_year</code>, <code>available_years</code>, <code>last_updated</code>, <code>maintainer</code>.</li>
          <li style={{ marginBottom: 6 }}>Replace the CSV files in <code>/data/</code> with your city's data, using the same column schemas (see README §Data Schemas).</li>
          <li style={{ marginBottom: 6 }}>Update <code>vite.config.js</code> → <code>base: '/your-repo-name/'</code> and the workflow <code>.github/workflows/deploy.yml</code>.</li>
          <li style={{ marginBottom: 6 }}>Enable GitHub Pages in repo Settings → Pages → Source: GitHub Actions.</li>
          <li>Push to <code>main</code> — the site will build and deploy automatically.</li>
        </ol>
        <p style={{ fontSize: 'var(--text-sm)', marginBottom: 0 }}>
          No code changes are needed to swap cities — only data files. All derived values (% change,
          C→CO₂e, gap-to-target) are computed from the CSVs at build time.
          Code: MIT · Data: CC BY 4.0.
        </p>
      </section>

      {/* §6 Download hub */}
      <section aria-labelledby="downloads-heading" className="card" style={{ marginBottom: 'var(--sp-5)' }}>
        <h2 id="downloads-heading">§6 Download All Data</h2>
        <p style={{ fontSize: 'var(--text-sm)', marginBottom: 16 }}>
          All data files are plain text (JSON/CSV) released under{' '}
          <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0</a>.
          Cite as: <em>LFP Climate Hub, Lake Forest Park Community GHG Inventory, {new Date().getFullYear()}.</em>
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 'var(--sp-3)' }}>
          {[
            {
              file: 'manifest.json',
              label: 'Manifest',
              desc: 'City metadata, confirmed figures, baseline year, GPC version.',
              icon: '🗂️',
            },
            {
              file: 'sources.csv',
              label: 'Source Registry',
              desc: 'All citations, URLs, access dates, reliability notes.',
              icon: '📚',
            },
            {
              file: 'inventory_2019.csv',
              label: 'GPC Inventory 2019',
              desc: 'Full GPC sector × scope table with notation keys. Baseline year.',
              icon: '📋',
            },
            {
              file: 'inventory_2023.csv',
              label: 'GPC Inventory 2023',
              desc: 'GPC inventory for latest year. On-road confirmed; other sectors NE.',
              icon: '📋',
            },
            {
              file: 'wedge_scenarios.csv',
              label: 'Wedge Scenarios',
              desc: 'BAU, ABAU, Local Action, Target trajectories 2019–2050. Both footprints.',
              icon: '📉',
            },
            {
              file: 'consumption_based.csv',
              label: 'Consumption CBEI',
              desc: 'Spend-based EEIO estimate by category. ±30–40% uncertainty.',
              icon: '🛒',
            },
            {
              file: 'canopy_afolu.csv',
              label: 'Canopy / AFOLU',
              desc: 'Urban canopy metrics. Area/cover confirmed 2016; sequestration NE.',
              icon: '🌲',
            },
          ].map(({ file, label, desc, icon }) => (
            <a
              key={file}
              href={`${import.meta.env.BASE_URL}data/${file}`}
              download
              style={{ textDecoration: 'none' }}
              aria-label={`Download ${label} (${file})`}
            >
              <div
                className="card"
                style={{
                  display: 'flex', flexDirection: 'column', gap: 4,
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--color-forest-lt)'
                  e.currentTarget.style.boxShadow = 'var(--shadow)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border)'
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{icon} {label}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-sky)', fontWeight: 600 }}>↓ {file.split('.')[1].toUpperCase()}</span>
                </div>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{desc}</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--border)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>{file}</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* §7 Full source list */}
      <section aria-labelledby="sources-heading" className="card">
        <h2 id="sources-heading">§7 Source Registry</h2>
        <p style={{ fontSize: 'var(--text-sm)', marginBottom: 12 }}>
          All {sources.length} sources. ⚠ = reliability note present; hover for details.
          Download: <a href={`${import.meta.env.BASE_URL}data/sources.csv`} download>sources.csv</a>
        </p>
        <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
          <table aria-label="Full source registry">
            <thead>
              <tr>
                <th>ID</th>
                <th>Citation</th>
                <th>Type</th>
                <th>Accessed</th>
                <th>Reliability</th>
              </tr>
            </thead>
            <tbody>
              {sources.map((src) => (
                <tr key={src.source_id}>
                  <td>
                    <code style={{ fontSize: '0.75rem', color: 'var(--color-forest)' }}>{src.source_id}</code>
                  </td>
                  <td style={{ fontSize: '0.8rem' }}>
                    {src.url ? (
                      <a href={src.url} target="_blank" rel="noopener noreferrer">{src.citation}</a>
                    ) : src.citation}
                  </td>
                  <td>
                    <span style={{
                      padding: '1px 5px', borderRadius: 2, fontSize: '0.7rem',
                      background: src.type === 'primary' ? '#e8f5e9' : src.type === 'secondary' ? '#e3f2fd' : src.type === 'estimate' ? '#fff3e0' : '#fce4ec',
                      color: src.type === 'primary' ? '#1b5e20' : src.type === 'secondary' ? '#0277bd' : src.type === 'estimate' ? '#bf360c' : '#880e4f',
                      border: '1px solid currentColor',
                      fontWeight: 600,
                    }}>
                      {src.type}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{src.accessed}</td>
                  <td style={{ fontSize: '0.75rem', color: src.reliability_note ? '#e65100' : 'var(--text-muted)', maxWidth: 300 }}>
                    {src.reliability_note ? `⚠ ${src.reliability_note}` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
