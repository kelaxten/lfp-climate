/**
 * Policy — GPC-informed policy recommendations and reduction levers.
 * Sourced from Cascadia GHG Inventory Report (2025), Section 5.
 * Presents the five recommended strategies with quantitative context
 * from the confirmed inventory.
 */
import { Link } from 'react-router-dom'
import { fmtNumber } from '../lib/format.js'

/** Render a single recommendation card */
function PolicyCard({ number, icon, title, sector, target2030, children, status, links = [] }) {
  const statusColor = {
    'In progress': '#1565c0',
    'Planned':     '#6a1b9a',
    'Ongoing':     '#2e7d32',
    'No policy':   '#b71c1c',
  }[status] ?? '#616161'

  return (
    <div className="card" style={{ marginBottom: 'var(--sp-5)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-4)', flexWrap: 'wrap' }}>
        <div style={{
          fontSize: 'var(--text-3xl)',
          lineHeight: 1,
          minWidth: 48,
          textAlign: 'center',
        }}>
          {icon}
        </div>
        <div style={{ flex: 1, minWidth: 280 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
            <span style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 700,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}>
              Recommendation {number}
            </span>
            <span style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 700,
              color: statusColor,
              background: `${statusColor}18`,
              padding: '1px 7px',
              borderRadius: 10,
              border: `1px solid ${statusColor}44`,
            }}>
              {status}
            </span>
            <span style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--text-muted)',
              background: '#f5f5f5',
              padding: '1px 7px',
              borderRadius: 10,
              border: '1px solid var(--border)',
            }}>
              {sector}
            </span>
          </div>
          <h2 style={{ margin: '0 0 var(--sp-3)', fontSize: 'var(--text-xl)', color: 'var(--color-forest)' }}>
            {title}
          </h2>
          {children}
          {(target2030 || links.length > 0) && (
            <div style={{
              marginTop: 'var(--sp-3)',
              paddingTop: 'var(--sp-3)',
              borderTop: '1px solid var(--border-lt)',
              display: 'flex',
              gap: 'var(--sp-4)',
              flexWrap: 'wrap',
              alignItems: 'center',
            }}>
              {target2030 && (
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
                  <strong style={{ color: 'var(--color-forest)' }}>2030 wedge contribution:</strong>{' '}
                  {target2030}
                </span>
              )}
              {links.map(({ to, label }) => (
                <Link key={to} to={to} style={{ fontSize: 'var(--text-sm)', color: 'var(--color-forest-lt)', fontWeight: 600 }}>
                  → {label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Metric({ label, value, note }) {
  return (
    <div style={{
      display: 'inline-flex',
      flexDirection: 'column',
      background: '#f9fbe7',
      border: '1px solid #c5e1a5',
      borderRadius: 6,
      padding: '6px 12px',
      marginRight: 8,
      marginBottom: 8,
    }}>
      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
      <span style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: 'var(--color-forest)', lineHeight: 1.2 }}>{value}</span>
      {note && <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 2 }}>{note}</span>}
    </div>
  )
}

export default function Policy({ data }) {
  const { manifest } = data
  const cf = manifest.confirmed_figures

  const baseline     = cf.communitywide_2019_mtco2e
  const target2030   = Math.round(baseline * 0.5)
  const needed       = baseline - target2030
  const buildings23  = cf.buildings_2023_mtco2e
  const transport23  = cf.transportation_2023_mtco2e
  const aviation23   = cf.aviation_2023_mtco2e
  const onRoad23     = cf.on_road_total_2023_mtco2e
  const natGas23     = cf.natural_gas_2023_mtco2e
  const waste23      = cf.solid_waste_2023_mtco2e
  const ippu23       = cf.refrigerants_2023_mtco2e
  const vmt23        = cf.total_vmt_2023_miles
  const vmt19        = cf.total_vmt_2019_miles

  return (
    <div>
      <h1 style={{ marginBottom: 8 }}>Policy Recommendations</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--sp-5)', maxWidth: 720 }}>
        Five strategies from the{' '}
        <strong>Cascadia GHG Inventory Report (2025)</strong>, grounded in the confirmed
        emissions inventory. Each lever is sized against the 2030 target
        ({fmtNumber(target2030)} MTCO₂e — a <strong>50% cut</strong> from the{' '}
        {fmtNumber(baseline)} MTCO₂e baseline). LFP needs to reduce by ~{fmtNumber(needed)} MTCO₂e by 2030.
      </p>

      {/* ── Gap summary ── */}
      <div className="card" style={{ marginBottom: 'var(--sp-5)', background: '#e8f5e9', borderColor: '#a5d6a7' }}>
        <h2 style={{ marginBottom: 'var(--sp-3)', fontSize: 'var(--text-xl)' }}>📐 The 2030 Gap</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-3)', marginBottom: 'var(--sp-3)' }}>
          <Metric label="2019 Baseline" value={fmtNumber(baseline)} note="MTCO₂e · confirmed" />
          <Metric label="2023 Actual" value={fmtNumber(cf.communitywide_2023_mtco2e)} note={`MTCO₂e · ${(((cf.communitywide_2023_mtco2e - baseline) / baseline) * 100).toFixed(1)}% vs baseline`} />
          <Metric label="2030 Target (−50%)" value={fmtNumber(target2030)} note="MTCO₂e" />
          <Metric label="Reduction needed" value={fmtNumber(needed)} note="MTCO₂e from baseline" />
        </div>
        <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: '#2e7d32' }}>
          As of 2023, LFP is essentially <strong>at its 2019 baseline</strong> — no measurable reduction yet.
          Achieving −50% by 2030 requires cutting ~{fmtNumber(needed)} MTCO₂e in seven years.
          The five strategies below collectively cover the full gap if pursued aggressively.
        </p>
      </div>

      {/* ── Recommendation 1: VMT reduction ── */}
      <PolicyCard
        number={1}
        icon="🚶"
        title="Reduce vehicle miles traveled (VMT) per capita"
        sector="Transportation"
        status="In progress"
        target2030="~4,000–8,000 MTCO₂e reduction potential"
        links={[
          { to: '/inventory', label: 'GPC Inventory' },
          { to: '/dashboard', label: 'Sector Trend' },
        ]}
      >
        <p style={{ marginBottom: 'var(--sp-3)' }}>
          On-road transportation emitted <strong>{fmtNumber(onRoad23)} MTCO₂e in 2023</strong> — the second-largest
          sector after aviation. VMT has declined modestly from {fmtNumber(vmt19)} to {fmtNumber(vmt23)} miles/yr (−4%),
          but the gains have come from EV uptake and shorter trip lengths, not fewer trips.
        </p>
        <div style={{ marginBottom: 'var(--sp-3)' }}>
          <Metric label="On-road 2023" value={`${fmtNumber(onRoad23)}`} note="MTCO₂e · 24% of total" />
          <Metric label="VMT change 2019→23" value="-4%" note={`${fmtNumber(vmt19)} → ${fmtNumber(vmt23)} mi/yr`} />
        </div>
        <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
          <strong>Strategies:</strong> land-use mix (missing middle housing near arterials), safe routes for
          walking/biking, transit access improvements to SR-522 corridor, Transportation Demand Management (TDM)
          programs for commuters, employer incentives. LFP's 2024 Climate Action Plan identifies this as a
          top lever.
        </p>
      </PolicyCard>

      {/* ── Recommendation 2: EV infrastructure ── */}
      <PolicyCard
        number={2}
        icon="⚡"
        title="Expand EV charging infrastructure and accelerate fleet electrification"
        sector="Transportation"
        status="In progress"
        target2030="~8,000–15,000 MTCO₂e reduction potential"
        links={[
          { to: '/dashboard', label: 'Transportation Trend' },
        ]}
      >
        <p style={{ marginBottom: 'var(--sp-3)' }}>
          Electrification is the largest single lever for on-road emissions. Washington's electricity grid
          is relatively clean (PSE: ~{cf.pse_emissions_intensity_2024_mtco2e_per_mwh} MTCO₂e/MWh in 2024;
          SCL is far lower), making EV conversion especially effective here. The on-road sector still
          burned {fmtNumber(onRoad23)} MTCO₂e worth of gasoline and diesel in 2023.
        </p>
        <div style={{ marginBottom: 'var(--sp-3)' }}>
          <Metric label="On-road 2023" value={`${fmtNumber(onRoad23)}`} note="MTCO₂e (90%+ gasoline)" />
          <Metric label="PSE grid intensity" value={`${cf.pse_emissions_intensity_2024_mtco2e_per_mwh}`} note="MTCO₂e/MWh (2024)" />
        </div>
        <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
          <strong>Strategies:</strong> Level 2 charger incentive program for multi-family buildings (the hardest
          segment), publiccharging at City facilities, municipal fleet EV transition, commercial truck corridor
          electrification (SR-522 freight), coordinated outreach with PSE EV programs. State mandate phases out
          new ICE car sales by 2035 — local programs can accelerate ahead of that.
        </p>
      </PolicyCard>

      {/* ── Recommendation 3: Building efficiency ── */}
      <PolicyCard
        number={3}
        icon="🏠"
        title="Increase building energy efficiency (retrofit programs)"
        sector="Stationary Energy"
        status="Planned"
        target2030="~3,000–6,000 MTCO₂e reduction potential"
        links={[
          { to: '/inventory', label: 'GPC Inventory' },
        ]}
      >
        <p style={{ marginBottom: 'var(--sp-3)' }}>
          Buildings emitted <strong>{fmtNumber(buildings23)} MTCO₂e in 2023</strong> — up 21% from 2019
          ({fmtNumber(cf.buildings_2019_mtco2e)}) largely due to a sharp rise in electricity carbon intensity
          (SCL power-mix change). Natural gas alone was {fmtNumber(natGas23)} MTCO₂e (76% of the buildings sector).
          Reducing heating loads reduces both gas use and the electricity penalty.
        </p>
        <div style={{ marginBottom: 'var(--sp-3)' }}>
          <Metric label="Buildings 2023" value={`${fmtNumber(buildings23)}`} note="MTCO₂e · up 21% vs 2019" />
          <Metric label="Natural gas" value={`${fmtNumber(natGas23)}`} note="MTCO₂e · 76% of buildings" />
        </div>
        <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
          <strong>Strategies:</strong> Building Energy Performance Standard (BEPS) for large commercial/
          multi-family (modeled on Seattle/Shoreline programs), weatherization rebates for single-family
          homes, energy audit program, stretch energy codes for new construction, coordination with
          PSE and SCL utility rebate programs. Efficiency reduces total energy load before electrification
          — a necessary precursor to avoid grid overload.
        </p>
      </PolicyCard>

      {/* ── Recommendation 4: Building electrification ── */}
      <PolicyCard
        number={4}
        icon="🔌"
        title="Promote building electrification (gas appliance replacement)"
        sector="Stationary Energy"
        status="Planned"
        target2030="~5,000–12,000 MTCO₂e reduction potential"
        links={[
          { to: '/inventory', label: 'GPC Inventory' },
          { to: '/dashboard', label: 'Buildings Trend' },
        ]}
      >
        <p style={{ marginBottom: 'var(--sp-3)' }}>
          LFP's single highest-leverage technical intervention: replacing gas furnaces, water heaters,
          and ranges with electric heat pumps and induction. Natural gas heating alone ({fmtNumber(natGas23)} MTCO₂e)
          plus fuel oil ({fmtNumber(cf.fuel_oil_2023_mtco2e ?? 2978)} MTCO₂e) + propane
          ({fmtNumber(cf.propane_2023_mtco2e ?? 748)} MTCO₂e) total over{' '}
          <strong>{fmtNumber(natGas23 + 2978 + 748)} MTCO₂e</strong> — fully eliminating combustion
          heating would nearly close the 2030 gap on its own. The grid in LFP (served by SCL) is among
          the cleanest in the nation.
        </p>
        <div style={{ marginBottom: 'var(--sp-3)' }}>
          <Metric label="Gas + oil + propane" value={`${fmtNumber(natGas23 + 2978 + 748)}`} note="MTCO₂e · combustion heating 2023" />
          <Metric label="SCL grid" value="~near-zero" note="carbon intensity (hydro-dominant)" />
        </div>
        <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
          <strong>Strategies:</strong> "Tune Out Gas" rebate program in coordination with SCL/PSE, mandatory
          electrification at point-of-sale or major renovation, heat pump water heater incentives, commercial
          building fossil fuel phase-out ordinance (follow Shoreline's lead), reach code requiring electric-
          ready new construction. Also eliminates HFC refrigerant risk from older equipment — small co-benefit
          in the IPPU sector ({fmtNumber(ippu23)} MTCO₂e).
        </p>
      </PolicyCard>

      {/* ── Recommendation 5: Waste diversion ── */}
      <PolicyCard
        number={5}
        icon="♻️"
        title="Reduce landfilled waste and expand organics diversion"
        sector="Waste"
        status="Ongoing"
        target2030="~500–800 MTCO₂e reduction potential"
        links={[
          { to: '/inventory', label: 'GPC Inventory' },
        ]}
      >
        <p style={{ marginBottom: 'var(--sp-3)' }}>
          Waste is LFP's smallest territorial sector ({fmtNumber(waste23)} MTCO₂e in 2023), but diversion
          has co-benefits including reduced methane from King County landfills and nutrient cycling through
          composting. Landfill emissions ({fmtNumber(cf.solid_waste_2023_mtco2e - (cf.solid_waste_2023_mtco2e - 1512))} MTCO₂e)
          are up ~15% vs 2019 as the community generates more waste per capita.
        </p>
        <div style={{ marginBottom: 'var(--sp-3)' }}>
          <Metric label="Total waste 2023" value={`${fmtNumber(waste23)}`} note="MTCO₂e · landfill + compost" />
          <Metric label="Landfill fraction" value="77%" note="1,512 of 1,960 MTCO₂e" />
        </div>
        <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
          <strong>Strategies:</strong> food waste prevention campaigns (largest single contributor to
          landfill methane), mandatory food scrap composting for multi-family and commercial, "fix-it"
          economy programs (repair cafés, library of things), WRAP (Waste Reduction Action Plan) update,
          partnership with King County Zero Waste programs. Note: LFP exports waste to King County
          facilities — advocacy with KC is also effective.
        </p>
      </PolicyCard>

      {/* ── Aviation note ── */}
      <div className="card" style={{ marginBottom: 'var(--sp-5)', background: '#fff8e1', borderColor: '#ffe082' }}>
        <h2 style={{ marginBottom: 'var(--sp-3)', fontSize: 'var(--text-lg)' }}>
          ✈️ A note on aviation — LFP's largest source
        </h2>
        <p style={{ marginBottom: 'var(--sp-2)' }}>
          Air travel emitted <strong>{fmtNumber(aviation23)} MTCO₂e in 2023</strong> —{' '}
          {Math.round(aviation23 / cf.communitywide_2023_mtco2e * 100)}% of LFP's total, and
          the single largest source. It exceeds all on-road transportation combined.
        </p>
        <p style={{ marginBottom: 'var(--sp-2)', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
          Aviation is counted as <strong>BASIC+ Scope 3</strong> under GPC — allocated to LFP residents
          based on SeaTac jet fuel sales, per-capita income, and passenger survey data. It is not in the
          Cascadia report's five recommended strategies because it is a <em>federal/international</em> policy
          domain (ICAO, FAA, SAF mandates) where municipal authority is limited.
        </p>
        <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
          <strong>What LFP can do:</strong> (1) report it transparently (this inventory does), (2) engage
          SeaTac's Sustainable Aviation Fuel (SAF) program as a stakeholder, (3) include aviation
          in community carbon pricing or offset programs, (4) use the figure in public education to
          demonstrate that frequent flying is one of the highest-impact individual choices residents can make.
        </p>
      </div>

      {/* ── Bottom link ── */}
      <div style={{ display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap', marginTop: 'var(--sp-2)' }}>
        <Link to="/dashboard" style={{ color: 'var(--color-forest-lt)', fontWeight: 600, fontSize: 'var(--text-sm)' }}>
          → View Emissions Dashboard &amp; Wedge Scenarios
        </Link>
        <Link to="/methodology" style={{ color: 'var(--color-forest-lt)', fontWeight: 600, fontSize: 'var(--text-sm)' }}>
          → Methodology &amp; Data Sources
        </Link>
      </div>

      <p style={{ marginTop: 'var(--sp-6)', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
        Strategies sourced from: Cascadia GHG Inventory Report (2025), Section 5. Quantitative potential
        estimates are indicative and reflect typical municipal-scale intervention ranges.
        Maintained by <strong>LFP Climate Hub</strong> · Updated {manifest.last_updated}.
      </p>
    </div>
  )
}
