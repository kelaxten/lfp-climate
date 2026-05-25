/**
 * Methodology — GPC completeness map, source list, fork instructions.
 * Renders from METHODOLOGY.md (loaded as raw text) + sources.csv data.
 */
import Citation from '../components/Citation.jsx'
import NotationKey from '../components/NotationKey.jsx'
import { NOTATION_KEYS } from '../lib/gpc.js'

// GPC completeness map — structured data for the table
const COMPLETENESS = [
  { sector: 'Stationary Energy (nat. gas)', scope: 1, gpc: 'BASIC', coverage: 'Confirmed', gap: 'Confirmed from Cascadia GHG Inventory Report Table 3: 19,007 / 21,352 / 21,021 MTCO₂e (2019/2022/2023). PSE-provided consumption × utility EFs. Residential/commercial split available.' },
  { sector: 'Stationary Energy (electricity)', scope: 2, gpc: 'BASIC', coverage: 'Confirmed', gap: 'Confirmed: 1,049 / 950 / 2,909 MTCO₂e. ~99% Seattle City Light. 2023 spike driven by a 352% rise in SCL reported carbon intensity, not consumption. WA Dept. of Ecology utility-specific EFs.' },
  { sector: 'Stationary Energy (other fuels)', scope: 1, gpc: 'BASIC+', coverage: 'Confirmed', gap: 'Confirmed: fuel oil + propane 2,831 / 4,060 / 3,726 MTCO₂e. WA EIA consumption scaled by population × EPA EF Hub.' },
  { sector: 'Transportation (on-road)', scope: '1+3', gpc: 'BASIC', coverage: 'Confirmed', gap: 'Confirmed: 25,364 / 23,322 / 23,450 MTCO₂e (matches Fehr & Peers VMT Study). PSRC model + StreetLight adjustment. >90% transboundary (Scope 3).' },
  { sector: 'Transportation (aviation)', scope: 3, gpc: 'BASIC+', coverage: 'Confirmed', gap: 'Confirmed: 31,916 / 25,484 / 28,452 MTCO₂e — the single largest source. SeaTac jet-A fuel allocated to cities by passenger survey + population + median household income.' },
  { sector: 'Transportation (off-road)', scope: 1, gpc: 'BASIC+', coverage: 'Confirmed', gap: 'Confirmed: 6,047 / 6,313 / 6,377 MTCO₂e. EPA MOVES model run at county level scaled by city population.' },
  { sector: 'Waste (solid + compost)', scope: '1+3', gpc: 'BASIC', coverage: 'Confirmed', gap: 'Confirmed: landfill + compost 1,755 / 2,030 / 1,960 MTCO₂e. King County waste characterization × EPA WARM. Exported landfill waste = Scope 3. Wastewater not separately reported.' },
  { sector: 'IPPU (refrigerants)', scope: 1, gpc: 'BASIC+', coverage: 'Confirmed', gap: 'Confirmed: 7,048 / 7,471 / 7,493 MTCO₂e. High-GWP HFCs from AC/refrigeration, estimated from EPA national inventory scaled by population.' },
  { sector: 'AFOLU (tree loss / source)', scope: 1, gpc: 'BASIC+', coverage: 'Confirmed', gap: 'Confirmed: 727 / 510 / 510 MTCO₂e from canopy loss (counted in gross total). ICLEI LEARN tool with city GIS boundary.' },
  { sector: 'AFOLU (sequestration / sink)', scope: 1, gpc: 'BASIC+', coverage: 'Confirmed', gap: 'Confirmed: −5,535 / −5,550 / −5,550 MTCO₂e/yr (ICLEI LEARN). Reported separately from gross emissions (not netted). Offsets ~5.8% of gross. Carbon STOCK still NE — i-Tree Eco.' },
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
          Coverage status for each GPC sector × scope combination. The territorial inventory is now
          <strong> fully populated</strong> for 2019, 2022, and 2023 from the Cascadia GHG Inventory Report.
          "Confirmed" = value in the inventory CSV. "Partial" = estimate only (CBEI). "NE" = not estimated.
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
            <span style={{ background: '#e8f5e9', color: '#1b5e20', fontWeight: 700, fontSize: '0.7rem', padding: '1px 5px', borderRadius: 3, marginRight: 6 }}>✅ RESOLVED</span>
            <strong>Stationary energy, waste, aviation, off-road, refrigerants.</strong> The
            <strong> Cascadia GHG Inventory Report</strong> (2025) provides the full sector breakdown with
            absolute MTCO₂e for 2019, 2022, and 2023 — communitywide totals 95,745 / 91,491 / 95,897.
            All previously-NE sectors are now confirmed in the inventory CSVs. Note this report's total
            (95,745, 2019) differs ~0.3% from the Wedge Memo baseline (95,996); the inventory is canonical
            for historical sector values, the Wedge Memo for 2050 scenario trajectories.
          </li>
          <li style={{ marginBottom: 14 }}>
            <span style={{ background: '#e8f5e9', color: '#1b5e20', fontWeight: 700, fontSize: '0.7rem', padding: '1px 5px', borderRadius: 3, marginRight: 6 }}>✅ RESOLVED</span>
            <strong>Canopy cover &amp; sequestration (#7).</strong> The 2016 King County DNRP GIS study confirms
            canopy area 1,476.72 ac (49.9%), largest patch 244.66 ac, tallest tree 191 ft (Big Tree Park).
            The GHG Inventory Report adds the confirmed annual sequestration flux (−5,535/−5,550 MTCO₂e/yr,
            ICLEI LEARN tool) and tree-loss emissions (727/510/510). Only the standing carbon STOCK and
            tree count remain NE (i-Tree Eco run).
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
            <span style={{ background: '#fff8e1', color: '#e65100', fontWeight: 700, fontSize: '0.7rem', padding: '1px 5px', borderRadius: 3, marginRight: 6 }}>🔶 PARTIAL</span>
            <strong>i-Tree Eco for canopy carbon STOCK.</strong> Annual sequestration flux is now confirmed
            via ICLEI LEARN (−5,550 MTCO₂e/yr, ~3.8 MTCO₂e/canopy-acre/yr — higher than generic regional
            benchmarks, reflecting LFP's mature conifer canopy). What remains NE is the standing carbon
            <em> stock</em> (tonnes C in biomass) and tree count. With 1,476.72 confirmed canopy acres as
            input geometry, an <strong>i-Tree Eco</strong> run would close this and refine the LEARN flux.
            USDA Forest Service tools are free; WA DNR Urban &amp; Community Forestry can facilitate.
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
