export type WatchPartyStatus = 'PLANNED' | 'LIVE' | 'FINISHED' | 'CANCELLED'

export type WatchParty = {
  id: string
  title: string
  description: string | null
  scheduledAt: string
  genre: string
  maxParticipants: number
  status: WatchPartyStatus
  createdAt: string
  updatedAt: string
}

export type CreateWatchPartyRequest = {
  title: string
  description?: string
  scheduledAt: string
  genre: string
  maxParticipants: number
}

export type UpdateWatchPartyRequest = {
  title: string
  description?: string
  scheduledAt: string
  genre: string
  maxParticipants: number
  status: WatchPartyStatus
}

export async function listWatchParties(): Promise<WatchParty[]> {
  const response = await fetch('/api/watch-parties')

  if (!response.ok) {
    throw new Error('Failed to load watch parties.')
  }

  return response.json() as Promise<WatchParty[]>
}

export async function createWatchParty(
  request: CreateWatchPartyRequest,
): Promise<WatchParty> {
  const response = await fetch('/api/watch-parties', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    throw new Error('Failed to create watch party.')
  }

  return response.json() as Promise<WatchParty>
}

export async function updateWatchParty(
  id: string,
  request: UpdateWatchPartyRequest,
): Promise<WatchParty> {
  const response = await fetch(`/api/watch-parties/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    throw new Error('Failed to update watch party.')
  }

  return response.json() as Promise<WatchParty>
}

export async function deleteWatchParty(id: string): Promise<void> {
  const response = await fetch(`/api/watch-parties/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error('Failed to delete watch party.')
  }
}
