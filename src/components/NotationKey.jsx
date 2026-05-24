/**
 * NotationKey — badge for GPC inventory notation keys: IE / NE / NO / C
 * Must be shown in every compliant inventory table.
 */
import { NOTATION_KEYS } from '../lib/gpc.js'

const colorMap = {
  IE: { bg: '#e3f2fd', color: '#0277bd', border: '#90caf9' },
  NE: { bg: '#fff3e0', color: '#bf360c', border: '#ffcc80' },
  NO: { bg: '#eceff1', color: '#37474f', border: '#b0bec5' },
  C:  { bg: '#fce4ec', color: '#880e4f', border: '#f48fb1' },
}

export default function NotationKey({ code, showLabel = true }) {
  const def = NOTATION_KEYS[code]
  if (!def) return null
  const style = colorMap[code] ?? { bg: '#f5f5f5', color: '#333', border: '#ccc' }

  return (
    <abbr
      title={`${def.full} — ${def.description}`}
      aria-label={`${def.full}: ${def.description}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '2px 7px',
        borderRadius: '4px',
        background: style.bg,
        color: style.color,
        border: `1px solid ${style.border}`,
        fontSize: '0.75rem',
        fontWeight: 700,
        letterSpacing: '0.04em',
        textDecoration: 'none',
        fontFamily: 'var(--font-mono)',
        cursor: 'help',
        whiteSpace: 'nowrap',
      }}
    >
      {code}
      {showLabel && (
        <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: '0.7rem' }}>
          {def.full}
        </span>
      )}
    </abbr>
  )
}
