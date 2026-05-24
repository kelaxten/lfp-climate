/**
 * Overview — plain-language landing page with headline stat cards.
 * All numbers pulled from manifest.confirmed_figures or derived from inventory.
 */
import { Link } from 'react-router-dom'
import StatCard from '../components/StatCard.jsx'
import { fmtMTCO2e, fmtNumber } from '../lib/format.js'

export default function Overview({ data }) {
  const { manifest, inventory } = data
  const cf = manifest.confirmed_figures

  // On-road is the only confirmed absolute figure for the full community
  const onRoad2019 = cf.on_road_total_2019_mtco2e
  const onRoad2023 = cf.on_road_total_2023_mtco2e
  const pctChange = onRoad2023 != null && onRoad2019 != null
    ? ((onRoad2023 - onRoad2019) / onRoad2019) * 100
    : null

  // Gap to 2030 target: need full 2019 baseline (not available as confirmed absolute)
  const target2030PctChange = cf.target_2030_pct_change // -50

  return (
    <div>
      {/* Draft disclaimer */}
      <div className="draft-banner" role="alert" aria-live="polite" style={{ marginBottom: 'var(--sp-5)' }}>
        <strong>DRAFT FOR REVIEW.</strong> {manifest.disclaimer}
      </div>

      <h1 style={{ marginBottom: 8 }}>Lake Forest Park Community GHG Inventory</h1>
      <p style={{ fontSize: 'var(--text-lg)', color: 'var(--text-muted)', marginBottom: 'var(--sp-6)', maxWidth: 680 }}>
        A public, peer-reviewable emissions inventory for Lake Forest Park, WA — built on open data,
        conformant with the{' '}
        <a href="https://ghgprotocol.org/global-protocol-community-scale-greenhouse-gas-emission-inventories" target="_blank" rel="noopener noreferrer">
          Global Protocol for Community-Scale GHG Inventories (GPC)
        </a>{' '}
        v{manifest.gpc_version}.
      </p>

      {/* Headline stat cards */}
      <section aria-labelledby="stats-heading">
        <h2 id="stats-heading" className="sr-only">Headline statistics</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'var(--sp-4)',
          marginBottom: 'var(--sp-7)',
        }}>

          <StatCard
            label="On-Road Emissions (2023)"
            value={fmtNumber(onRoad2023)}
            unit="MTCO₂e"
            subtext="Largest confirmed emissions source. Total community baseline pending source PDF reconciliation."
            draft
          />

          <StatCard
            label="Change vs. 2019 Baseline"
            value={pctChange != null ? `${pctChange > 0 ? '+' : ''}${pctChange.toFixed(1)}%` : '—'}
            unit="On-road only (2019 → 2023)"
            subtext={`2019 on-road: ${fmtNumber(onRoad2019)} MTCO₂e`}
            trend={pctChange != null ? (pctChange < 0 ? 'down' : 'up') : null}
            trendGood={false}
            draft
          />

          <StatCard
            label="Largest Confirmed Source"
            value="Transportation"
            unit="On-road vehicles"
            subtext={`≈31% of community total pre-aviation (confirmed). Aviation (~32%) adds Scope 3.`}
            draft
          />

          <StatCard
            label="2030 Adopted Target"
            value={`${target2030PctChange}%`}
            unit="vs. 2019 baseline"
            subtext={`City Council goal: −50% by 2030, −75% by 2040, −95% by 2050`}
            trend="down"
            trendGood={false}
          />

        </div>
      </section>

      {/* What this is */}
      <section aria-labelledby="about-heading" className="card" style={{ marginBottom: 'var(--sp-5)' }}>
        <h2 id="about-heading" style={{ marginBottom: 'var(--sp-3)' }}>What is a GPC community inventory?</h2>
        <p>
          The <strong>Global Protocol for Community-Scale GHG Inventories (GPC)</strong> is an international
          standard (v1.1) for measuring greenhouse gas emissions from cities and communities. It defines
          emission <em>sectors</em> (Stationary Energy, Transportation, Waste, IPPU, AFOLU), <em>scopes</em> (where
          emissions physically occur vs. where they are induced), and <em>notation keys</em> (flags for
          data gaps: <strong>NE</strong> = Not Estimated, <strong>IE</strong> = Included Elsewhere, etc.).
        </p>
        <p>
          LFP reports at the <strong>BASIC</strong> level (stationary energy, on-road transport, waste)
          with partial <strong>BASIC+</strong> coverage (aviation, off-road, IPPU, AFOLU). Several cells
          are currently flagged <strong>NE</strong> due to source PDF access issues — these will be
          filled as primary data is reconciled. See the{' '}
          <Link to="/methodology">Methodology</Link> page for details.
        </p>
        <p style={{ margin: 0 }}>
          <strong>Why does this matter?</strong> LFP is a small, wealthy, car-dependent bedroom community
          north of Seattle. Its primary lever is Transportation (on-road VMT) and building decarbonization
          (natural gas phaseout). Aviation and consumption-based emissions make the "real" footprint
          substantially larger than the territorial total.
        </p>
      </section>

      {/* Navigation to sections */}
      <section aria-labelledby="nav-heading">
        <h2 id="nav-heading" style={{ marginBottom: 'var(--sp-4)' }}>Explore the data</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--sp-4)' }}>
          {[
            {
              to: '/inventory',
              title: '📋 GPC Inventory',
              desc: 'Full sector-by-sector table with GPC reference numbers, scopes, notation keys, and source citations. Years: 2019, 2023.',
            },
            {
              to: '/dashboard',
              title: '📊 Emissions Dashboard',
              desc: 'Trend chart, sector breakdown, and wedge scenarios: BAU, ABAU, Local Action, and the adopted target through 2050.',
            },
            {
              to: '/consumption',
              title: '🛒 Consumption-Based Footprint',
              desc: 'Scope 3 supply-chain emissions by category — food, goods, services, transport. Why territorial accounting understates LFP\'s impact.',
            },
            {
              to: '/canopy',
              title: '🌲 Canopy & AFOLU',
              desc: 'Urban tree canopy sequestration sink. ~50% canopy cover confirmed. Full i-Tree assessment needed for quantification.',
            },
          ].map(({ to, title, desc }) => (
            <Link
              key={to}
              to={to}
              style={{ textDecoration: 'none' }}
            >
              <div
                className="card"
                style={{
                  height: '100%',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-forest-lt)'
                  e.currentTarget.style.boxShadow = 'var(--shadow)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)'
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
                }}
              >
                <h3 style={{ marginBottom: 8, color: 'var(--color-forest)' }}>{title}</h3>
                <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <p style={{ marginTop: 'var(--sp-6)', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
        Maintained by <strong>LFP Climate Hub</strong> · City: {manifest.city} ·
        Baseline year: {manifest.baseline_year} · Latest year: {manifest.latest_year} ·
        GPC v{manifest.gpc_version}
      </p>
    </div>
  )
}
