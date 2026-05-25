/**
 * Consumption — Scope 3 consumption-based (supply-chain) footprint view.
 * Deliverable #6. EEIO spend-based estimate now populated from EPA SCF v1.3.0
 * × BLS CE Survey 2019 5th quintile × 5,400 LFP households.
 */
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts'
import { useState } from 'react'
import NotationKey from '../components/NotationKey.jsx'
import Citation from '../components/Citation.jsx'
import { fmtNumber } from '../lib/format.js'
import { Link } from 'react-router-dom'

// Category colour palette — distinct from sector colours
const CAT_COLORS = {
  'Food':             '#2e7d32',   // forest green
  'Goods':            '#1565c0',   // blue
  'Services':         '#7b1fa2',   // purple
  'Construction':     '#e65100',   // deep orange
  'Transport fuels':  '#bf360c',   // brick red
}

function ChartCaption({ children }) {
  return (
    <p style={{
      fontSize: 'var(--text-sm)',
      color: 'var(--text-muted)',
      fontStyle: 'italic',
      marginTop: 8,
      marginBottom: 0,
      borderLeft: '3px solid var(--border)',
      paddingLeft: 10,
    }}>
      {children}
    </p>
  )
}

export default function Consumption({ data }) {
  const { consumption, manifest, sourceMap } = data
  const cf = manifest.confirmed_figures

  // Separate breakdown rows from total row
  const categoryRows = consumption.filter(r => r.category !== 'Total consumption-based')
  const totalRow = consumption.find(r => r.category === 'Total consumption-based')
  const totalCBEI = totalRow?.value_mtco2e ?? null
  const hasData = categoryRows.some(r => r.value_mtco2e != null)

  const [showTable, setShowTable] = useState(false)

  // Bar chart: category breakdown
  const chartData = categoryRows
    .filter(r => r.value_mtco2e != null)
    .map(r => ({ name: r.category, value: Math.round(r.value_mtco2e) }))
    .sort((a, b) => b.value - a.value)

  // Comparison bar data: CBEI total vs territorial baselines
  const compData = [
    { name: 'Territorial\ncore 2019', value: cf.core_baseline_2019_mtco2e, fill: '#455a64', confirmed: true },
    { name: 'Territorial\nall 2019',  value: cf.all_baseline_2019_mtco2e,  fill: '#607d8b', confirmed: true },
    { name: 'CBEI total\n(estimate)', value: totalCBEI ? Math.round(totalCBEI) : 0, fill: '#ff6f00', confirmed: false },
  ]

  return (
    <div>
      <h1 style={{ marginBottom: 8 }}>Consumption-Based (Scope 3) Footprint</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--sp-5)', maxWidth: 680 }}>
        What LFP residents actually consume — beyond the city's territorial boundary. The supply-chain
        (Scope 3) footprint captures emissions embedded in food, goods, services, and travel that occur
        wherever production happens, not where residents live.
      </p>

      {/* Status banner */}
      <div className="draft-banner" style={{ marginBottom: 'var(--sp-5)' }}>
        <strong>Data status: Spend-based EEIO estimate (partial).</strong>{' '}
        Values calculated using EPA Supply Chain GHG Emission Factors v1.3.0 × BLS Consumer Expenditure
        Survey 2019, highest income quintile × 5,400 LFP households. <strong>Uncertainty ±30–40%</strong>.
        LFP-specific household spending has not been verified against local economic data.
        Not a final confirmed figure — treat as a credible order-of-magnitude estimate.
      </div>

      {/* ── Category bar chart ── */}
      {hasData && (
        <div className="card" style={{ marginBottom: 'var(--sp-5)' }}>
          <h2 style={{ marginBottom: 4, fontSize: 'var(--text-xl)' }}>CBEI by Consumption Category (2019 baseline)</h2>
          <p style={{ fontSize: 'var(--text-sm)', marginBottom: 12, color: 'var(--text-muted)' }}>
            Spend-based EEIO estimate. Transport fuels overlap with territorial on-road — see double-count note below.
          </p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ top: 8, right: 24, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis
                tickFormatter={(v) => fmtNumber(v)}
                tick={{ fontSize: 12 }}
                label={{ value: 'MTCO₂e', angle: -90, position: 'insideLeft', offset: 12, fontSize: 11 }}
              />
              <Tooltip
                formatter={(v, name) => [`${fmtNumber(v)} MTCO₂e`, name]}
                labelFormatter={(l) => l}
                contentStyle={{ fontSize: 'var(--text-sm)' }}
              />
              <Bar dataKey="value" name="MTCO₂e" radius={[3, 3, 0, 0]}>
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={CAT_COLORS[entry.name] ?? '#888'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            {chartData.map(d => (
              <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-xs)' }}>
                <span style={{ width: 12, height: 12, borderRadius: 2, background: CAT_COLORS[d.name] ?? '#888', display: 'inline-block' }} />
                {d.name}: <strong>{fmtNumber(d.value)}</strong>
              </div>
            ))}
          </div>
          <ChartCaption>
            Source: EPA SCF v1.3.0 × BLS CE 2019 (5th quintile) × 5,400 LFP HH. Uncertainty ±30–40%.
            Excludes utilities and shelter (would double-count territorial Scope 1/2).
          </ChartCaption>

          <button
            onClick={() => setShowTable(v => !v)}
            aria-expanded={showTable}
            style={{ marginTop: 12, background: 'none', border: '1px solid var(--border)', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', fontSize: 'var(--text-sm)' }}
          >
            {showTable ? 'Hide' : 'Show'} data table
          </button>
          {showTable && (
            <div style={{ overflowX: 'auto', marginTop: 12, border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
              <table aria-label="Consumption-based emissions by category">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th style={{ textAlign: 'right' }}>MTCO₂e</th>
                    <th>% of CBEI</th>
                    <th>Method</th>
                    <th>Source</th>
                  </tr>
                </thead>
                <tbody>
                  {[...categoryRows, ...(totalRow ? [totalRow] : [])].map((row, i) => (
                    <tr key={i} style={row.category === 'Total consumption-based' ? { fontWeight: 700, borderTop: '2px solid var(--border)' } : {}}>
                      <td style={{ fontWeight: row.category === 'Total consumption-based' ? 700 : 500 }}>
                        {row.category}
                        {row.category === 'Transport fuels' && (
                          <span title="Overlaps with territorial Scope 1 on-road" style={{ marginLeft: 4, color: 'var(--color-amber)' }}>⚠</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {row.value_mtco2e != null
                          ? fmtNumber(Math.round(row.value_mtco2e))
                          : <NotationKey code="NE" showLabel={false} />}
                      </td>
                      <td>{row.pct_of_cbei != null ? `${row.pct_of_cbei}%` : '—'}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{row.method}</td>
                      <td><Citation source={row._source}>{row.source_id}</Citation></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p style={{ marginTop: 8, fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
            Download: <a href={`${import.meta.env.BASE_URL}data/consumption_based.csv`} download>consumption_based.csv</a>
          </p>
        </div>
      )}

      {/* ── CBEI vs. territorial comparison ── */}
      {hasData && totalCBEI && (
        <div className="card" style={{ marginBottom: 'var(--sp-5)' }}>
          <h2 style={{ marginBottom: 4, fontSize: 'var(--text-xl)' }}>CBEI vs. Territorial Inventory</h2>
          <p style={{ fontSize: 'var(--text-sm)', marginBottom: 12, color: 'var(--text-muted)' }}>
            Consumption-based vs. territorial (GPC) accounting. These are <strong>separate boundary frameworks</strong> — do not add them.
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={compData} margin={{ top: 8, right: 24, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis
                tickFormatter={(v) => fmtNumber(v)}
                tick={{ fontSize: 12 }}
                label={{ value: 'MTCO₂e', angle: -90, position: 'insideLeft', offset: 12, fontSize: 11 }}
              />
              <Tooltip
                formatter={(v) => [`${fmtNumber(v)} MTCO₂e`]}
                contentStyle={{ fontSize: 'var(--text-sm)' }}
              />
              <Bar dataKey="value" name="MTCO₂e" radius={[3, 3, 0, 0]}>
                {compData.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} opacity={entry.confirmed ? 1 : 0.75} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div style={{ marginTop: 8, fontSize: 'var(--text-sm)' }}>
            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '4px 8px', fontWeight: 500 }}>Territorial core 2019</td>
                  <td style={{ padding: '4px 8px', textAlign: 'right' }}>{fmtNumber(cf.core_baseline_2019_mtco2e)} MTCO₂e</td>
                  <td style={{ padding: '4px 8px', color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>Confirmed ✓ (GPC BASIC, Scope 1+2+3 local)</td>
                </tr>
                <tr>
                  <td style={{ padding: '4px 8px', fontWeight: 500 }}>Territorial all 2019</td>
                  <td style={{ padding: '4px 8px', textAlign: 'right' }}>{fmtNumber(cf.all_baseline_2019_mtco2e)} MTCO₂e</td>
                  <td style={{ padding: '4px 8px', color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>Confirmed ✓ (GPC BASIC+, includes aviation + wider Scope 3)</td>
                </tr>
                <tr style={{ background: '#fff3e0' }}>
                  <td style={{ padding: '4px 8px', fontWeight: 600 }}>CBEI total (estimate)</td>
                  <td style={{ padding: '4px 8px', textAlign: 'right', fontWeight: 600 }}>{fmtNumber(Math.round(totalCBEI))} MTCO₂e</td>
                  <td style={{ padding: '4px 8px', color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
                    Spend-based EEIO estimate ±30–40%.{' '}
                    {((totalCBEI / cf.core_baseline_2019_mtco2e - 1) * 100).toFixed(0)}% larger than territorial core.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <ChartCaption>
            Territorial figures confirmed from Cascadia Wedge Memo. CBEI is a spend-based EEIO estimate —
            see methodology box below. Shaded bar = estimate only.
          </ChartCaption>
        </div>
      )}

      {/* ── Why territorial understates ── */}
      <div
        className="card"
        style={{
          borderLeft: '4px solid var(--color-amber)',
          marginBottom: 'var(--sp-5)',
          background: '#fff8f5',
        }}
        role="note"
        aria-label="Explainer: territorial vs. consumption-based accounting"
      >
        <h2 style={{ marginBottom: 10, fontSize: 'var(--text-xl)' }}>
          Why the territorial inventory understates LFP's impact
        </h2>
        <p>
          The GPC inventory measures emissions that occur <em>within</em> LFP's city boundary
          (territorial accounting). But LFP is a wealthy bedroom community — residents drive to work
          in Seattle, fly frequently, and purchase goods manufactured elsewhere. The emissions from
          those activities occur far outside the city but are <em>caused</em> by LFP residents.
        </p>
        <p><strong>Precedent from nearby cities:</strong></p>
        <ul>
          <li>
            <strong>Edmonds, WA</strong> — a comparable King County city — found its consumption-based
            footprint was approximately <strong>44% larger</strong> than its territorial emissions.
          </li>
          <li>
            <strong>Paris, France</strong> — consumption-based footprint is more than double the territorial total,
            driven by imported goods and services.
          </li>
        </ul>
        {hasData && totalCBEI && (
          <p>
            Our EEIO estimate of <strong>{fmtNumber(Math.round(totalCBEI))} MTCO₂e</strong> puts LFP's
            consumption footprint at approximately{' '}
            <strong>{((totalCBEI / cf.core_baseline_2019_mtco2e - 1) * 100).toFixed(0)}% larger
            than the territorial core</strong> and{' '}
            <strong>{((totalCBEI / cf.all_baseline_2019_mtco2e - 1) * 100).toFixed(0)}% larger than the territorial all-footprint</strong>.
            This aligns with published CBEI benchmarks for high-income suburban communities.
          </p>
        )}
        <p style={{ marginBottom: 0 }}>
          <strong>Double-counting caveat:</strong> Transport fuels ({hasData ? fmtNumber(Math.round(
            categoryRows.find(r => r.category === 'Transport fuels')?.value_mtco2e ?? 0
          )) : 'NE'} MTCO₂e) appear in both CBEI and the territorial on-road sector (
          {fmtNumber(cf.on_road_total_2019_mtco2e)} MTCO₂e). These are{' '}
          <em>separate accounting frameworks</em> — do not add CBEI to territorial.
          See <Link to="/methodology">Methodology</Link> for boundary definitions.
        </p>
      </div>

      {/* ── Methodology box ── */}
      <div className="card" style={{ borderLeft: '4px solid var(--color-forest)', marginBottom: 'var(--sp-5)' }}>
        <h2 style={{ marginBottom: 10, fontSize: 'var(--text-xl)' }}>Methodology: Spend-Based EEIO</h2>

        <p style={{ fontSize: 'var(--text-sm)', marginBottom: 8 }}>
          This estimate uses <strong>Environmentally-Extended Input-Output (EEIO) analysis</strong> — the
          same approach used by the EPA, C40 Cities, and the DIO Project for community-scale CBEI.
        </p>

        <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: 'var(--sp-3) var(--sp-4)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', margin: '12px 0' }}>
          CBEI (MTCO₂e) = Σ [ Spending (2022 USD) × Emission Factor (kg CO₂e/$) ] / 1,000
        </div>

        <h3 style={{ fontSize: 'var(--text-base)', marginBottom: 6 }}>Inputs</h3>
        <ul style={{ fontSize: 'var(--text-sm)', margin: '0 0 12px', paddingLeft: '1.25em' }}>
          <li>
            <strong>Emission factors:</strong> EPA Supply Chain GHG Emission Factors v1.3.0
            (NAICS, CO₂e, USD 2022) — "Supply Chain Emission Factors with Margins" per dollar
            of purchaser-price spending. Includes Scope 1+2+3 upstream through point of sale.
            DOI: 10.23719/1528686.
          </li>
          <li>
            <strong>Household spending:</strong> BLS Consumer Expenditure Survey 2019, Table 3,
            highest income quintile (5th). LFP median household income ~$116K places most
            households at or above this quintile threshold.
          </li>
          <li>
            <strong>Household count:</strong> 5,400 occupied housing units (ACS 2019–2023, 5,392 rounded).
          </li>
          <li>
            <strong>CPI adjustment:</strong> 2019 → 2022 USD via CPI-U (255.657 → 296.808; factor ×1.161).
            Aligns spending to EPA factor base year.
          </li>
        </ul>

        <h3 style={{ fontSize: 'var(--text-base)', marginBottom: 6 }}>Exclusions (double-count prevention)</h3>
        <ul style={{ fontSize: 'var(--text-sm)', margin: '0 0 12px', paddingLeft: '1.25em' }}>
          <li>
            <strong>Utilities (electricity + natural gas):</strong> ~$4,600/HH/yr captured in
            territorial GPC Scope 1/2. Including in CBEI would double-count.
          </li>
          <li>
            <strong>Shelter / mortgage interest:</strong> ~$22,000/HH/yr is a financial flow,
            not a direct emission. Embodied construction carbon is captured in the "Construction" category.
          </li>
        </ul>

        <h3 style={{ fontSize: 'var(--text-base)', marginBottom: 6 }}>Limitations &amp; uncertainty</h3>
        <ul style={{ fontSize: 'var(--text-sm)', margin: 0, paddingLeft: '1.25em' }}>
          <li>
            <strong>±30–40% overall</strong>: national 5th-quintile spending may not match LFP's
            specific consumption pattern. LFP households may spend differently on food (PNW diet,
            farmers markets) and goods (outdoor recreation focus).
          </li>
          <li>
            <strong>NAICS mapping:</strong> BLS CE categories mapped to NAICS sectors with
            weighted-average factors. Finer-grained mapping (e.g., separating beef from produce
            within food) would improve accuracy.
          </li>
          <li>
            <strong>EPA factor base year:</strong> 2022 USD factors may not perfectly represent
            2019 emission intensities. Energy mix has shifted (PSE grid is decarbonizing);
            2019 factors would show slightly higher electricity-intensive sector emissions.
          </li>
          <li>
            <strong>Transport fuels double-count:</strong> The NAICS 4471 (gas stations) factor
            includes combustion-phase CO₂. This overlaps with territorial Scope 1 on-road
            emissions. The transport fuels row is shown for completeness but should not be added
            to territorial figures.
          </li>
        </ul>
      </div>

      {/* ── Next steps ── */}
      <div className="card" style={{ borderLeft: '4px solid var(--color-sky)' }}>
        <h3 style={{ marginBottom: 8 }}>Next steps to refine this estimate</h3>
        <ol style={{ margin: 0, paddingLeft: '1.25em', fontSize: 'var(--text-sm)' }}>
          <li style={{ marginBottom: 6 }}>
            <strong>LFP-specific spending survey:</strong> Replace national 5th-quintile BLS data
            with a household consumption survey targeting LFP zip codes (98155) from credit card
            aggregates or local economic data.
          </li>
          <li style={{ marginBottom: 6 }}>
            <strong>King County downscale:</strong> Obtain the King County PSREAP CBEI dataset
            and downscale by LFP's share of King County income-weighted population.
            Flag methodology-change risk (PSREAP changed methods 2017→2019→2022).
          </li>
          <li style={{ marginBottom: 6 }}>
            <strong>Diet sub-categorization:</strong> Split food into meat/dairy vs. plant-based
            to capture LFP's specific dietary patterns; significant emission intensity difference.
          </li>
          <li>
            <strong>Aviation:</strong> High-income households have disproportionately large aviation
            footprints. Aviation is in the territorial "all" footprint but under-counted in residential CBEI.
            See <Link to="/methodology">Methodology §4</Link>.
          </li>
        </ol>
      </div>
    </div>
  )
}
