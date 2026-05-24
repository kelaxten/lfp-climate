/**
 * StatCard — headline metric tile used on the Overview and detail views.
 */

export default function StatCard({
  label,
  value,
  unit,
  subtext,
  trend,      // 'up' | 'down' | null
  trendGood,  // if true, 'up' is good (green); default up=bad (red)
  draft = false,
  style = {},
}) {
  const trendColor =
    trend === 'down'
      ? trendGood === false
        ? '#c62828'
        : '#2e7d32'
      : trend === 'up'
      ? trendGood
        ? '#2e7d32'
        : '#c62828'
      : 'inherit'

  return (
    <div
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        position: 'relative',
        ...style,
      }}
    >
      {draft && (
        <span
          style={{
            position: 'absolute',
            top: 8,
            right: 10,
            fontSize: '0.65rem',
            fontWeight: 700,
            color: '#bf360c',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            background: '#fff8e1',
            padding: '1px 5px',
            borderRadius: 3,
            border: '1px solid #f9a825',
          }}
          aria-label="Draft figure"
        >
          Draft
        </span>
      )}
      <div
        style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--text-muted)',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 'var(--text-3xl)',
          fontWeight: 800,
          lineHeight: 1.1,
          color: trendColor !== 'inherit' ? trendColor : 'var(--color-forest)',
        }}
      >
        {value ?? '—'}
      </div>
      {unit && (
        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginTop: -4 }}>
          {unit}
        </div>
      )}
      {subtext && (
        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', borderTop: '1px solid var(--border-lt)', paddingTop: 8, marginTop: 4 }}>
          {subtext}
        </div>
      )}
    </div>
  )
}
