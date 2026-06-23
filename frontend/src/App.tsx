import { useEffect, useState } from 'react'
import './App.css'
import { listWatchParties, type WatchParty } from './api/watchParties'

const scheduledAtFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
})

function formatScheduledAt(scheduledAt: string) {
  return scheduledAtFormatter.format(new Date(scheduledAt))
}

function App() {
  const [watchParties, setWatchParties] = useState<WatchParty[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let isCancelled = false

    async function loadWatchParties() {
      try {
        const loadedWatchParties = await listWatchParties()

        if (!isCancelled) {
          setWatchParties(loadedWatchParties)
          setErrorMessage(null)
        }
      } catch {
        if (!isCancelled) {
          setErrorMessage(
            'Failed to load watch parties. Make sure the backend is running and try again.',
          )
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadWatchParties()

    return () => {
      isCancelled = true
    }
  }, [])

  return (
    <main className="app-shell">
      <section className="hero" aria-labelledby="page-title">
        <p className="eyebrow">WatchParty read flow</p>
        <h1 id="page-title">StreamParty Planner</h1>
        <p className="intro">
          Browse watch parties loaded from the backend API.
        </p>
        <p className="supporting">
          This phase displays existing WatchParty data only. Create, update,
          and delete UI flows are still planned for later phases.
        </p>
      </section>

      <section className="status-card" aria-labelledby="watch-parties-title">
        <h2 id="watch-parties-title">Watch parties</h2>

        {isLoading && (
          <p className="state-message" role="status">
            Loading watch parties...
          </p>
        )}

        {!isLoading && errorMessage && (
          <p className="state-message state-message--error" role="alert">
            {errorMessage}
          </p>
        )}

        {!isLoading && !errorMessage && watchParties.length === 0 && (
          <p className="state-message">
            No watch parties have been created yet.
          </p>
        )}

        {!isLoading && !errorMessage && watchParties.length > 0 && (
          <ul className="watch-party-list">
            {watchParties.map((watchParty) => (
              <li className="watch-party-card" key={watchParty.id}>
                <article>
                  <div className="watch-party-card__header">
                    <h3>{watchParty.title}</h3>
                    <span className="status-badge">{watchParty.status}</span>
                  </div>

                  <p className="watch-party-card__time">
                    <span>Scheduled for </span>
                    <time dateTime={watchParty.scheduledAt}>
                      {formatScheduledAt(watchParty.scheduledAt)}
                    </time>
                  </p>

                  {watchParty.description && (
                    <p className="watch-party-card__description">
                      {watchParty.description}
                    </p>
                  )}
                </article>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}

export default App
