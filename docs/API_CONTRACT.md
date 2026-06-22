# API Contract

This document describes the StreamParty Planner backend API implemented through Phase 8.

The backend currently exposes a WatchParty CRUD API baseline only. There is no frontend, authentication, authorization, pagination, sorting or filtering yet.

## Watch Parties

### Create Watch Party

`POST /api/watch-parties`

Creates a watch party with status `PLANNED`.

Request body:

```json
{
  "title": "Saturday sci-fi stream",
  "description": "Watching a classic together",
  "scheduledAt": "2030-07-01T18:30:00Z",
  "genre": "Sci-Fi",
  "maxParticipants": 8
}
```

Successful response:

`201 Created`

The response includes a `Location` header pointing to the created resource.

```json
{
  "id": "3f7f9dd6-4f6a-4b7b-a7ec-9102567ff8ad",
  "title": "Saturday sci-fi stream",
  "description": "Watching a classic together",
  "scheduledAt": "2030-07-01T18:30:00Z",
  "genre": "Sci-Fi",
  "maxParticipants": 8,
  "status": "PLANNED",
  "createdAt": "2026-06-21T10:15:30Z",
  "updatedAt": "2026-06-21T10:15:30Z"
}
```

### List Watch Parties

`GET /api/watch-parties`

Returns all watch parties. Pagination, sorting and filtering are not implemented yet.

Successful response:

`200 OK`

```json
[
  {
    "id": "3f7f9dd6-4f6a-4b7b-a7ec-9102567ff8ad",
    "title": "Saturday sci-fi stream",
    "description": "Watching a classic together",
    "scheduledAt": "2030-07-01T18:30:00Z",
    "genre": "Sci-Fi",
    "maxParticipants": 8,
    "status": "PLANNED",
    "createdAt": "2026-06-21T10:15:30Z",
    "updatedAt": "2026-06-21T10:15:30Z"
  }
]
```

### Get Watch Party

`GET /api/watch-parties/{id}`

Returns one watch party by UUID.

Successful response:

`200 OK`

```json
{
  "id": "3f7f9dd6-4f6a-4b7b-a7ec-9102567ff8ad",
  "title": "Saturday sci-fi stream",
  "description": "Watching a classic together",
  "scheduledAt": "2030-07-01T18:30:00Z",
  "genre": "Sci-Fi",
  "maxParticipants": 8,
  "status": "PLANNED",
  "createdAt": "2026-06-21T10:15:30Z",
  "updatedAt": "2026-06-21T10:15:30Z"
}
```

If the watch party does not exist, the API returns `404 Not Found` with a ProblemDetail-style response.

### Update Watch Party

`PUT /api/watch-parties/{id}`

Fully updates the mutable fields of an existing watch party by UUID. The resource id comes from the path. The request body does not accept `id`, `createdAt` or `updatedAt`.

Request body:

```json
{
  "title": "Updated sci-fi stream",
  "description": "Updated description",
  "scheduledAt": "2030-08-01T20:00:00Z",
  "genre": "Sci-Fi",
  "maxParticipants": 10,
  "status": "LIVE"
}
```

Successful response:

`200 OK`

```json
{
  "id": "3f7f9dd6-4f6a-4b7b-a7ec-9102567ff8ad",
  "title": "Updated sci-fi stream",
  "description": "Updated description",
  "scheduledAt": "2030-08-01T20:00:00Z",
  "genre": "Sci-Fi",
  "maxParticipants": 10,
  "status": "LIVE",
  "createdAt": "2026-06-21T10:15:30Z",
  "updatedAt": "2026-06-22T10:15:30Z"
}
```

If the request body fails validation, contains invalid JSON or contains an invalid enum value, the API returns `400 Bad Request` with a ProblemDetail-style response.

If the watch party does not exist, the API returns `404 Not Found` with a ProblemDetail-style response.

### Delete Watch Party

`DELETE /api/watch-parties/{id}`

Hard deletes one watch party by UUID.

Successful response:

`204 No Content`

The response body is empty.

If the watch party does not exist, the API returns `404 Not Found` with a ProblemDetail-style response.

## Validation

Create and full update requests are validated with these rules:

- `title` is required and must be at most 120 characters.
- `description` is optional and must be at most 1000 characters.
- `scheduledAt` is required and must be in the present or future.
- `genre` is required and must be at most 80 characters.
- `maxParticipants` must be positive.
- `status` is required for update requests.

Validation failures return `400 Bad Request` with a ProblemDetail-style response and field error details.

Example:

```json
{
  "type": "about:blank",
  "title": "Validation failed",
  "status": 400,
  "detail": "Request validation failed. Check fieldErrors for details.",
  "fieldErrors": [
    {
      "field": "title",
      "message": "must not be blank"
    }
  ]
}
```

## Planned Later

Potential future endpoint:

- `PATCH /api/watch-parties/{id}`
