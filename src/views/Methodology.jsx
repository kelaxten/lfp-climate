/**
 * Methodology — GPC completeness map, source list, fork instructions.
 * Renders from METHODOLOGY.md (loaded as raw text) + sources.csv data.
 */
import Citation from '../components/Citation.jsx'
import NotationKey from '../components/NotationKey.jsx'
import { NOTATION_KEYS } from '../lib/gpc.js'

// GPC completeness map — structured data for the table
const COMPLETENESS = [
  { sector: 'Stationary Energy', scope: 1, gpc: 'BASIC', coverage: 'Partial', gap: 'Building natural gas aggregate confirmed via Wedge Memo narrative (% share); absolute MTCO₂e not transcribed. Reconcile with Wedge Memo Table 1/2.' },
  { sector: 'Stationary Energy', scope: 2, gpc: 'BASIC', coverage: 'NE', gap: 'City-scale electricity totals not available. PSE decarbonization path tracked but absolute value not compiled. PSE eliminated coal Jan 1 2026; CETA requires GHG-neutral by 2030.' },
  { sector: 'Transportation (on-road)', scope: '1+3', gpc: 'BASIC', coverage: 'Confirmed', gap: 'Total on-road confirmed from Fehr & Peers VMT Study (Table 2). Scope 1 vs. 3 split NE (>90% transboundary).' },
  { sector: 'Transportation (aviation)', scope: 3, gpc: 'BASIC+', coverage: 'NE', gap: '~32% of "all" emissions per Wedge Memo. Income-allocated per-capita method. Absolute not transcribed. Largest single NE gap.' },
  { sector: 'Transportation (off-road)', scope: 1, gpc: 'BASIC+', coverage: 'NE', gap: '~6% of "all" per Wedge Memo narrative. Not quantified at city scale.' },
  { sector: 'Waste (solid)', scope: 3, gpc: 'BASIC', coverage: 'NE', gap: '~2% of emissions per framing. Exported waste = Scope 3. PSREAP has data; not yet compiled at LFP scale.' },
  { sector: 'Waste (wastewater)', scope: 1, gpc: 'BASIC', coverage: 'NE', gap: 'Not estimated in any available LFP source.' },
  { sector: 'IPPU (refrigerants)', scope: 1, gpc: 'BASIC+', coverage: 'NE', gap: '~7% of "all" per Wedge Memo. HFC fugitive emissions; not speciated.' },
  { sector: 'AFOLU (urban canopy)', scope: 1, gpc: 'BASIC+', coverage: 'NE', gap: 'Canopy cover ~50% confirmed (qualitative). No i-Tree Eco/Canopy run completed. Sequestration NE.' },
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
        <h2 id="open-heading">§3 Open Questions &amp; Deferred Items</h2>
        <ol style={{ paddingLeft: '1.25em', fontSize: 'var(--text-sm)' }}>
          <li style={{ marginBottom: 12 }}>
            <strong>403 fetch errors on primary PDFs.</strong> The Cascadia Consulting Wedge Memo
            (<code>src-cascadia-wedge</code>) and Fehr &amp; Peers VMT Study (<code>src-fehrpeers-vmt</code>)
            both returned HTTP 403 during research. Scenario percentages and on-road figures were confirmed
            via indexed snippets and secondary coverage. <em>Before any public launch, confirm cell-level
            figures against the source PDFs.</em>
          </li>
          <li style={{ marginBottom: 12 }}>
            <strong>PSREAP methodology change.</strong> King County PSREAP changed methodology between
            2017, 2019, and 2022 data releases. Historical comparisons require back-casting to a consistent
            method. This affects waste and any PSREAP-derived consumption-based figures.
          </li>
          <li style={{ marginBottom: 12 }}>
            <strong>Consumption-based inventory (#6).</strong> No CBEI currently exists for LFP.
            Options: (A) downscale King County PSREAP CBEI by population/income share;
            (B) spend-based EEIO using BLS Consumer Expenditure Survey stratified by LFP median income (~$150k+).
            Option B is more transparent for a wealthy outlier community.
          </li>
          <li>
            <strong>i-Tree assessment (#7).</strong> LFP's ~50% canopy cover is confirmed qualitatively
            from the CAP. To quantify the AFOLU sink, an <strong>i-Tree Canopy</strong> or
            <strong>i-Tree Eco</strong> assessment is needed. USDA Forest Service provides these tools free.
            Contact the WA DNR Urban &amp; Community Forestry program for assistance.
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

      {/* §6 Full source list */}
      <section aria-labelledby="sources-heading" className="card">
        <h2 id="sources-heading">§6 Source Registry</h2>
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
