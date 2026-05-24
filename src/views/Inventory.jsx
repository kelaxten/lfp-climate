/**
 * Inventory — GPC-keyed table view with year selector, notation keys, and source links.
 * Deliverable #2: full GPC conformance display.
 */
import { useState } from 'react'
import DataTable from '../components/DataTable.jsx'
import NotationKey from '../components/NotationKey.jsx'
import Citation from '../components/Citation.jsx'
import { NOTATION_KEYS, SECTORS, SCOPES } from '../lib/gpc.js'
import { fmtNumber } from '../lib/format.js'

const SCOPE_COLORS = { '1': '#c62828', '2': '#f57f17', '3': '#4527a0' }

function ScopeBadge({ scope }) {
  const color = SCOPE_COLORS[String(scope)] ?? 'var(--color-slate)'
  return (
    <span
      title={SCOPES[scope]?.description}
      style={{
        display: 'inline-block',
        padding: '1px 6px',
        borderRadius: 3,
        background: color + '18',
        color,
        border: `1px solid ${color}40`,
        fontSize: '0.7rem',
        fontWeight: 700,
        fontFamily: 'var(--font-mono)',
        cursor: 'help',
      }}
    >
      S{scope}
    </span>
  )
}

const COLUMNS = [
  { key: 'gpc_refno', label: 'GPC Ref', sortable: true, render: (row) => (
    <code style={{ fontSize: '0.8rem', color: 'var(--color-forest)' }}>{row.gpc_refno}</code>
  )},
  { key: 'sector', label: 'Sector', sortable: true, render: (row) => {
    const s = SECTORS[row.sector]
    return (
      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {s && (
          <span
            style={{
              width: 10, height: 10, borderRadius: '50%',
              background: s.color, flexShrink: 0, display: 'inline-block',
            }}
            aria-hidden="true"
          />
        )}
        {row.sector}
      </span>
    )
  }},
  { key: 'subsector', label: 'Subsector', sortable: true },
  { key: 'scope', label: 'Scope', sortable: true, render: (row) => <ScopeBadge scope={row.scope} /> },
  { key: 'value_mtco2e', label: 'MTCO₂e', sortable: true, align: 'right', render: (row) => {
    if (row.notation_key) return <NotationKey code={row.notation_key} showLabel={false} />
    if (row.value_mtco2e != null) return <strong>{fmtNumber(row.value_mtco2e)}</strong>
    return '—'
  }},
  { key: 'source_id', label: 'Source', sortable: false, render: (row) => (
    <Citation source={row._source}>{row.source_id}</Citation>
  )},
  { key: 'notes', label: 'Notes', sortable: false, render: (row) => (
    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: 340, display: 'block' }}>{row.notes}</span>
  )},
]

export default function Inventory({ data }) {
  const { manifest, inventory } = data
  const [year, setYear] = useState(manifest.latest_year)

  const rows = inventory[year] ?? []

  // Group by sector for the summary
  const sectorTotals = {}
  for (const row of rows) {
    if (!sectorTotals[row.sector]) sectorTotals[row.sector] = { confirmed: 0, ne: 0 }
    if (row.value_mtco2e != null) sectorTotals[row.sector].confirmed++
    else if (row.notation_key) sectorTotals[row.sector].ne++
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 'var(--sp-5)' }}>
        <div>
          <h1 style={{ marginBottom: 8 }}>GPC Emissions Inventory</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0, maxWidth: 600 }}>
            Full GPC-keyed inventory table. GPC v{manifest.gpc_version} · {manifest.reporting_level}.
            Notation keys flag data status; no number is invented to fill a gap.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Year selector */}
          <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
            <legend style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 4 }}>Year</legend>
            <div style={{ display: 'flex', gap: 6 }}>
              {manifest.available_years.map((y) => (
                <label
                  key={y}
                  style={{
                    padding: '5px 14px',
                    border: `1px solid ${year === y ? 'var(--color-forest)' : 'var(--border)'}`,
                    borderRadius: 4,
                    background: year === y ? '#e8f5e9' : 'white',
                    cursor: 'pointer',
                    fontWeight: year === y ? 700 : 400,
                    fontSize: 'var(--text-sm)',
                  }}
                >
                  <input
                    type="radio"
                    name="year"
                    value={y}
                    checked={year === y}
                    onChange={() => setYear(y)}
                    className="sr-only"
                  />
                  {y}
                </label>
              ))}
            </div>
          </fieldset>

          {/* Download CSV */}
          <a
            href={`${import.meta.env.BASE_URL}data/inventory_${year}.csv`}
            download={`lfp_inventory_${year}.csv`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '5px 14px',
              border: '1px solid var(--border)',
              borderRadius: 4,
              textDecoration: 'none',
              color: 'var(--color-sky)',
              fontSize: 'var(--text-sm)',
              background: 'white',
            }}
            aria-label={`Download raw CSV for ${year} inventory`}
          >
            ⬇ Download CSV
          </a>
        </div>
      </div>

      {/* Reporting level banner */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 'var(--sp-4)',
        padding: 'var(--sp-3)',
        background: 'var(--bg)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border)',
        alignItems: 'center',
      }}>
        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>Reporting:</span>
        <span
          style={{
            padding: '2px 8px', borderRadius: 3, fontSize: 'var(--text-xs)',
            background: '#e8f5e9', color: 'var(--color-forest)', border: '1px solid #a5d6a7', fontWeight: 600,
          }}
        >
          BASIC
        </span>
        <span
          style={{
            padding: '2px 8px', borderRadius: 3, fontSize: 'var(--text-xs)',
            background: '#e3f2fd', color: 'var(--color-sky)', border: '1px solid #90caf9', fontWeight: 600,
          }}
        >
          partial BASIC+
        </span>
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
          GPC v{manifest.gpc_version} ·{' '}
          <a href="https://ghgprotocol.org/global-protocol-community-scale-greenhouse-gas-emission-inventories" target="_blank" rel="noopener noreferrer">
            Protocol reference
          </a>
        </span>
      </div>

      {/* Notation key legend */}
      <details style={{ marginBottom: 'var(--sp-4)' }}>
        <summary
          style={{
            cursor: 'pointer',
            fontSize: 'var(--text-sm)',
            fontWeight: 600,
            padding: 'var(--sp-2) var(--sp-3)',
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          GPC Notation Key legend
        </summary>
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 12, padding: 'var(--sp-3)',
          border: '1px solid var(--border)', borderTop: 'none',
          borderRadius: '0 0 var(--radius-sm) var(--radius-sm)',
          background: 'white',
        }}>
          {Object.entries(NOTATION_KEYS).map(([code, def]) => (
            <div key={code} style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 160 }}>
              <NotationKey code={code} showLabel />
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>{def.description}</span>
            </div>
          ))}
        </div>
      </details>

      {/* Main inventory table */}
      <DataTable
        rows={rows}
        columns={COLUMNS}
        caption={`GPC Inventory ${year} — ${manifest.city}`}
        id="inventory-table"
      />

      <p style={{ marginTop: 'var(--sp-3)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
        {rows.length} rows · {rows.filter(r => r.value_mtco2e != null).length} with confirmed values ·{' '}
        {rows.filter(r => r.notation_key).length} with notation keys
        {' '}· <a href={`${import.meta.env.BASE_URL}data/inventory_${year}.csv`} target="_blank" rel="noopener noreferrer">View raw CSV</a>
      </p>
    </div>
  )
}
