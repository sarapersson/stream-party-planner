import './App.css'

function App() {
  return (
    <main className="app-shell">
      <section className="hero" aria-labelledby="page-title">
        <p className="eyebrow">Frontend skeleton</p>
        <h1 id="page-title">StreamParty Planner</h1>
        <p className="intro">
          The React frontend shell is ready for local development.
        </p>
        <p className="supporting">
          WatchParty UI flows will be added in later phases. This page does not
          fetch backend data yet.
        </p>
      </section>

      <section className="status-card" aria-labelledby="phase-scope-title">
        <h2 id="phase-scope-title">Phase 12 scope</h2>
        <ul>
          <li>
            React 19, TypeScript, and Vite are installed in{' '}
            <code>frontend/</code>.
          </li>
          <li>
            The Vite dev server proxies <code>/api</code> to{' '}
            <code>http://localhost:8080</code>.
          </li>
          <li>WatchParty CRUD UI remains planned for a later phase.</li>
        </ul>
      </section>
    </main>
  )
}

export default App
