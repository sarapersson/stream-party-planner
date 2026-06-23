import { expect, test, type APIRequestContext } from '@playwright/test'

type WatchParty = {
  id: string
  title: string
  description: string | null
  scheduledAt: string
  genre: string
  maxParticipants: number
  status: 'PLANNED' | 'LIVE' | 'FINISHED' | 'CANCELLED'
  createdAt: string
  updatedAt: string
}

type CreateWatchPartyRequest = {
  title: string
  description?: string
  scheduledAt: string
  genre: string
  maxParticipants: number
}

const apiBaseUrl = process.env.E2E_API_BASE_URL ?? 'http://localhost:8080'
const runPrefix = `E2E Playwright ${Date.now()}`

function uniqueTitle(flowName: string) {
  return `${runPrefix} ${flowName}`
}

function futureIsoTimestamp(daysFromNow: number) {
  const date = new Date()
  date.setDate(date.getDate() + daysFromNow)
  date.setHours(19, 30, 0, 0)
  return date.toISOString()
}

function futureDatetimeLocalValue(daysFromNow: number) {
  const date = new Date()
  date.setDate(date.getDate() + daysFromNow)
  date.setHours(19, 30, 0, 0)

  const timezoneOffsetMs = date.getTimezoneOffset() * 60_000

  return new Date(date.getTime() - timezoneOffsetMs).toISOString().slice(0, 16)
}

async function createWatchParty(
  request: APIRequestContext,
  overrides: Partial<CreateWatchPartyRequest> = {},
) {
  const title = overrides.title ?? uniqueTitle('setup')

  const response = await request.post(`${apiBaseUrl}/api/watch-parties`, {
    data: {
      title,
      description: overrides.description ?? 'Created by Playwright E2E setup.',
      scheduledAt: overrides.scheduledAt ?? futureIsoTimestamp(7),
      genre: overrides.genre ?? 'Drama',
      maxParticipants: overrides.maxParticipants ?? 8,
    },
  })

  expect(response.ok()).toBeTruthy()

  return (await response.json()) as WatchParty
}

async function cleanupWatchParties(request: APIRequestContext) {
  const response = await request.get(`${apiBaseUrl}/api/watch-parties`)

  if (!response.ok()) {
    return
  }

  const watchParties = (await response.json()) as WatchParty[]
  const testWatchParties = watchParties.filter((watchParty) =>
    watchParty.title.startsWith(runPrefix),
  )

  for (const watchParty of testWatchParties) {
    await request.delete(`${apiBaseUrl}/api/watch-parties/${watchParty.id}`)
  }
}

test.afterEach(async ({ request }) => {
  await cleanupWatchParties(request)
})

test('displays watch parties from the API', async ({ page, request }) => {
  const title = uniqueTitle('display')
  await createWatchParty(request, { title })

  await page.goto('/')

  await expect(
    page.getByRole('heading', { name: 'StreamParty Planner' }),
  ).toBeVisible()
  await expect(page.getByRole('heading', { name: title })).toBeVisible()
})

test('creates a watch party through the UI', async ({ page }) => {
  const title = uniqueTitle('create')

  await page.goto('/')

  await page.getByLabel('Title').fill(title)
  await page
    .getByLabel('Description')
    .fill('Created through the Playwright E2E create flow.')
  await page
    .getByLabel('Scheduled date and time')
    .fill(futureDatetimeLocalValue(8))
  await page.getByLabel('Genre').fill('Comedy')
  await page.getByLabel('Maximum participants').fill('6')

  await page.getByRole('button', { name: 'Create watch party' }).click()

  await expect(page.getByRole('heading', { name: title })).toBeVisible()
})

test('deletes a watch party through the UI', async ({ page, request }) => {
  const title = uniqueTitle('delete')
  await createWatchParty(request, { title })

  await page.goto('/')

  const card = page.locator('article').filter({
    has: page.getByRole('heading', { name: title }),
  })

  await expect(card).toBeVisible()

  page.once('dialog', async (dialog) => {
    expect(dialog.message()).toContain(title)
    await dialog.accept()
  })

  await card.getByRole('button', { name: 'Delete' }).click()

  await expect(page.getByRole('heading', { name: title })).toHaveCount(0)
})
