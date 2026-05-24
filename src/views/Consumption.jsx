/**
 * Consumption — Scope 3 consumption-based (supply-chain) footprint view.
 * Deliverable #6. All values currently NE — shows explainer and methodology.
 */
import NotationKey from '../components/NotationKey.jsx'
import Citation from '../components/Citation.jsx'
import { Link } from 'react-router-dom'

export default function Consumption({ data }) {
  const { consumption, sourceMap } = data

  const confirmedRows = consumption.filter(r => r.value_mtco2e != null)
  const allNE = confirmedRows.length === 0

  return (
    <div>
      <h1 style={{ marginBottom: 8 }}>Consumption-Based (Scope 3) Footprint</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--sp-5)', maxWidth: 680 }}>
        What LFP residents actually consume — beyond the city's territorial boundary. This is the supply-chain
        (Scope 3) footprint: emissions embedded in food, goods, services, and travel that occur wherever
        the production happens, not where residents live.
      </p>

      {/* Key explainer box */}
      <div
        className="card"
        style={{
          borderLeft: '4px solid var(--color-amber)',
          marginBottom: 'var(--sp-5)',
          background: '#fff8f5',
        }}
        role="note"
        aria-label="Explainer: territorial vs. consumption-based accounting"
      >
        <h2 style={{ marginBottom: 10, fontSize: 'var(--text-xl)' }}>
          Why the territorial inventory understates LFP's impact
        </h2>
        <p>
          The GPC inventory measures emissions that occur <em>within</em> LFP's city boundary (territorial
          accounting). But LFP is a wealthy bedroom community — residents drive to work in Seattle, fly
          frequently, and purchase goods manufactured elsewhere. The emissions from those activities occur
          far outside the city but are <em>caused</em> by LFP residents.
        </p>
        <p>
          <strong>Precedent from nearby cities:</strong>
        </p>
        <ul>
          <li>
            <strong>Edmonds, WA</strong> — a comparable King County city — found its consumption-based
            footprint was approximately <strong>44% larger</strong> than its territorial emissions.
          </li>
          <li>
            <strong>Paris, France</strong> — consumption-based footprint is more than double the territorial total,
            driven by imported goods and services.
          </li>
        </ul>
        <p>
          LFP's median household income (~$150k+) and car-dependent layout suggest its consumption gap
          is likely even larger than Edmonds. High-income households have significantly higher aviation
          and discretionary-goods emissions.
        </p>
        <p style={{ marginBottom: 0 }}>
          <strong>Double-counting caveat:</strong> Some consumption categories overlap with the territorial
          inventory. On-road transport fuels appear in both. The consumption-based total is a <em>separate
          accounting boundary</em>, not additive to the territorial total. See{' '}
          <Link to="/methodology">Methodology</Link> for boundary definitions.
        </p>
      </div>

      {/* Status banner */}
      <div className="draft-banner" style={{ marginBottom: 'var(--sp-5)' }}>
        <strong>Data status: Not Estimated (NE) for all categories.</strong>{' '}
        A consumption-based emissions inventory (CBEI) requires either a downscale of
        King County PSREAP data or a spend-based EEIO (Environmentally-Extended Input-Output)
        model applied to LFP demographics. Neither has been completed yet.
        This view will populate once that analysis is done — see open item in{' '}
        <Link to="/methodology">Methodology §3</Link>.
      </div>

      {/* Category table — all NE */}
      <div className="card">
        <h2 style={{ marginBottom: 'var(--sp-4)', fontSize: 'var(--text-xl)' }}>
          Consumption Categories
        </h2>
        <div style={{ overflowX: 'auto', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <table aria-label="Consumption-based emissions by category">
            <thead>
              <tr>
                <th>Category</th>
                <th style={{ textAlign: 'right' }}>MTCO₂e</th>
                <th>% of Total</th>
                <th>Method</th>
                <th>Source</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {consumption.map((row, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 500 }}>{row.category}</td>
                  <td style={{ textAlign: 'right' }}>
                    {row.value_mtco2e != null
                      ? row.value_mtco2e.toLocaleString()
                      : <NotationKey code="NE" showLabel={false} />}
                  </td>
                  <td>
                    {row.pct_of_cbei != null
                      ? `${row.pct_of_cbei}%`
                      : <NotationKey code="NE" showLabel={false} />}
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{row.method}</td>
                  <td><Citation source={row._source}>{row.source_id}</Citation></td>
                  <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: 300 }}>{row.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ marginTop: 8, fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
          All values are NE (Not Estimated) pending King County CBEI downscale or spend-based EEIO analysis.
          Download: <a href={`${import.meta.env.BASE_URL}data/consumption_based.csv`} download>consumption_based.csv</a>
        </p>
      </div>

      {/* Next steps */}
      <div className="card" style={{ marginTop: 'var(--sp-5)', borderLeft: '4px solid var(--color-sky)' }}>
        <h3 style={{ marginBottom: 8 }}>Next steps to populate this view</h3>
        <ol style={{ margin: 0, paddingLeft: '1.25em', fontSize: 'var(--text-sm)' }}>
          <li style={{ marginBottom: 6 }}>
            <strong>Option A — King County downscale:</strong> Obtain the King County PSREAP CBEI dataset and
            downscale by LFP's share of King County population/income. Flag methodology change risk
            (PSREAP changed methodology between 2017/2019/2022 releases).
          </li>
          <li style={{ marginBottom: 6 }}>
            <strong>Option B — Spend-based EEIO:</strong> Apply USEEIO v2 or similar to BLS Consumer Expenditure
            Survey data stratified by LFP median income. Documents the spending → emissions translation clearly.
          </li>
          <li>
            Once values are confirmed, edit <code>consumption_based.csv</code> and rebuild.
            No component code changes needed.
          </li>
        </ol>
      </div>
    </div>
  )
}
