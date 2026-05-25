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
  const findYear = (metric, year) => canopy.find(r => r.metric === metric && String(r.year) === String(year))

  const cover = find('Canopy cover')
  const cityArea = find('Total city area')
  const canopyArea = find('Canopy area')
  const largestPatch = find('Largest continuous canopy area')
  const tallestTree = find('Tallest tree')
  const stock = find('Total carbon stock')
  const seq = findYear('Annual net sequestration', 2023) ?? find('Annual net sequestration')
  const treeLoss = findYear('Tree loss emissions', 2023) ?? find('Tree loss emissions')
  const treeCount = find('Tree count estimate')

  const community2023 = cf.communitywide_2023_mtco2e
  const seqAbs = seq?.value != null ? Math.abs(seq.value) : null
  const seqPctOfGross = seqAbs != null ? (seqAbs / community2023 * 100) : null
  const netFlux = (seq?.value != null && treeLoss?.value != null) ? (treeLoss.value + seq.value) : null

  return (
    <div>
      <h1 style={{ marginBottom: 8 }}>Urban Canopy &amp; AFOLU Sink</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--sp-5)', maxWidth: 680 }}>
        LFP's urban tree canopy acts as a carbon sink — sequestering CO₂ from the atmosphere annually
        and storing it as biomass. Under the GPC AFOLU sector (Agriculture, Forestry, and Other Land Use),
        this is reported as a negative emission (a sink) offsetting a share of gross community emissions.
        Canopy area/cover are confirmed from the 2016 King County DNRP GIS study, and the annual
        sequestration flux is now confirmed from the Cascadia GHG Inventory Report (ICLEI LEARN tool).
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
            label="Annual Sequestration (2023)"
            value={seqAbs != null ? `−${fmtNumber(seqAbs)}` : 'NE'}
            unit="MTCO₂e / year (sink)"
            subtext={seqPctOfGross != null
              ? `Confirmed via ICLEI LEARN (Cascadia GHG Inventory). Offsets ~${seqPctOfGross.toFixed(1)}% of gross communitywide emissions.`
              : 'Requires assessment.'}
          />
          <StatCard
            label="Net Land-Use Flux (2023)"
            value={netFlux != null ? fmtNumber(netFlux) : '—'}
            unit="MTCO₂e / year"
            subtext={netFlux != null
              ? `Tree loss (+${fmtNumber(treeLoss.value)}) minus sequestration (−${fmtNumber(seqAbs)}) = net sink. Loss is counted in the gross total; sequestration reported separately.`
              : ''}
          />
          <StatCard
            label="Total Carbon Stock"
            value={stock?.value != null ? fmtNumber(stock.value) : 'NE'}
            unit={stock?.unit ?? 'tonnes C'}
            subtext="Standing carbon in tree biomass (distinct from annual flux). Still requires an i-Tree Eco run."
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
          The Cascadia GHG Inventory Report quantified the annual sequestration flux using ICLEI's
          <strong> LEARN</strong> tool (Land Emissions And Removals Navigator) with LFP's GIS boundary.
          A formal <strong>i-Tree Eco</strong> run would still add the standing <em>carbon stock</em> (currently NE)
          and refine the flux estimate. With the confirmed 1,477-acre canopy area as input geometry, it remains
          a worthwhile next step. See <Link to="/methodology">Methodology §4</Link>.
        </p>
      </div>

      {/* How the sink relates to gross emissions */}
      <div className="card" style={{ borderLeft: '4px solid var(--color-forest)' }}>
        <h3 style={{ marginBottom: 8 }}>How the canopy sink relates to gross emissions</h3>
        <p style={{ fontSize: 'var(--text-sm)', marginBottom: 8 }}>
          The canopy sequesters a confirmed <strong>{seqAbs != null ? fmtNumber(seqAbs) : '~5,550'} MTCO₂e/yr</strong> (ICLEI LEARN,
          2023), which offsets about <strong>{seqPctOfGross != null ? seqPctOfGross.toFixed(1) : '~5.8'}%</strong> of
          gross communitywide emissions ({fmtNumber(community2023)} MTCO₂e). This is roughly{' '}
          <strong>{seqAbs != null ? (seqAbs / 1476.72).toFixed(1) : '3.8'} MTCO₂e per canopy acre per year</strong> across
          the 1,476.72-acre canopy — notably higher than generic regional i-Tree benchmarks (0.3–1.5 MTCO₂e/ac/yr),
          reflecting LFP's dense, mature conifer-dominated canopy. Tree loss adds back{' '}
          <strong>+{treeLoss?.value != null ? fmtNumber(treeLoss.value) : '510'} MTCO₂e/yr</strong> (counted in the
          gross total), for a net land-use flux of <strong>{netFlux != null ? fmtNumber(netFlux) : '−5,040'} MTCO₂e/yr</strong>.
        </p>
        <p style={{ fontSize: 'var(--text-sm)', marginBottom: 0 }}>
          This makes canopy a meaningful but secondary lever — it offsets a single-digit percentage of gross
          emissions, far less than the cuts needed from aviation, buildings, and on-road transport. But protecting
          and expanding the 1,477-acre canopy delivers co-benefits (stormwater, heat island, biodiversity, air quality)
          that amplify its value well beyond the carbon offset alone. The tallest tree — a 191-ft specimen in Big Tree
          Park — represents the kind of legacy carbon stock that takes centuries to replace if lost.
        </p>
      </div>
    </div>
  )
}
