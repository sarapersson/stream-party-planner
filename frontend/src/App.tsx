import { useEffect, useState, type FormEvent } from 'react'
import './App.css'
import {
  createWatchParty,
  listWatchParties,
  type CreateWatchPartyRequest,
  type WatchParty,
} from './api/watchParties'

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
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [genre, setGenre] = useState('')
  const [maxParticipants, setMaxParticipants] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [createErrorMessage, setCreateErrorMessage] = useState<string | null>(
    null,
  )

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

  async function handleCreateSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setCreateErrorMessage(null)

    const trimmedTitle = title.trim()
    const trimmedDescription = description.trim()
    const trimmedGenre = genre.trim()
    const parsedMaxParticipants = Number(maxParticipants)

    if (
      trimmedTitle === '' ||
      scheduledAt === '' ||
      trimmedGenre === '' ||
      maxParticipants.trim() === ''
    ) {
      setCreateErrorMessage(
        'Enter a title, scheduled date and time, genre, and maximum participants.',
      )
      return
    }

    if (
      !Number.isFinite(parsedMaxParticipants) ||
      !Number.isInteger(parsedMaxParticipants) ||
      parsedMaxParticipants <= 0
    ) {
      setCreateErrorMessage('Maximum participants must be a positive whole number.')
      return
    }

    const scheduledAtDate = new Date(scheduledAt)

    if (Number.isNaN(scheduledAtDate.getTime())) {
      setCreateErrorMessage('Enter a valid scheduled date and time.')
      return
    }

    const request: CreateWatchPartyRequest = {
      title: trimmedTitle,
      scheduledAt: scheduledAtDate.toISOString(),
      genre: trimmedGenre,
      maxParticipants: parsedMaxParticipants,
    }

    if (trimmedDescription !== '') {
      request.description = trimmedDescription
    }

    setIsCreating(true)

    try {
      const createdWatchParty = await createWatchParty(request)

      setWatchParties((currentWatchParties) => [
        createdWatchParty,
        ...currentWatchParties,
      ])
      setTitle('')
      setDescription('')
      setScheduledAt('')
      setGenre('')
      setMaxParticipants('')
    } catch {
      setCreateErrorMessage(
        'Failed to create the watch party. Check the details and try again.',
      )
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <main className="app-shell">
      <section className="hero" aria-labelledby="page-title">
        <p className="eyebrow">WatchParty create flow</p>
        <h1 id="page-title">StreamParty Planner</h1>
        <p className="intro">
          Create and browse watch parties backed by the API.
        </p>
        <p className="supporting">
          This phase supports creating new WatchParty records. Update and
          delete UI flows are still planned for later phases.
        </p>
      </section>

      <section className="create-card" aria-labelledby="create-title">
        <h2 id="create-title">Create a watch party</h2>
        <p className="section-intro">
          Add the basic details for a planned stream watch party.
        </p>

        <form className="create-form" onSubmit={handleCreateSubmit}>
          <div className="form-field">
            <label htmlFor="watch-party-title">Title</label>
            <input
              id="watch-party-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={120}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="watch-party-description">Description</label>
            <textarea
              id="watch-party-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={1000}
              rows={4}
            />
          </div>

          <div className="form-field">
            <label htmlFor="watch-party-scheduled-at">
              Scheduled date and time
            </label>
            <input
              id="watch-party-scheduled-at"
              type="datetime-local"
              value={scheduledAt}
              onChange={(event) => setScheduledAt(event.target.value)}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="watch-party-genre">Genre</label>
            <input
              id="watch-party-genre"
              type="text"
              value={genre}
              onChange={(event) => setGenre(event.target.value)}
              maxLength={80}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="watch-party-max-participants">
              Maximum participants
            </label>
            <input
              id="watch-party-max-participants"
              type="number"
              value={maxParticipants}
              onChange={(event) => setMaxParticipants(event.target.value)}
              min={1}
              step={1}
              required
            />
          </div>

          {createErrorMessage && (
            <p className="state-message state-message--error" role="alert">
              {createErrorMessage}
            </p>
          )}

          <button type="submit" disabled={isCreating}>
            {isCreating ? 'Creating...' : 'Create watch party'}
          </button>
        </form>
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
