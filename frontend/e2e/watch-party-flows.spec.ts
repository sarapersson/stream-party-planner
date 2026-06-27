/// <reference types="node" />

import {
  expect,
  test,
  type APIRequestContext,
  type APIResponse,
  type Page,
} from '@playwright/test'

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

const apiBaseUrl = process.env.E2E_API_BASE_URL ?? 'http://127.0.0.1:8080'
const runPrefix = `E2E Playwright ${Date.now()} ${Math.random()
  .toString(36)
  .slice(2, 8)}`

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

function watchPartyCard(page: Page, title: string) {
  return page.getByRole('listitem').filter({
    has: page.getByRole('heading', {
      name: title,
      exact: true,
    }),
  })
}

async function expectApiOk(response: APIResponse, action: string) {
  if (response.ok()) {
    return
  }

  const body = await response.text()

  throw new Error(
    `${action} failed with ${response.status()} ${response.statusText()}: ${body}`,
  )
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

  await expectApiOk(response, 'Create watch party')

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
    const deleteResponse = await request.delete(
      `${apiBaseUrl}/api/watch-parties/${watchParty.id}`,
    )

    if (!deleteResponse.ok() && deleteResponse.status() !== 404) {
      await expectApiOk(deleteResponse, `Clean up watch party ${watchParty.id}`)
    }
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
  await expect(
    page.getByRole('heading', { name: title, exact: true }),
  ).toBeVisible()
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

  await expect(
    page.getByRole('heading', { name: title, exact: true }),
  ).toBeVisible()
})

test('deletes a watch party through the UI', async ({ page, request }) => {
  const title = uniqueTitle('delete')

  await createWatchParty(request, { title })

  await page.goto('/')

  const card = watchPartyCard(page, title)

  await expect(card).toBeVisible()

  page.once('dialog', async (dialog) => {
    expect(dialog.message()).toContain(title)
    await dialog.accept()
  })

  await card.getByRole('button', { name: 'Delete' }).click()

  await expect(
    page.getByRole('heading', { name: title, exact: true }),
  ).toHaveCount(0)
})

test('updates a watch party through the UI', async ({ page, request }) => {
  const initialTitle = uniqueTitle('before edit')
  const updatedTitle = uniqueTitle('after edit')
  const updatedDescription = 'Updated through the Playwright E2E update flow.'

  await createWatchParty(request, {
    title: initialTitle,
    genre: 'Drama',
    maxParticipants: 8,
  })

  await page.goto('/')

  const initialCard = watchPartyCard(page, initialTitle)

  await expect(initialCard).toBeVisible()

  await initialCard.getByRole('button', { name: 'Edit' }).click()

  const editForm = initialCard.locator('form.edit-form')

  await expect(editForm).toBeVisible()

  await editForm.getByLabel('Title').fill(updatedTitle)
  await editForm.getByLabel('Description').fill(updatedDescription)
  await editForm
    .getByLabel('Scheduled date and time')
    .fill(futureDatetimeLocalValue(9))
  await editForm.getByLabel('Genre').fill('Thriller')
  await editForm.getByLabel('Maximum participants').fill('12')
  await editForm.getByLabel('Status').selectOption('LIVE')

  await editForm.getByRole('button', { name: 'Save changes' }).click()

  const updatedCard = watchPartyCard(page, updatedTitle)

  await expect(updatedCard).toBeVisible()
  await expect(updatedCard.getByText(updatedDescription)).toBeVisible()
  await expect(updatedCard.getByText('LIVE', { exact: true })).toBeVisible()
  await expect(updatedCard.getByText('Thriller', { exact: true })).toBeVisible()
  await expect(updatedCard.getByText('12', { exact: true })).toBeVisible()
  await expect(
    page.getByRole('heading', { name: initialTitle, exact: true }),
  ).toHaveCount(0)
})

test('cancels editing without saving changes', async ({ page, request }) => {
  const initialTitle = uniqueTitle('cancel edit')
  const unsavedTitle = uniqueTitle('unsaved edit')

  await createWatchParty(request, { title: initialTitle })

  await page.goto('/')

  const card = watchPartyCard(page, initialTitle)

  await expect(card).toBeVisible()

  await card.getByRole('button', { name: 'Edit' }).click()

  const editForm = card.locator('form.edit-form')

  await expect(editForm).toBeVisible()

  await editForm.getByLabel('Title').fill(unsavedTitle)
  await editForm.getByLabel('Genre').fill('Unsaved genre')
  await editForm.getByRole('button', { name: 'Cancel' }).click()

  await expect(
    page.getByRole('heading', { name: initialTitle, exact: true }),
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { name: unsavedTitle, exact: true }),
  ).toHaveCount(0)
  await expect(card.locator('form.edit-form')).toHaveCount(0)
})

test('keeps a watch party when delete confirmation is dismissed', async ({
  page,
  request,
}) => {
  const title = uniqueTitle('dismiss delete')

  await createWatchParty(request, { title })

  await page.goto('/')

  const card = watchPartyCard(page, title)

  await expect(card).toBeVisible()

  page.once('dialog', async (dialog) => {
    expect(dialog.message()).toContain(title)
    await dialog.dismiss()
  })

  await card.getByRole('button', { name: 'Delete' }).click()

  await expect(
    page.getByRole('heading', { name: title, exact: true }),
  ).toBeVisible()
})
