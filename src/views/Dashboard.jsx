/**
 * Dashboard — trend chart, sector split, and wedge scenario chart.
 * Deliverable #3: visualization layer.
 */
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell,
} from 'recharts'
import { useState } from 'react'
import WedgeChart from '../components/WedgeChart.jsx'
import { fmtNumber } from '../lib/format.js'
import { SECTORS } from '../lib/gpc.js'

const SECTOR_COLORS = Object.entries(SECTORS).reduce((acc, [k, v]) => ({ ...acc, [k]: v.color }), {})

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

export default function Dashboard({ data }) {
  const { manifest, inventory, wedge } = data
  const cf = manifest.confirmed_figures

  // Build trend data: community core total (2019 confirmed) + on-road (all years)
  const trendData = [
    {
      year: 2019,
      'Community total (core)': cf.core_baseline_2019_mtco2e,
      'On-road': cf.on_road_total_2019_mtco2e,
    },
    {
      year: 2022,
      'On-road': cf.on_road_total_2022_mtco2e,
    },
    {
      year: 2023,
      'On-road': cf.on_road_total_2023_mtco2e,
    },
  ]

  // Target lines based on core community baseline
  const baseline = cf.core_baseline_2019_mtco2e

  // Sector breakdown from latest inventory (only rows with confirmed values)
  const inv2023 = (inventory[2023] ?? []).filter(r => r.value_mtco2e != null)
  const sectorData = Object.entries(
    inv2023.reduce((acc, r) => {
      acc[r.sector] = (acc[r.sector] ?? 0) + r.value_mtco2e
      return acc
    }, {})
  ).map(([sector, value]) => ({ sector, value: Math.round(value) }))
    .sort((a, b) => b.value - a.value)

  const [showTrendTable, setShowTrendTable] = useState(false)
  const [showSectorTable, setShowSectorTable] = useState(false)

  return (
    <div>
      <h1 style={{ marginBottom: 8 }}>Emissions Dashboard</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--sp-5)', maxWidth: 680 }}>
        Charts are derived from confirmed data in the GPC inventory. Values marked NE
        are excluded from charts — gaps are real, not zeros.
      </p>

      {/* ---- Trend chart ---- */}
      <SectionCard title="📈 Emissions Trend">
        <p style={{ fontSize: 'var(--text-sm)', marginBottom: 12 }}>
          The 2019 community core total ({fmtNumber(cf.core_baseline_2019_mtco2e)} MTCO₂e) is the confirmed baseline
          from the Cascadia Wedge Memo. On-road values are confirmed for 2019, 2022, and 2023 from the Fehr &amp; Peers VMT Study.
          Stationary energy (natural gas, electricity) and waste are NE for years other than 2019 and are not shown.
          Target lines reference the core-footprint baseline.
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={trendData} margin={{ top: 8, right: 24, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="year" tick={{ fontSize: 12 }} />
            <YAxis
              tickFormatter={(v) => fmtNumber(v)}
              tick={{ fontSize: 12 }}
              label={{ value: 'MTCO₂e', angle: -90, position: 'insideLeft', offset: 12, fontSize: 11 }}
            />
            <Tooltip
              formatter={(v, name) => [`${fmtNumber(v)} MTCO₂e`, name]}
              contentStyle={{ fontSize: 'var(--text-sm)' }}
            />
            <Legend />
            <Bar dataKey="Community total (core)" fill="#1565c0" radius={[3, 3, 0, 0]} />
            <Bar dataKey="On-road" fill="#bf360c" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>

        {/* Target reference table */}
        <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {[
            { label: '2030 target (−50%)', value: Math.round(baseline * 0.5) },
            { label: '2040 target (−75%)', value: Math.round(baseline * 0.25) },
            { label: '2050 target (−95%)', value: Math.round(baseline * 0.05) },
          ].map(({ label, value }) => (
            <div
              key={label}
              style={{
                fontSize: 'var(--text-xs)',
                padding: '4px 10px',
                border: '1px dashed #000',
                borderRadius: 3,
                color: 'var(--text-muted)',
              }}
            >
              {label}: <strong>{fmtNumber(value)}</strong> MTCO₂e
            </div>
          ))}
        </div>

        <ChartCaption>
          2019 community core total ({fmtNumber(cf.core_baseline_2019_mtco2e)} MTCO₂e) confirmed from Cascadia Wedge Memo Table 1.
          On-road ({fmtNumber(cf.on_road_total_2019_mtco2e)} → {fmtNumber(cf.on_road_total_2023_mtco2e)} MTCO₂e,{' '}
          {(((cf.on_road_total_2023_mtco2e - cf.on_road_total_2019_mtco2e) / cf.on_road_total_2019_mtco2e) * 100).toFixed(1)}% change 2019–2023)
          confirmed from Fehr &amp; Peers VMT Study Table 2. Stationary energy and waste sector values remain NE.
        </ChartCaption>

        <button onClick={() => setShowTrendTable(v => !v)} aria-expanded={showTrendTable}
          style={{ marginTop: 12, background: 'none', border: '1px solid var(--border)', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', fontSize: 'var(--text-sm)' }}>
          {showTrendTable ? 'Hide' : 'Show'} data table
        </button>
        {showTrendTable && (
          <table style={{ marginTop: 12 }} aria-label="Emissions trend data">
            <caption style={{ textAlign: 'left', fontWeight: 600, fontSize: 'var(--text-sm)', padding: '4px 0' }}>Emissions trend (confirmed values)</caption>
            <thead><tr><th>Year</th><th style={{ textAlign: 'right' }}>Community total (core)</th><th style={{ textAlign: 'right' }}>On-road</th><th>Source</th></tr></thead>
            <tbody>
              {trendData.map(row => (
                <tr key={row.year}>
                  <td>{row.year}</td>
                  <td style={{ textAlign: 'right' }}>{fmtNumber(row['Community total (core)']) ?? '—'}</td>
                  <td style={{ textAlign: 'right' }}>{fmtNumber(row['On-road'])}</td>
                  <td><a href="https://www.cityoflfp.gov/DocumentCenter/View/12486/8_LFPVMT_Study_Final" target="_blank" rel="noopener noreferrer">Fehr &amp; Peers VMT Study ⚠</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </SectionCard>

      {/* ---- Sector split ---- */}
      <SectionCard title="🍕 Sector Breakdown (2023, confirmed values only)">
        {sectorData.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No confirmed MTCO₂e values available for 2023. All cells carry notation keys (NE/IE) — see the <a href="#/inventory">Inventory</a> view.</p>
        ) : (
          <>
            <p style={{ fontSize: 'var(--text-sm)', marginBottom: 12 }}>
              Only rows with confirmed numeric values are shown. Sectors with all-NE rows (Stationary Energy, AFOLU, IPPU, Waste) appear as <em>data gaps</em>, not zero emissions.
            </p>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={sectorData} layout="vertical" margin={{ top: 4, right: 40, left: 80, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis type="number" tickFormatter={fmtNumber} tick={{ fontSize: 11 }}
                  label={{ value: 'MTCO₂e', position: 'insideBottom', offset: -4, fontSize: 11 }} />
                <YAxis type="category" dataKey="sector" tick={{ fontSize: 11 }} width={76} />
                <Tooltip formatter={(v) => [`${fmtNumber(v)} MTCO₂e`]} contentStyle={{ fontSize: 'var(--text-sm)' }} />
                <Bar dataKey="value" radius={[0, 3, 3, 0]}>
                  {sectorData.map((entry) => (
                    <Cell key={entry.sector} fill={SECTOR_COLORS[entry.sector] ?? '#888'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <ChartCaption>
              Showing {sectorData.length} sector(s) with confirmed values. Missing sectors have NE notation keys — not zero.
            </ChartCaption>
            <button onClick={() => setShowSectorTable(v => !v)} aria-expanded={showSectorTable}
              style={{ marginTop: 12, background: 'none', border: '1px solid var(--border)', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', fontSize: 'var(--text-sm)' }}>
              {showSectorTable ? 'Hide' : 'Show'} data table
            </button>
            {showSectorTable && (
              <table style={{ marginTop: 12 }} aria-label="Sector breakdown data">
                <caption style={{ textAlign: 'left', fontWeight: 600, fontSize: 'var(--text-sm)', padding: '4px 0' }}>Sector breakdown 2023 (confirmed only)</caption>
                <thead><tr><th>Sector</th><th style={{ textAlign: 'right' }}>MTCO₂e</th></tr></thead>
                <tbody>
                  {sectorData.map(r => (
                    <tr key={r.sector}><td>{r.sector}</td><td style={{ textAlign: 'right' }}>{fmtNumber(r.value)}</td></tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </SectionCard>

      {/* ---- Wedge chart ---- */}
      <SectionCard title="📉 Scenario Wedge Chart (2019–2050)">
        <p style={{ fontSize: 'var(--text-sm)', marginBottom: 12 }}>
          Four trajectories: <strong>BAU</strong> (business-as-usual, no new policy: +26% by 2050),{' '}
          <strong>ABAU</strong> (accelerated BAU — existing federal/state/regional policy only: −56% by 2050),{' '}
          <strong>Local Action</strong> (adds LFP-specific measures: ≈−65% by 2050, estimate),{' '}
          <strong>Target</strong> (adopted city goals: −50% by 2030, −75% by 2040, −95% by 2050).
          Values are percent of 2019 baseline. Intermediate years are interpolated — reconcile with Wedge Memo.
        </p>
        <WedgeChart wedgeRows={wedge} />
        <ChartCaption>
          Source: Cascadia Consulting Group Wedge Memo (June 2025) ⚠ (403 fetch — figures confirmed via indexed snippets).
          BAU and ABAU endpoints confirmed; Local Action endpoint approximate.
          Intermediate years interpolated linearly.
        </ChartCaption>
      </SectionCard>
    </div>
  )
}
