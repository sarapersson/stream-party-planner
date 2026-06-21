# API Contract

This document describes the StreamParty Planner backend API implemented in Phase 7.

The backend currently exposes a WatchParty API baseline only. There is no frontend, authentication, authorization, pagination, sorting, filtering, update or delete API yet.

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

## Validation

Create requests are validated with these rules:

- `title` is required and must be at most 120 characters.
- `description` is optional and must be at most 1000 characters.
- `scheduledAt` is required and must be in the present or future.
- `genre` is required and must be at most 80 characters.
- `maxParticipants` must be positive.

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

The following endpoints are not implemented yet:

- `PUT /api/watch-parties/{id}`
- `PATCH /api/watch-parties/{id}`
- `DELETE /api/watch-parties/{id}`
