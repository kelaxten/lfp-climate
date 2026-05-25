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

  const onRoad2019 = cf.on_road_total_2019_mtco2e
  const onRoad2023 = cf.on_road_total_2023_mtco2e
  const pctChange = onRoad2023 != null && onRoad2019 != null
    ? ((onRoad2023 - onRoad2019) / onRoad2019) * 100
    : null

  const cbeTotal = cf.cbei_total_mtco2e_estimate ?? null
  const canopyPct = cf.canopy_pct_2016 ?? null
  const canopyAc  = cf.canopy_area_acres_2016 ?? null

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

      {/* ── Headline stat cards ── */}
      <section aria-labelledby="stats-heading">
        <h2 id="stats-heading" className="sr-only">Headline statistics</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: 'var(--sp-4)',
          marginBottom: 'var(--sp-7)',
        }}>

          {/* Core baseline — primary confirmed figure */}
          <StatCard
            label="Community Baseline (2019)"
            value={fmtNumber(cf.core_baseline_2019_mtco2e)}
            unit="MTCO₂e · core footprint"
            subtext={`Confirmed from Cascadia Wedge Memo Table 1. All-footprint (incl. aviation): ${fmtNumber(cf.all_baseline_2019_mtco2e)} MTCO₂e.`}
          />

          <StatCard
            label="On-Road Emissions (2023)"
            value={fmtNumber(onRoad2023)}
            unit="MTCO₂e"
            subtext={`Largest confirmed source. ${fmtNumber(Math.round(onRoad2023 / cf.core_baseline_2019_mtco2e * 100))}% of 2019 core baseline. Confirmed from Fehr & Peers VMT Study.`}
          />

          <StatCard
            label="On-Road Change 2019→2023"
            value={pctChange != null ? `${pctChange > 0 ? '+' : ''}${pctChange.toFixed(1)}%` : '—'}
            unit={`${fmtNumber(onRoad2019)} → ${fmtNumber(onRoad2023)} MTCO₂e`}
            subtext="Progress toward −50% by 2030 target. On-road sector only."
            trend={pctChange != null ? (pctChange < 0 ? 'down' : 'up') : null}
            trendGood={false}
          />

          <StatCard
            label="Consumption Footprint (est.)"
            value={cbeTotal ? `~${fmtNumber(Math.round(cbeTotal / 1000) * 1000)}` : '—'}
            unit="MTCO₂e · ±30–40%"
            subtext={cbeTotal
              ? `Spend-based EEIO estimate. ${((cbeTotal / cf.core_baseline_2019_mtco2e - 1) * 100).toFixed(0)}% larger than territorial core. Excludes utilities.`
              : 'Not estimated. Requires CBEI analysis.'}
            draft
          />

          <StatCard
            label="Urban Canopy Cover (2016)"
            value={canopyPct != null ? `${Number(canopyPct).toFixed(1)}%` : '—'}
            unit={canopyAc ? `${fmtNumber(canopyAc)} of ${fmtNumber(cf.city_area_acres)} acres` : ''}
            subtext="Confirmed from King County DNRP 2016 GIS study. Exceptional for a suburban community. Carbon stock NE — i-Tree needed."
          />

          <StatCard
            label="2030 Adopted Target"
            value={`${cf.target_2030_pct_change}%`}
            unit="vs. 2019 baseline"
            subtext={`City Council goals: −50% by 2030, −75% by 2040, −95% by 2050. On-road progress so far: ${pctChange != null ? pctChange.toFixed(1) : '—'}%`}
            trend="down"
            trendGood={false}
          />

        </div>
      </section>

      {/* ── What this is ── */}
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
          remain <strong>NE</strong> — stationary energy and waste absolute values are the primary remaining
          gaps. See the <Link to="/methodology">Methodology</Link> page for the full completeness map.
        </p>
        <p style={{ margin: 0 }}>
          <strong>Why does this matter?</strong> LFP is a small, wealthy, car-dependent bedroom community
          north of Seattle. Its primary lever is Transportation (on-road VMT) and building decarbonization
          (natural gas phaseout). The consumption-based estimate (~{cbeTotal ? fmtNumber(Math.round(cbeTotal / 1000) * 1000) : 'TBD'} MTCO₂e)
          shows the "true" footprint is substantially larger than the territorial total.
        </p>
      </section>

      {/* ── Emissions at a glance ── */}
      <section aria-labelledby="glance-heading" className="card" style={{ marginBottom: 'var(--sp-5)' }}>
        <h2 id="glance-heading" style={{ marginBottom: 'var(--sp-3)' }}>Emissions at a glance</h2>
        <div style={{ overflowX: 'auto' }}>
          <table aria-label="Key emissions figures" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th scope="col">Metric</th>
                <th scope="col" style={{ textAlign: 'right' }}>Value</th>
                <th scope="col">Status</th>
                <th scope="col">Source</th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'Community core baseline 2019',    value: `${fmtNumber(cf.core_baseline_2019_mtco2e)} MTCO₂e`,   status: '✓ Confirmed', source: 'Cascadia Wedge Memo Table 1' },
                { label: 'Community all-footprint 2019',   value: `${fmtNumber(cf.all_baseline_2019_mtco2e)} MTCO₂e`,    status: '✓ Confirmed', source: 'Cascadia Wedge Memo Table 2' },
                { label: 'On-road 2019',                   value: `${fmtNumber(cf.on_road_total_2019_mtco2e)} MTCO₂e`,   status: '✓ Confirmed', source: 'Fehr & Peers VMT Table 2' },
                { label: 'On-road 2022',                   value: `${fmtNumber(cf.on_road_total_2022_mtco2e)} MTCO₂e`,   status: '✓ Confirmed', source: 'Fehr & Peers VMT Table 2' },
                { label: 'On-road 2023',                   value: `${fmtNumber(cf.on_road_total_2023_mtco2e)} MTCO₂e`,   status: '✓ Confirmed', source: 'Fehr & Peers VMT Table 2' },
                { label: 'Stationary energy 2019',         value: 'NE',                                                   status: '⏳ Pending',   source: 'Cascadia GHG Inventory (needed)' },
                { label: 'Consumption-based (CBEI) 2019',  value: cbeTotal ? `~${fmtNumber(Math.round(cbeTotal))} MTCO₂e ±30–40%` : 'NE', status: cbeTotal ? '~ Estimate' : '⏳ Pending', source: 'EPA SCF v1.3.0 × BLS CE 2019' },
                { label: 'Canopy cover (2016)',             value: `${Number(cf.canopy_pct_2016).toFixed(1)}% (${fmtNumber(cf.canopy_area_acres_2016)} ac)`, status: '✓ Confirmed', source: 'KC DNRP 2016 GIS study' },
                { label: 'Canopy sequestration',           value: 'NE',                                                   status: '⏳ Pending',   source: 'i-Tree assessment (needed)' },
              ].map(({ label, value, status, source }) => (
                <tr key={label}>
                  <td style={{ fontWeight: 500, fontSize: 'var(--text-sm)' }}>{label}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)' }}>{value}</td>
                  <td style={{ fontSize: 'var(--text-xs)', whiteSpace: 'nowrap',
                    color: status.startsWith('✓') ? '#1b5e20' : status.startsWith('~') ? '#e65100' : '#607d8b',
                    fontWeight: 600 }}>{status}</td>
                  <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Navigation tiles ── */}
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
              desc: `Scope 3 supply-chain estimate: ~${cbeTotal ? fmtNumber(Math.round(cbeTotal / 1000) * 1000) : 'TBD'} MTCO₂e — food, goods, services, transport. Why territorial accounting understates LFP's impact.`,
            },
            {
              to: '/canopy',
              title: '🌲 Canopy & AFOLU',
              desc: `${canopyPct ? Number(canopyPct).toFixed(1) : '~50'}% canopy cover confirmed (${canopyAc ? fmtNumber(canopyAc) : '1,477'} ac). Carbon stock & sequestration NE — i-Tree assessment needed.`,
            },
          ].map(({ to, title, desc }) => (
            <Link key={to} to={to} style={{ textDecoration: 'none' }}>
              <div
                className="card"
                style={{ height: '100%', transition: 'border-color 0.15s, box-shadow 0.15s' }}
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
        GPC v{manifest.gpc_version} · Updated {manifest.last_updated}
      </p>
    </div>
  )
}
