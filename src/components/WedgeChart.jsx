/**
 * WedgeChart — BAU / ABAU / Local Action / Target scenario lines to 2050.
 * Uses percent-of-2019 values; interpolates missing intermediate years linearly.
 * Accessibility: includes a data table fallback.
 */
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { useState } from 'react'

const SCENARIO_STYLES = {
  BAU:           { color: '#c62828', dash: '' },
  ABAU:          { color: '#1565c0', dash: '5 5' },
  'Local Action':{ color: '#2e7d32', dash: '8 4 2 4' },
  Target:        { color: '#000000', dash: '4 2' },
}

const YEARS = [2019, 2025, 2030, 2040, 2050]

/**
 * Linear interpolation between two confirmed data points.
 */
function interpolate(x, x0, y0, x1, y1) {
  if (x0 === x1) return y0
  return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0)
}

/**
 * Build chart data from raw wedge rows.
 * Groups by scenario, sorts by year, interpolates missing intermediates.
 */
function buildChartData(wedgeRows, footprint = 'all') {
  const filtered = wedgeRows.filter((r) => r.footprint === footprint || r.footprint === '')
  const byScenario = {}

  for (const row of filtered) {
    if (!byScenario[row.scenario]) byScenario[row.scenario] = {}
    if (row.value_pct_of_2019 != null) {
      byScenario[row.scenario][row.year] = row.value_pct_of_2019
    }
  }

  // Interpolate each scenario across YEARS
  const scenarios = Object.keys(byScenario)
  return YEARS.map((year) => {
    const point = { year }
    for (const scenario of scenarios) {
      const data = byScenario[scenario]
      if (data[year] != null) {
        point[scenario] = data[year]
      } else {
        // Find surrounding confirmed anchors
        const knownYears = Object.keys(data)
          .map(Number)
          .sort((a, b) => a - b)
        const before = knownYears.filter((y) => y < year).pop()
        const after = knownYears.find((y) => y > year)
        if (before != null && after != null) {
          point[scenario] = Math.round(
            interpolate(year, before, data[before], after, data[after])
          )
          point[`${scenario}_interpolated`] = true
        }
      }
    }
    return point
  })
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div
      role="tooltip"
      style={{
        background: '#fff',
        border: '1px solid var(--border)',
        borderRadius: 6,
        padding: '10px 14px',
        boxShadow: 'var(--shadow)',
        fontSize: 'var(--text-sm)',
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 4 }}>{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} style={{ color: p.color, marginBottom: 2 }}>
          {p.name}: <strong>{p.value}%</strong> of 2019
        </div>
      ))}
    </div>
  )
}

export default function WedgeChart({ wedgeRows }) {
  const [footprint, setFootprint] = useState('all')
  const [showTable, setShowTable] = useState(false)

  const chartData = buildChartData(wedgeRows, footprint)
  const scenarios = Object.keys(SCENARIO_STYLES)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
        <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
          <legend className="sr-only">Footprint scope</legend>
          <div style={{ display: 'flex', gap: 6 }}>
            {['all', 'core'].map((f) => (
              <label
                key={f}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '4px 10px',
                  border: `1px solid ${footprint === f ? 'var(--color-forest)' : 'var(--border)'}`,
                  borderRadius: 4,
                  background: footprint === f ? '#e8f5e9' : 'white',
                  cursor: 'pointer',
                  fontSize: 'var(--text-sm)',
                  fontWeight: footprint === f ? 600 : 400,
                }}
              >
                <input
                  type="radio"
                  name="footprint"
                  value={f}
                  checked={footprint === f}
                  onChange={() => setFootprint(f)}
                  className="sr-only"
                />
                {f === 'all' ? 'All emissions' : 'Core only'}
              </label>
            ))}
          </div>
        </fieldset>
        <button
          onClick={() => setShowTable((v) => !v)}
          aria-expanded={showTable}
          style={{
            marginLeft: 'auto',
            background: 'none',
            border: '1px solid var(--border)',
            borderRadius: 4,
            padding: '4px 10px',
            cursor: 'pointer',
            fontSize: 'var(--text-sm)',
          }}
        >
          {showTable ? 'Hide' : 'Show'} data table
        </button>
      </div>

      <ResponsiveContainer width="100%" height={340}>
        <LineChart data={chartData} margin={{ top: 8, right: 24, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis
            dataKey="year"
            tick={{ fontSize: 12 }}
            label={{ value: 'Year', position: 'insideBottom', offset: -4, fontSize: 12 }}
          />
          <YAxis
            tickFormatter={(v) => `${v}%`}
            domain={[-10, 135]}
            tick={{ fontSize: 12 }}
            label={{
              value: '% of 2019 emissions',
              angle: -90,
              position: 'insideLeft',
              offset: 12,
              fontSize: 11,
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <ReferenceLine y={100} stroke="#888" strokeDasharray="3 3" label={{ value: '2019 baseline', fontSize: 10, position: 'right' }} />
          <ReferenceLine y={0} stroke="#2e7d32" strokeDasharray="4 2" label={{ value: 'Net zero', fontSize: 10, position: 'right' }} />

          {scenarios.map((scenario) => {
            const s = SCENARIO_STYLES[scenario]
            return (
              <Line
                key={scenario}
                type="monotone"
                dataKey={scenario}
                stroke={s.color}
                strokeWidth={scenario === 'Target' ? 3 : 2}
                strokeDasharray={s.dash || undefined}
                dot={{ r: 4, fill: s.color }}
                activeDot={{ r: 6 }}
                connectNulls
              />
            )
          })}
        </LineChart>
      </ResponsiveContainer>

      {showTable && (
        <div style={{ marginTop: 16, overflowX: 'auto' }}>
          <table aria-label="Wedge scenario data table">
            <caption style={{ textAlign: 'left', fontWeight: 600, fontSize: 'var(--text-sm)', padding: '6px 0' }}>
              Scenario trajectories (% of 2019 baseline)
            </caption>
            <thead>
              <tr>
                <th>Year</th>
                {scenarios.map((s) => <th key={s}>{s}</th>)}
              </tr>
            </thead>
            <tbody>
              {chartData.map((row) => (
                <tr key={row.year}>
                  <td>{row.year}</td>
                  {scenarios.map((s) => (
                    <td key={s} style={{ textAlign: 'right' }}>
                      {row[s] != null ? `${row[s]}%` : '—'}
                      {row[`${s}_interpolated`] && (
                        <abbr title="Interpolated value — not confirmed from source" style={{ marginLeft: 3, color: '#e65100', textDecoration: 'none', cursor: 'help' }}>*</abbr>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 6 }}>
            * Interpolated between confirmed source values. Reconcile with Wedge Memo before publication.
          </p>
        </div>
      )}
    </div>
  )
}
