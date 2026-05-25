/**
 * Layout — top nav, main content wrapper, and footer.
 * Uses hash routing so deep links work on GitHub Pages.
 */
import { NavLink } from 'react-router-dom'

const NAV_LINKS = [
  { to: '/',             label: 'Overview',    end: true },
  { to: '/inventory',    label: 'Inventory'    },
  { to: '/dashboard',    label: 'Dashboard'    },
  { to: '/consumption',  label: 'Consumption'  },
  { to: '/canopy',       label: 'Canopy'       },
  { to: '/methodology',  label: 'Methodology'  },
  { to: '/policy',       label: 'Policy'       },
]

export default function Layout({ children, manifest }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Skip link for keyboard/screen reader users */}
      <a
        href="#main-content"
        style={{
          position: 'absolute',
          left: '-9999px',
          top: 0,
          zIndex: 999,
          background: 'var(--color-forest)',
          color: 'white',
          padding: '8px 16px',
        }}
        onFocus={(e) => { e.target.style.left = '0' }}
        onBlur={(e) => { e.target.style.left = '-9999px' }}
      >
        Skip to main content
      </a>

      <header
        style={{
          background: 'var(--color-forest)',
          color: 'white',
          padding: 'var(--sp-4) var(--sp-5)',
        }}
        role="banner"
      >
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 800, fontSize: 'var(--text-xl)' }}>🌲 LFP Climate Hub</span>
            <span style={{ fontSize: 'var(--text-sm)', opacity: 0.85 }}>Emissions Inventory &amp; Dashboard</span>
            {manifest && (
              <span
                style={{
                  marginLeft: 'auto',
                  fontSize: 'var(--text-xs)',
                  background: '#fff8e1',
                  color: '#bf360c',
                  padding: '2px 8px',
                  borderRadius: 4,
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                DRAFT
              </span>
            )}
          </div>

          <nav aria-label="Main navigation">
            <ul
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 4,
                listStyle: 'none',
                margin: 0,
                padding: 0,
              }}
            >
              {NAV_LINKS.map(({ to, label, end }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={end}
                    style={({ isActive }) => ({
                      display: 'inline-block',
                      padding: '4px 12px',
                      borderRadius: 4,
                      textDecoration: 'none',
                      fontSize: 'var(--text-sm)',
                      fontWeight: isActive ? 700 : 400,
                      color: 'white',
                      background: isActive ? 'rgba(255,255,255,0.2)' : 'transparent',
                      border: isActive ? '1px solid rgba(255,255,255,0.4)' : '1px solid transparent',
                    })}
                    aria-current={({ isActive }) => isActive ? 'page' : undefined}
                  >
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <main
        id="main-content"
        tabIndex={-1}
        style={{
          flex: 1,
          maxWidth: 1100,
          width: '100%',
          margin: '0 auto',
          padding: 'var(--sp-6) var(--sp-5)',
        }}
      >
        {children}
      </main>

      <footer
        style={{
          background: '#1a1a1a',
          color: '#aaa',
          padding: 'var(--sp-5)',
          fontSize: 'var(--text-sm)',
          textAlign: 'center',
        }}
        role="contentinfo"
      >
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p style={{ margin: '0 0 4px' }}>
            Data:{' '}
            <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer" style={{ color: '#90caf9' }}>
              CC BY 4.0
            </a>{' '}
            · Code:{' '}
            <a href="https://opensource.org/licenses/MIT" target="_blank" rel="noopener noreferrer" style={{ color: '#90caf9' }}>
              MIT
            </a>{' '}
            · Attribution: LFP Climate Hub + original sources
          </p>
          {manifest && (
            <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: '#666' }}>
              Last updated: {manifest.last_updated} · GPC v{manifest.gpc_version} · {manifest.reporting_level}
              {' '}·{' '}
              <a
                href="https://github.com/kelaxten/lfp-climate"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#90caf9' }}
              >
                View source / fork this project
              </a>
            </p>
          )}
        </div>
      </footer>
    </div>
  )
}
