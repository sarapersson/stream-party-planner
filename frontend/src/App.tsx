import { useEffect, useState, type FormEvent } from 'react'
import './App.css'
import {
  createWatchParty,
  deleteWatchParty,
  listWatchParties,
  updateWatchParty,
  type CreateWatchPartyRequest,
  type UpdateWatchPartyRequest,
  type WatchParty,
  type WatchPartyStatus,
} from './api/watchParties'

const WATCH_PARTY_STATUSES: WatchPartyStatus[] = [
  'PLANNED',
  'LIVE',
  'FINISHED',
  'CANCELLED',
]

const scheduledAtFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
})

type EditFormState = {
  id: string
  title: string
  description: string
  scheduledAt: string
  genre: string
  maxParticipants: string
  status: WatchPartyStatus
}

type EditTextField = Exclude<keyof EditFormState, 'id' | 'status'>

function formatScheduledAt(scheduledAt: string) {
  return scheduledAtFormatter.format(new Date(scheduledAt))
}

function toDatetimeLocalInputValue(isoTimestamp: string) {
  const date = new Date(isoTimestamp)
  const timezoneOffsetMs = date.getTimezoneOffset() * 60_000

  return new Date(date.getTime() - timezoneOffsetMs).toISOString().slice(0, 16)
}

function isWatchPartyStatus(value: string): value is WatchPartyStatus {
  return WATCH_PARTY_STATUSES.some((status) => status === value)
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
  const [editForm, setEditForm] = useState<EditFormState | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateErrorMessage, setUpdateErrorMessage] = useState<string | null>(
    null,
  )
  const [deletingWatchPartyId, setDeletingWatchPartyId] = useState<
    string | null
  >(null)
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(
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

  function updateEditFormField(field: EditTextField, value: string) {
    setEditForm((currentEditForm) => {
      if (!currentEditForm) {
        return currentEditForm
      }

      return {
        ...currentEditForm,
        [field]: value,
      }
    })
  }

  function updateEditFormStatus(value: string) {
    if (!isWatchPartyStatus(value)) {
      return
    }

    setEditForm((currentEditForm) => {
      if (!currentEditForm) {
        return currentEditForm
      }

      return {
        ...currentEditForm,
        status: value,
      }
    })
  }

  function startEditing(watchParty: WatchParty) {
    setEditForm({
      id: watchParty.id,
      title: watchParty.title,
      description: watchParty.description ?? '',
      scheduledAt: toDatetimeLocalInputValue(watchParty.scheduledAt),
      genre: watchParty.genre,
      maxParticipants: String(watchParty.maxParticipants),
      status: watchParty.status,
    })
    setUpdateErrorMessage(null)
  }

  function cancelEditing() {
    setEditForm(null)
    setUpdateErrorMessage(null)
  }

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

  async function handleUpdateSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!editForm) {
      return
    }

    setUpdateErrorMessage(null)

    const trimmedTitle = editForm.title.trim()
    const trimmedDescription = editForm.description.trim()
    const trimmedGenre = editForm.genre.trim()
    const parsedMaxParticipants = Number(editForm.maxParticipants)

    if (
      trimmedTitle === '' ||
      editForm.scheduledAt === '' ||
      trimmedGenre === '' ||
      editForm.maxParticipants.trim() === ''
    ) {
      setUpdateErrorMessage(
        'Enter a title, scheduled date and time, genre, and maximum participants.',
      )
      return
    }

    if (
      !Number.isFinite(parsedMaxParticipants) ||
      !Number.isInteger(parsedMaxParticipants) ||
      parsedMaxParticipants <= 0
    ) {
      setUpdateErrorMessage('Maximum participants must be a positive whole number.')
      return
    }

    if (!isWatchPartyStatus(editForm.status)) {
      setUpdateErrorMessage('Choose a valid watch party status.')
      return
    }

    const scheduledAtDate = new Date(editForm.scheduledAt)

    if (Number.isNaN(scheduledAtDate.getTime())) {
      setUpdateErrorMessage('Enter a valid scheduled date and time.')
      return
    }

    const request: UpdateWatchPartyRequest = {
      title: trimmedTitle,
      scheduledAt: scheduledAtDate.toISOString(),
      genre: trimmedGenre,
      maxParticipants: parsedMaxParticipants,
      status: editForm.status,
    }

    if (trimmedDescription !== '') {
      request.description = trimmedDescription
    }

    setIsUpdating(true)

    try {
      const updatedWatchParty = await updateWatchParty(editForm.id, request)

      setWatchParties((currentWatchParties) =>
        currentWatchParties.map((watchParty) =>
          watchParty.id === updatedWatchParty.id ? updatedWatchParty : watchParty,
        ),
      )
      setEditForm(null)
    } catch {
      setUpdateErrorMessage(
        'Failed to update the watch party. Check the details and try again.',
      )
    } finally {
      setIsUpdating(false)
    }
  }

  async function handleDeleteClick(watchParty: WatchParty) {
    setDeleteErrorMessage(null)

    const confirmed = window.confirm(
      `Delete "${watchParty.title}"? This cannot be undone.`,
    )

    if (!confirmed) {
      return
    }

    setDeletingWatchPartyId(watchParty.id)

    try {
      await deleteWatchParty(watchParty.id)

      setWatchParties((currentWatchParties) =>
        currentWatchParties.filter(
          (currentWatchParty) => currentWatchParty.id !== watchParty.id,
        ),
      )

      if (editForm?.id === watchParty.id) {
        setEditForm(null)
        setUpdateErrorMessage(null)
      }
    } catch {
      setDeleteErrorMessage(
        'Failed to delete the watch party. Refresh the list and try again.',
      )
    } finally {
      setDeletingWatchPartyId(null)
    }
  }

  return (
    <main className="app-shell">
      <section className="hero" aria-labelledby="page-title">
        <p className="eyebrow">WatchParty management</p>
        <h1 id="page-title">StreamParty Planner</h1>
        <p className="intro">
          Create, browse, update, and delete watch parties backed by the API.
        </p>
        <p className="supporting">
          This phase keeps the local list in sync after successful create,
          update, and delete requests.
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

        {!isLoading && !errorMessage && deleteErrorMessage && (
          <p className="state-message state-message--error" role="alert">
            {deleteErrorMessage}
          </p>
        )}

        {!isLoading && !errorMessage && watchParties.length === 0 && (
          <p className="state-message">
            No watch parties have been created yet.
          </p>
        )}

        {!isLoading && !errorMessage && watchParties.length > 0 && (
          <ul className="watch-party-list">
            {watchParties.map((watchParty) => {
              const isEditing = editForm?.id === watchParty.id
              const isDeleting = deletingWatchPartyId === watchParty.id
              const areActionsDisabled = isUpdating || deletingWatchPartyId !== null

              return (
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

                    <dl className="watch-party-card__details">
                      <div>
                        <dt>Genre</dt>
                        <dd>{watchParty.genre}</dd>
                      </div>
                      <div>
                        <dt>Maximum participants</dt>
                        <dd>{watchParty.maxParticipants}</dd>
                      </div>
                    </dl>

                    <div className="watch-party-card__actions">
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => startEditing(watchParty)}
                        disabled={areActionsDisabled || isEditing}
                      >
                        {isEditing ? 'Editing' : 'Edit'}
                      </button>
                      <button
                        type="button"
                        className="danger-button"
                        onClick={() => void handleDeleteClick(watchParty)}
                        disabled={areActionsDisabled}
                      >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </article>

                  {isEditing && editForm && (
                    <form className="edit-form" onSubmit={handleUpdateSubmit}>
                      <h4>Edit watch party</h4>

                      <div className="form-field">
                        <label htmlFor={`edit-watch-party-title-${watchParty.id}`}>
                          Title
                        </label>
                        <input
                          id={`edit-watch-party-title-${watchParty.id}`}
                          type="text"
                          value={editForm.title}
                          onChange={(event) =>
                            updateEditFormField('title', event.target.value)
                          }
                          maxLength={120}
                          required
                        />
                      </div>

                      <div className="form-field">
                        <label
                          htmlFor={`edit-watch-party-description-${watchParty.id}`}
                        >
                          Description
                        </label>
                        <textarea
                          id={`edit-watch-party-description-${watchParty.id}`}
                          value={editForm.description}
                          onChange={(event) =>
                            updateEditFormField('description', event.target.value)
                          }
                          maxLength={1000}
                          rows={4}
                        />
                      </div>

                      <div className="form-field">
                        <label
                          htmlFor={`edit-watch-party-scheduled-at-${watchParty.id}`}
                        >
                          Scheduled date and time
                        </label>
                        <input
                          id={`edit-watch-party-scheduled-at-${watchParty.id}`}
                          type="datetime-local"
                          value={editForm.scheduledAt}
                          onChange={(event) =>
                            updateEditFormField('scheduledAt', event.target.value)
                          }
                          required
                        />
                      </div>

                      <div className="form-field">
                        <label htmlFor={`edit-watch-party-genre-${watchParty.id}`}>
                          Genre
                        </label>
                        <input
                          id={`edit-watch-party-genre-${watchParty.id}`}
                          type="text"
                          value={editForm.genre}
                          onChange={(event) =>
                            updateEditFormField('genre', event.target.value)
                          }
                          maxLength={80}
                          required
                        />
                      </div>

                      <div className="form-field">
                        <label
                          htmlFor={`edit-watch-party-max-participants-${watchParty.id}`}
                        >
                          Maximum participants
                        </label>
                        <input
                          id={`edit-watch-party-max-participants-${watchParty.id}`}
                          type="number"
                          value={editForm.maxParticipants}
                          onChange={(event) =>
                            updateEditFormField(
                              'maxParticipants',
                              event.target.value,
                            )
                          }
                          min={1}
                          step={1}
                          required
                        />
                      </div>

                      <div className="form-field">
                        <label htmlFor={`edit-watch-party-status-${watchParty.id}`}>
                          Status
                        </label>
                        <select
                          id={`edit-watch-party-status-${watchParty.id}`}
                          value={editForm.status}
                          onChange={(event) =>
                            updateEditFormStatus(event.target.value)
                          }
                          required
                        >
                          {WATCH_PARTY_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </div>

                      {updateErrorMessage && (
                        <p
                          className="state-message state-message--error"
                          role="alert"
                        >
                          {updateErrorMessage}
                        </p>
                      )}

                      <div className="form-actions">
                        <button type="submit" disabled={isUpdating}>
                          {isUpdating ? 'Saving...' : 'Save changes'}
                        </button>
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={cancelEditing}
                          disabled={isUpdating}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </main>
  )
}

export default App
