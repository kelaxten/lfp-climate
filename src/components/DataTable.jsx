/**
 * DataTable — sortable table with notation-key badges and source citation links.
 * Provides an accessible data representation for all chart views.
 */
import { useState } from 'react'
import NotationKey from './NotationKey.jsx'
import Citation from './Citation.jsx'
import { fmtNumber } from '../lib/format.js'

/**
 * @param {object[]} rows
 * @param {Array<{key: string, label: string, render?: function, sortable?: boolean, align?: 'left'|'right'|'center'}>} columns
 * @param {string} [caption]
 * @param {string} [id] - unique id for aria-labelledby
 */
export default function DataTable({ rows, columns, caption, id }) {
  const [sortKey, setSortKey] = useState(null)
  const [sortDir, setSortDir] = useState('asc')

  function handleSort(key) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  let displayRows = [...rows]
  if (sortKey) {
    displayRows.sort((a, b) => {
      const av = a[sortKey] ?? ''
      const bv = b[sortKey] ?? ''
      const cmp = typeof av === 'number' && typeof bv === 'number'
        ? av - bv
        : String(av).localeCompare(String(bv))
      return sortDir === 'asc' ? cmp : -cmp
    })
  }

  const tableId = id ?? 'data-table'

  return (
    <div style={{ overflowX: 'auto', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
      <table aria-labelledby={caption ? `${tableId}-caption` : undefined}>
        {caption && (
          <caption
            id={`${tableId}-caption`}
            style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600, fontSize: 'var(--text-sm)', background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}
          >
            {caption}
          </caption>
        )}
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={col.sortable !== false ? () => handleSort(col.key) : undefined}
                aria-sort={
                  sortKey === col.key
                    ? sortDir === 'asc'
                      ? 'ascending'
                      : 'descending'
                    : col.sortable !== false
                    ? 'none'
                    : undefined
                }
                style={{ textAlign: col.align ?? 'left', whiteSpace: 'nowrap' }}
              >
                {col.label}
                {sortKey === col.key && (
                  <span aria-hidden="true" style={{ marginLeft: 4 }}>
                    {sortDir === 'asc' ? '▲' : '▼'}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {displayRows.map((row, i) => (
            <tr key={i}>
              {columns.map((col) => (
                <td key={col.key} style={{ textAlign: col.align ?? 'left' }}>
                  {col.render ? col.render(row) : renderCell(row[col.key], row, col)}
                </td>
              ))}
            </tr>
          ))}
          {displayRows.length === 0 && (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>
                No data available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

function renderCell(value, row, col) {
  // Notation key cell
  if (col.key === 'notation_key' && value) {
    return <NotationKey code={value} showLabel={false} />
  }
  // Source cell
  if (col.key === 'source_id' && row._source) {
    return <Citation source={row._source}>{value}</Citation>
  }
  // Numeric
  if (typeof value === 'number') {
    return fmtNumber(value)
  }
  return value ?? '—'
}
