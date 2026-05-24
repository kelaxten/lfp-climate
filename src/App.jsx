/**
 * App.jsx — hash router + top-level data loading.
 * Uses HashRouter so deep links work on GitHub Pages without a 404.
 */
import { HashRouter, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Layout from './components/Layout.jsx'
import Overview from './views/Overview.jsx'
import Inventory from './views/Inventory.jsx'
import Dashboard from './views/Dashboard.jsx'
import Consumption from './views/Consumption.jsx'
import Canopy from './views/Canopy.jsx'
import Methodology from './views/Methodology.jsx'
import { loadAllData } from './lib/loadData.js'

function LoadingSkeleton() {
  return (
    <div style={{ padding: 'var(--sp-8)', textAlign: 'center', color: 'var(--text-muted)' }}>
      <div
        style={{
          display: 'inline-block',
          width: 40,
          height: 40,
          border: '4px solid var(--border)',
          borderTopColor: 'var(--color-forest)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          marginBottom: 'var(--sp-4)',
        }}
        aria-hidden="true"
      />
      <p style={{ margin: 0 }}>Loading emissions data…</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

function ErrorState({ error }) {
  return (
    <div
      role="alert"
      style={{
        padding: 'var(--sp-5)',
        background: '#ffebee',
        border: '1px solid #ef9a9a',
        borderRadius: 'var(--radius)',
        color: '#b71c1c',
      }}
    >
      <h2 style={{ marginBottom: 8, color: '#b71c1c' }}>Failed to load data</h2>
      <p style={{ margin: '0 0 12px' }}>
        {error?.message ?? 'An unexpected error occurred while loading the data files.'}
      </p>
      <details>
        <summary style={{ cursor: 'pointer', fontWeight: 600, fontSize: 'var(--text-sm)' }}>
          Troubleshooting
        </summary>
        <ul style={{ fontSize: 'var(--text-sm)', marginTop: 8 }}>
          <li>Check that all CSV files exist in <code>/data/</code></li>
          <li>Verify the Vite <code>base</code> path in <code>vite.config.js</code> matches the GitHub Pages deployment path</li>
          <li>Check the browser console for network errors (HTTP 404/403)</li>
          <li>If running locally, use <code>npm run dev</code> (not opening <code>index.html</code> directly)</li>
        </ul>
      </details>
    </div>
  )
}

export default function App() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadAllData()
      .then(setData)
      .catch(setError)
  }, [])

  const isLoading = !data && !error

  return (
    <HashRouter>
      <Layout manifest={data?.manifest}>
        {isLoading && <LoadingSkeleton />}
        {error && <ErrorState error={error} />}
        {data && (
          <Routes>
            <Route path="/"            element={<Overview     data={data} />} />
            <Route path="/inventory"   element={<Inventory    data={data} />} />
            <Route path="/dashboard"   element={<Dashboard    data={data} />} />
            <Route path="/consumption" element={<Consumption  data={data} />} />
            <Route path="/canopy"      element={<Canopy       data={data} />} />
            <Route path="/methodology" element={<Methodology  data={data} />} />
            <Route path="*"            element={
              <div style={{ textAlign: 'center', padding: 'var(--sp-8)' }}>
                <h1>404 — Page not found</h1>
                <p><a href="#/">Return to Overview</a></p>
              </div>
            } />
          </Routes>
        )}
      </Layout>
    </HashRouter>
  )
}
