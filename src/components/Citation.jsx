/**
 * Citation — renders a source reference as an inline link with tooltip.
 * If the source has a reliability_note, a ⚠ warning is shown.
 */

export default function Citation({ source, children }) {
  if (!source) return children ?? null

  const hasWarning = !!(source.reliability_note && source.reliability_note.trim())
  const label = children ?? source.source_id

  const title = [
    source.citation,
    source.url ? `URL: ${source.url}` : null,
    source.accessed ? `Accessed: ${source.accessed}` : null,
    source.type ? `Type: ${source.type}` : null,
    hasWarning ? `⚠ ${source.reliability_note}` : null,
  ]
    .filter(Boolean)
    .join('\n')

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
      {source.url ? (
        <a
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          title={title}
          aria-label={`Source: ${source.citation ?? source.source_id}`}
          style={{ fontSize: '0.8em', color: 'var(--color-sky)' }}
        >
          {label}
        </a>
      ) : (
        <abbr title={title} style={{ fontSize: '0.8em', color: 'var(--color-slate-lt)', textDecoration: 'none', cursor: 'help' }}>
          {label}
        </abbr>
      )}
      {hasWarning && (
        <abbr
          title={source.reliability_note}
          aria-label={`Data reliability note: ${source.reliability_note}`}
          style={{
            fontSize: '0.75em',
            cursor: 'help',
            textDecoration: 'none',
            color: '#e65100',
          }}
        >
          ⚠
        </abbr>
      )}
    </span>
  )
}
