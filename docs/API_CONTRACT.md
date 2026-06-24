# API Contract

This document describes the current StreamParty Planner backend HTTP API.

The API is consumed by the React frontend and by the Postman/Newman verification collection.

This document describes implemented behavior only.

## Base URL

For local development, the backend runs at:

```text
http://localhost:8080
```

## Conventions

* Request and response bodies use JSON.
* Resource identifiers are UUID strings.
* Date and time values use ISO-8601 timestamps.
* API errors use ProblemDetail-style JSON responses.
* Authentication and authorization are not implemented in the current baseline.
* Pagination, sorting and filtering are not implemented in the current baseline.

## Operational Endpoint

### Health Check

```http
GET /actuator/health
```

Returns the current application health status.

Successful response:

```http
200 OK
```

Example response:

```json
{
  "groups": [
    "liveness",
    "readiness"
  ],
  "status": "UP"
}
```

## WatchParty Resource

### Fields

| Field             | Type               | Description                            |
| ----------------- | ------------------ | -------------------------------------- |
| `id`              | UUID string        | Server-generated resource identifier   |
| `title`           | string             | Watch party title                      |
| `description`     | string or `null`   | Optional watch party description       |
| `scheduledAt`     | ISO-8601 timestamp | Scheduled date and time                |
| `genre`           | string             | Free-text genre                        |
| `maxParticipants` | number             | Maximum number of participants         |
| `status`          | string             | Current watch party status             |
| `createdAt`       | ISO-8601 timestamp | Server-generated creation timestamp    |
| `updatedAt`       | ISO-8601 timestamp | Server-generated last update timestamp |

Supported status values:

```text
PLANNED
LIVE
FINISHED
CANCELLED
```

## WatchParty Endpoints

| Method   | Endpoint                  | Description                |
| -------- | ------------------------- | -------------------------- |
| `POST`   | `/api/watch-parties`      | Create a watch party       |
| `GET`    | `/api/watch-parties`      | List watch parties         |
| `GET`    | `/api/watch-parties/{id}` | Get one watch party        |
| `PUT`    | `/api/watch-parties/{id}` | Fully update a watch party |
| `DELETE` | `/api/watch-parties/{id}` | Delete a watch party       |

## Create Watch Party

```http
POST /api/watch-parties
```

Creates a watch party with status `PLANNED`.

The request body does not accept `id`, `status`, `createdAt` or `updatedAt`.

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

```http
201 Created
```

The response includes a `Location` header pointing to the created resource.

Example response:

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

## List Watch Parties

```http
GET /api/watch-parties
```

Returns all watch parties.

Pagination, sorting and filtering are not implemented in the current baseline.

Successful response:

```http
200 OK
```

Example response:

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

## Get Watch Party

```http
GET /api/watch-parties/{id}
```

Returns one watch party by UUID.

Successful response:

```http
200 OK
```

Example response:

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

If the watch party does not exist, the API returns:

```http
404 Not Found
```

## Update Watch Party

```http
PUT /api/watch-parties/{id}
```

Fully updates the mutable fields of an existing watch party by UUID.

The resource id comes from the path.

The request body does not accept `id`, `createdAt` or `updatedAt`.

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

```http
200 OK
```

Example response:

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

If the watch party does not exist, the API returns:

```http
404 Not Found
```

If the request body fails validation, contains malformed JSON or contains an invalid enum value, the API returns:

```http
400 Bad Request
```

## Delete Watch Party

```http
DELETE /api/watch-parties/{id}
```

Hard deletes one watch party by UUID.

Successful response:

```http
204 No Content
```

The response body is empty.

If the watch party does not exist, the API returns:

```http
404 Not Found
```

## Validation Rules

Create and full update requests are validated with these rules:

| Field             | Create       | Update   | Rule                                                 |
| ----------------- | ------------ | -------- | ---------------------------------------------------- |
| `title`           | Required     | Required | Must not be blank and must be at most 120 characters |
| `description`     | Optional     | Optional | Must be at most 1000 characters when provided        |
| `scheduledAt`     | Required     | Required | Must be present or future                            |
| `genre`           | Required     | Required | Must not be blank and must be at most 80 characters  |
| `maxParticipants` | Required     | Required | Must be positive                                     |
| `status`          | Not accepted | Required | Must be one of the supported status values           |

Validation failures return:

```http
400 Bad Request
```

Validation error example:

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

## Error Responses

The API uses ProblemDetail-style error responses for validation errors, malformed request bodies, invalid enum values and missing resources.

Common error status codes:

| Status            | Meaning                                                  |
| ----------------- | -------------------------------------------------------- |
| `400 Bad Request` | Validation failure, malformed JSON or invalid enum value |
| `404 Not Found`   | Requested WatchParty resource does not exist             |

ProblemDetail-style responses include standard fields such as:

| Field    | Description                 |
| -------- | --------------------------- |
| `type`   | Problem type URI            |
| `title`  | Short error summary         |
| `status` | HTTP status code            |
| `detail` | Human-readable error detail |

Validation errors also include `fieldErrors`.

## Example curl Commands

Create a watch party:

```bash
curl -X POST http://localhost:8080/api/watch-parties \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Friday Movie Night",
    "description": "A shared stream party for friends.",
    "scheduledAt": "2030-07-01T19:30:00Z",
    "genre": "Comedy",
    "maxParticipants": 8
  }'
```

List watch parties:

```bash
curl http://localhost:8080/api/watch-parties
```

Get one watch party:

```bash
curl http://localhost:8080/api/watch-parties/{id}
```

Update a watch party:

```bash
curl -X PUT http://localhost:8080/api/watch-parties/{id} \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Movie Night",
    "description": "Updated description.",
    "scheduledAt": "2030-07-02T19:30:00Z",
    "genre": "Drama",
    "maxParticipants": 10,
    "status": "PLANNED"
  }'
```

Delete a watch party:

```bash
curl -X DELETE http://localhost:8080/api/watch-parties/{id}
```

## Out of Scope

The following features are not implemented in the current baseline:

* Authentication
* Authorization
* Pagination
* Sorting
* Filtering
* Partial updates with `PATCH`
* Machine-readable OpenAPI documentation
* Deployment-specific API behavior
