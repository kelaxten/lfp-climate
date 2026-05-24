/**
 * Canopy — AFOLU urban tree canopy & sequestration sink view.
 * Deliverable #7. Shows confirmed canopy cover; all sequestration/stock NE.
 * C→CO₂e conversion shown explicitly.
 */
import StatCard from '../components/StatCard.jsx'
import NotationKey from '../components/NotationKey.jsx'
import Citation from '../components/Citation.jsx'
import { C_TO_CO2E, fmtNumber, fmtMTCO2e } from '../lib/format.js'
import { Link } from 'react-router-dom'

export default function Canopy({ data }) {
  const { canopy, manifest } = data
  const cf = manifest.confirmed_figures

  const find = (metric) => canopy.find(r => r.metric === metric)

  const cover = find('Canopy cover')
  const cityArea = find('Total city area')
  const canopyArea = find('Canopy area')
  const largestPatch = find('Largest continuous canopy area')
  const tallestTree = find('Tallest tree')
  const stock = find('Total carbon stock')
  const seq = find('Annual net sequestration')
  const treeCount = find('Tree count estimate')

  return (
    <div>
      <h1 style={{ marginBottom: 8 }}>Urban Canopy &amp; AFOLU Sink</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--sp-5)', maxWidth: 680 }}>
        LFP's urban tree canopy acts as a carbon sink — sequestering CO₂ from the atmosphere annually
        and storing it as biomass. Under the GPC AFOLU sector (Agriculture, Forestry, and Other Land Use),
        this is reported as a negative emission (a sink) offsetting a share of gross community emissions.
        Canopy area and cover are confirmed from the 2016 King County DNRP GIS study.
      </p>

      {/* Stat cards */}
      <section aria-labelledby="canopy-stats-heading" style={{ marginBottom: 'var(--sp-6)' }}>
        <h2 id="canopy-stats-heading" className="sr-only">Canopy statistics</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--sp-4)',
        }}>
          <StatCard
            label="Canopy Cover (2016)"
            value={cover?.value != null ? `${Number(cover.value).toFixed(1)}%` : '—'}
            unit={`${fmtNumber(canopyArea?.value)} of ${fmtNumber(cityArea?.value)} acres`}
            subtext="Confirmed from King County DNRP GIS parcel analysis. Study year 2016 — treat as approximate 2019 baseline."
          />
          <StatCard
            label="Largest Canopy Patch"
            value={largestPatch?.value != null ? `${fmtNumber(largestPatch.value)} ac` : '—'}
            unit="contiguous canopy area"
            subtext="Largest single uninterrupted canopy block, likely forested park land."
          />
          <StatCard
            label="Annual Net Sequestration"
            value={seq?.value != null ? fmtMTCO2e(seq.value) : 'NE'}
            unit="MTCO₂e / year"
            subtext="Requires i-Tree Eco or i-Tree Canopy assessment. Regional benchmarks suggest ~500–2,000 MTCO₂e/yr."
            draft
          />
          <StatCard
            label="Total Carbon Stock"
            value={stock?.value != null ? fmtNumber(stock.value) : 'NE'}
            unit={stock?.unit ?? 'tonnes C'}
            subtext="Standing carbon in tree biomass. Requires i-Tree Eco run."
            draft
          />
          <StatCard
            label="Tree Count Estimate"
            value={treeCount?.value != null ? fmtNumber(treeCount.value) : 'NE'}
            unit="trees"
            subtext="Requires i-Tree Eco or canopy survey."
            draft
          />
        </div>
      </section>

      {/* C → CO₂e conversion box */}
      <div
        className="card"
        style={{ borderLeft: '4px solid var(--color-forest)', marginBottom: 'var(--sp-5)', background: '#f1f8e9' }}
        role="note"
        aria-label="Carbon to CO2e conversion methodology"
      >
        <h2 style={{ marginBottom: 10, fontSize: 'var(--text-xl)' }}>C → CO₂e Conversion</h2>
        <p>
          i-Tree and forest inventory tools typically report carbon stocks in <strong>tonnes of carbon (C)</strong>.
          To compare with the GHG inventory (which uses MTCO₂e), we apply the stoichiometric conversion:
        </p>
        <div
          style={{
            background: 'white',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            padding: 'var(--sp-3) var(--sp-4)',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-sm)',
            margin: '12px 0',
          }}
          aria-label="CO2e conversion formula"
        >
          CO₂e (tonnes) = C (tonnes) × (44 / 12) ≈ C × {C_TO_CO2E.toFixed(4)}
        </div>
        <p style={{ marginBottom: 0 }}>
          This is based on the molecular weight ratio of CO₂ (44 g/mol) to C (12 g/mol).
          <strong> The CSV stores raw measured values in tonnes C. The conversion to MTCO₂e
          is applied in code (</strong><code>format.js: carbonToMTCO2e()</code><strong>), not in the data file</strong>,
          preserving the original measured values and making the conversion transparent and auditable.
        </p>
      </div>

      {/* Full data table */}
      <div className="card" style={{ marginBottom: 'var(--sp-5)' }}>
        <h2 style={{ marginBottom: 'var(--sp-4)', fontSize: 'var(--text-xl)' }}>AFOLU Data Table</h2>
        <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
          <table aria-label="AFOLU canopy metrics">
            <thead>
              <tr>
                <th>Metric</th>
                <th style={{ textAlign: 'right' }}>Value</th>
                <th>Unit</th>
                <th>Year</th>
                <th>Method</th>
                <th>Status</th>
                <th>Source</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {canopy.map((row, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 500 }}>{row.metric}</td>
                  <td style={{ textAlign: 'right' }}>
                    {row.value != null ? fmtNumber(row.value) : <NotationKey code="NE" showLabel={false} />}
                  </td>
                  <td style={{ fontSize: '0.8rem' }}>{row.unit || '—'}</td>
                  <td>{row.year || '—'}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{row.method}</td>
                  <td>
                    {row.confirmed === 'yes' || row.confirmed === true
                      ? <span style={{ color: 'var(--color-forest)', fontWeight: 600, fontSize: '0.8rem' }}>Partial ✓</span>
                      : <NotationKey code="NE" showLabel={false} />}
                  </td>
                  <td><Citation source={row._source}>{row.source_id}</Citation></td>
                  <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: 280 }}>{row.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ marginTop: 8, fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
          Download: <a href={`${import.meta.env.BASE_URL}data/canopy_afolu.csv`} download>canopy_afolu.csv</a>
        </p>
      </div>

      {/* Context: canopy as a stock at risk */}
      <div className="card" style={{ borderLeft: '4px solid var(--color-amber)', background: '#fff8f5', marginBottom: 'var(--sp-5)' }}>
        <h3 style={{ marginBottom: 8 }}>Canopy as a stock at risk</h3>
        <p style={{ marginBottom: 8, fontSize: 'var(--text-sm)' }}>
          LFP's <strong>49.9% canopy cover — 1,476.72 acres out of 2,298.31 total city acres</strong> — is
          exceptional for a suburban community in the Pacific Northwest. The canopy map shows most residential
          parcels at &gt;50% cover (dark green), with the 244-acre largest continuous patch likely corresponding
          to forested parks and open space. This canopy represents a significant carbon stock that must be protected.
          Key risks:
        </p>
        <ul style={{ fontSize: 'var(--text-sm)', margin: 0, paddingLeft: '1.25em' }}>
          <li><strong>Development and impervious surface expansion</strong> — the parcel-level map shows canopy gaps (red/orange parcels, &lt;15–25% cover) concentrated in the town center and along arterials; infill development extends these gaps</li>
          <li><strong>Climate stress</strong> — drought, heat stress, and novel pests (spotted lanternfly, emerald ash borer moving north) threaten tree health</li>
          <li><strong>Storm damage</strong> — large conifer blowdowns are a recurring feature of LFP's climate</li>
        </ul>
        <p style={{ marginTop: 8, marginBottom: 0, fontSize: 'var(--text-sm)' }}>
          A formal <strong>i-Tree Canopy</strong> or <strong>i-Tree Eco</strong> assessment would quantify the
          current carbon stock, annual sequestration rate, and canopy service values. With the confirmed 1,477-acre
          canopy area as input geometry, an i-Tree run is the logical next step. See <Link to="/methodology">Methodology §4</Link>.
        </p>
      </div>

      {/* How the sink relates to gross emissions */}
      <div className="card" style={{ borderLeft: '4px solid var(--color-forest)' }}>
        <h3 style={{ marginBottom: 8 }}>How the canopy sink relates to gross emissions</h3>
        <p style={{ fontSize: 'var(--text-sm)', marginBottom: 8 }}>
          Once quantified, the annual net sequestration (MTCO₂e/yr) can be compared directly to gross community
          emissions. With <strong>1,476.72 confirmed canopy acres</strong> and the community core baseline
          of <strong>47,427 MTCO₂e/yr</strong>, even a generous sequestration estimate would offset only a small
          fraction of gross emissions. Pacific Northwest urban forest benchmarks (i-Tree regional studies) suggest
          roughly <strong>0.3–1.5 MTCO₂e per canopy acre per year</strong>, implying LFP's canopy sequesters
          approximately <strong>440–2,200 MTCO₂e/yr</strong> — about 1–5% of the core emissions baseline.
        </p>
        <p style={{ fontSize: 'var(--text-sm)', marginBottom: 0 }}>
          This makes canopy a meaningful but secondary lever. Protecting and expanding the 1,477-acre canopy
          delivers co-benefits (stormwater, heat island, biodiversity, air quality) that amplify its value well
          beyond the carbon offset alone. The tallest tree — a 191-ft specimen in Big Tree Park — represents
          the kind of legacy carbon stock that takes centuries to replace if lost.
        </p>
      </div>
    </div>
  )
}
