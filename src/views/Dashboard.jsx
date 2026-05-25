/**
 * Dashboard — communitywide trend (stacked by sector), sector split, wedge scenarios.
 * Deliverable #3: visualization layer. Now backed by the full Cascadia GHG
 * Inventory Report (2019, 2022, 2023 — all sectors confirmed).
 */
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts'
import { useState } from 'react'
import WedgeChart from '../components/WedgeChart.jsx'
import { fmtNumber } from '../lib/format.js'
import { SECTORS } from '../lib/gpc.js'

const SECTOR_COLORS = Object.entries(SECTORS).reduce((acc, [k, v]) => ({ ...acc, [k]: v.color }), {})
const SECTOR_ORDER = ['Transportation', 'Stationary Energy', 'IPPU', 'Waste', 'AFOLU']

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

function SectionCard({ title, children }) {
  return (
    <div className="card" style={{ marginBottom: 'var(--sp-5)' }}>
      <h2 style={{ marginBottom: 'var(--sp-4)', fontSize: 'var(--text-xl)' }}>{title}</h2>
      {children}
    </div>
  )
}

/** Sum confirmed MTCO₂e by sector for a given year's inventory rows. */
function sectorSums(rows) {
  return (rows ?? [])
    .filter(r => r.value_mtco2e != null)
    .reduce((acc, r) => {
      acc[r.sector] = (acc[r.sector] ?? 0) + r.value_mtco2e
      return acc
    }, {})
}

export default function Dashboard({ data }) {
  const { manifest, inventory, wedge } = data
  const cf = manifest.confirmed_figures
  const years = manifest.available_years

  // Build stacked trend data: one row per year, one key per sector
  const trendData = years.map(y => {
    const sums = sectorSums(inventory[y])
    const row = { year: y, total: Math.round(Object.values(sums).reduce((a, b) => a + b, 0)) }
    for (const s of SECTOR_ORDER) row[s] = Math.round(sums[s] ?? 0)
    return row
  })

  // Communitywide 2019 baseline for target reference lines (city adopted targets are community-wide)
  const baseline = cf.communitywide_2019_mtco2e

  // Sector breakdown — year selectable
  const [breakdownYear, setBreakdownYear] = useState(manifest.latest_year)
  const sums = sectorSums(inventory[breakdownYear])
  const sectorData = Object.entries(sums)
    .map(([sector, value]) => ({ sector, value: Math.round(value) }))
    .sort((a, b) => b.value - a.value)
  const breakdownTotal = sectorData.reduce((a, b) => a + b.value, 0)

  const [showTrendTable, setShowTrendTable] = useState(false)
  const [showSectorTable, setShowSectorTable] = useState(false)

  return (
    <div>
      <h1 style={{ marginBottom: 8 }}>Emissions Dashboard</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--sp-5)', maxWidth: 680 }}>
        Charts derive from the confirmed Cascadia GHG Inventory Report (2019, 2022, 2023). Tree-canopy
        sequestration is shown separately (a sink) and is not netted into gross totals.
      </p>

      {/* ---- Trend chart ---- */}
      <SectionCard title="📈 Communitywide Emissions Trend">
        <p style={{ fontSize: 'var(--text-sm)', marginBottom: 12 }}>
          Communitywide gross emissions by sector. Total stayed roughly flat 2019→2023
          ({fmtNumber(trendData[0]?.total)} → {fmtNumber(trendData[trendData.length - 1]?.total)} MTCO₂e,
          {' '}{(((trendData[trendData.length - 1]?.total - trendData[0]?.total) / trendData[0]?.total) * 100).toFixed(1)}% change).
          Dashed lines mark the −50% (2030) and −75% (2040) reductions from the 2019 baseline.
        </p>
        <ResponsiveContainer width="100%" height={340}>
          <BarChart data={trendData} margin={{ top: 8, right: 24, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="year" tick={{ fontSize: 12 }} />
            <YAxis
              tickFormatter={(v) => fmtNumber(v)}
              tick={{ fontSize: 12 }}
              domain={[0, 100000]}
              label={{ value: 'MTCO₂e', angle: -90, position: 'insideLeft', offset: 12, fontSize: 11 }}
            />
            <Tooltip
              formatter={(v, name) => [`${fmtNumber(v)} MTCO₂e`, name]}
              contentStyle={{ fontSize: 'var(--text-sm)' }}
            />
            <Legend />
            {SECTOR_ORDER.map((s, i) => (
              <Bar
                key={s}
                dataKey={s}
                stackId="emissions"
                fill={SECTOR_COLORS[s] ?? '#888'}
                radius={i === 0 ? [3, 3, 0, 0] : [0, 0, 0, 0]}
              />
            ))}
            <ReferenceLine y={Math.round(baseline * 0.5)} stroke="#000" strokeDasharray="6 4"
              label={{ value: '2030 target', position: 'right', fontSize: 10, fill: '#000' }} />
            <ReferenceLine y={Math.round(baseline * 0.25)} stroke="#555" strokeDasharray="6 4"
              label={{ value: '2040 target', position: 'right', fontSize: 10, fill: '#555' }} />
          </BarChart>
        </ResponsiveContainer>

        <ChartCaption>
          Source: Cascadia GHG Inventory Report (2025), Table 3. Communitywide totals 2019/2022/2023 =
          {' '}{fmtNumber(cf.communitywide_2019_mtco2e)} / {fmtNumber(cf.communitywide_2022_mtco2e)} /{' '}
          {fmtNumber(cf.communitywide_2023_mtco2e)} MTCO₂e. Sequestration (−{fmtNumber(Math.abs(cf.tree_sequestration_2023_mtco2e))} MTCO₂e/yr)
          reported separately. Targets reference the {fmtNumber(baseline)} MTCO₂e 2019 baseline.
        </ChartCaption>

        <button onClick={() => setShowTrendTable(v => !v)} aria-expanded={showTrendTable} aria-controls="trend-table"
          style={{ marginTop: 12, background: 'none', border: '1px solid var(--border)', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', fontSize: 'var(--text-sm)' }}>
          {showTrendTable ? 'Hide' : 'Show'} data table
        </button>
        {showTrendTable && (
          <div id="trend-table" style={{ overflowX: 'auto', marginTop: 12 }}>
            <table aria-label="Communitywide emissions trend by sector">
              <caption style={{ textAlign: 'left', fontWeight: 600, fontSize: 'var(--text-sm)', padding: '4px 0' }}>Communitywide emissions by sector (MTCO₂e)</caption>
              <thead>
                <tr>
                  <th scope="col">Year</th>
                  {SECTOR_ORDER.map(s => <th key={s} scope="col" style={{ textAlign: 'right' }}>{s}</th>)}
                  <th scope="col" style={{ textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {trendData.map(row => (
                  <tr key={row.year}>
                    <td>{row.year}</td>
                    {SECTOR_ORDER.map(s => <td key={s} style={{ textAlign: 'right' }}>{fmtNumber(row[s])}</td>)}
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>{fmtNumber(row.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {/* ---- Sector split ---- */}
      <SectionCard title="🍕 Sector Breakdown">
        <div style={{ display: 'flex', gap: 6, marginBottom: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>Year:</span>
          {years.map(y => (
            <button
              key={y}
              onClick={() => setBreakdownYear(y)}
              aria-pressed={breakdownYear === y}
              style={{
                padding: '4px 12px',
                border: `1px solid ${breakdownYear === y ? 'var(--color-forest)' : 'var(--border)'}`,
                borderRadius: 4,
                background: breakdownYear === y ? '#e8f5e9' : 'white',
                fontWeight: breakdownYear === y ? 700 : 400,
                cursor: 'pointer',
                fontSize: 'var(--text-sm)',
              }}
            >
              {y}
            </button>
          ))}
        </div>
        <p style={{ fontSize: 'var(--text-sm)', marginBottom: 12 }}>
          All five GPC sectors for {breakdownYear}. Transportation (on-road + aviation + off-road) and
          Buildings (stationary energy) dominate; aviation alone is the single largest source.
        </p>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={sectorData} layout="vertical" margin={{ top: 4, right: 56, left: 90, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis type="number" tickFormatter={fmtNumber} tick={{ fontSize: 11 }}
              label={{ value: 'MTCO₂e', position: 'insideBottom', offset: -4, fontSize: 11 }} />
            <YAxis type="category" dataKey="sector" tick={{ fontSize: 11 }} width={86} />
            <Tooltip formatter={(v) => [`${fmtNumber(v)} MTCO₂e`, 'Emissions']} contentStyle={{ fontSize: 'var(--text-sm)' }} />
            <Bar dataKey="value" radius={[0, 3, 3, 0]} label={{ position: 'right', formatter: (v) => fmtNumber(v), fontSize: 10 }}>
              {sectorData.map((entry) => (
                <Cell key={entry.sector} fill={SECTOR_COLORS[entry.sector] ?? '#888'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <ChartCaption>
          {breakdownYear} communitywide total: {fmtNumber(breakdownTotal)} MTCO₂e across {sectorData.length} sectors.
          Source: Cascadia GHG Inventory Report Table 3.
        </ChartCaption>
        <button onClick={() => setShowSectorTable(v => !v)} aria-expanded={showSectorTable} aria-controls="sector-table"
          style={{ marginTop: 12, background: 'none', border: '1px solid var(--border)', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', fontSize: 'var(--text-sm)' }}>
          {showSectorTable ? 'Hide' : 'Show'} data table
        </button>
        {showSectorTable && (
          <table id="sector-table" style={{ marginTop: 12 }} aria-label="Sector breakdown data">
            <caption style={{ textAlign: 'left', fontWeight: 600, fontSize: 'var(--text-sm)', padding: '4px 0' }}>Sector breakdown {breakdownYear}</caption>
            <thead><tr><th scope="col">Sector</th><th scope="col" style={{ textAlign: 'right' }}>MTCO₂e</th><th scope="col" style={{ textAlign: 'right' }}>% of total</th></tr></thead>
            <tbody>
              {sectorData.map(r => (
                <tr key={r.sector}>
                  <td>{r.sector}</td>
                  <td style={{ textAlign: 'right' }}>{fmtNumber(r.value)}</td>
                  <td style={{ textAlign: 'right' }}>{((r.value / breakdownTotal) * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </SectionCard>

      {/* ---- Wedge chart ---- */}
      <SectionCard title="📉 Scenario Wedge Chart (2019–2050)">
        <p style={{ fontSize: 'var(--text-sm)', marginBottom: 12 }}>
          Four trajectories: <strong>BAU</strong> (business-as-usual, no new policy: +26% by 2050),{' '}
          <strong>ABAU</strong> (accelerated BAU — existing federal/state/regional policy only: −56% by 2050),{' '}
          <strong>Local Action</strong> (adds LFP-specific measures: ≈−65% by 2050, estimate),{' '}
          <strong>Target</strong> (adopted city goals: −50% by 2030, −75% by 2040, −95% by 2050).
          Values are percent of 2019 baseline. Intermediate years are interpolated.
        </p>
        <WedgeChart wedgeRows={wedge} />
        <ChartCaption>
          Source: Cascadia Consulting Group Wedge Memo (June 2025). The Wedge Memo 2019 baseline
          (all 95,996 / core 47,427 MTCO₂e) is ~0.3% above the final GHG Inventory total (95,745);
          it is a separate scenario analysis kept internally consistent for the 2050 trajectories.
          Intermediate years interpolated linearly.
        </ChartCaption>
      </SectionCard>
    </div>
  )
}
