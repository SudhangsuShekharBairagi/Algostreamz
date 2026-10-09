# Profile API

All endpoints are relative to `VITE_API_BASE_URL` (default `/api`) and require
`Authorization: Bearer <token>`. The authenticated user is always resolved from the JWT
principal; request bodies cannot select an account. Errors use the shared envelope
documented in [auth-api.md](auth-api.md).

The profile response reuses the auth `UserResponse` DTO. It contains `id`, `email`,
`emailVerified`, `displayName`, `bio`, `avatarUrl`, `college`, `studyYear`, `location`, and
`createdAt`. Password hashes and OTP information are never returned. Email is read-only.

## Endpoints

| Method   | Path                | Purpose                                             |
| -------- | ------------------- | --------------------------------------------------- |
| `GET`    | `/profile`          | Read the authenticated user's profile               |
| `PUT`    | `/profile`          | Replace editable profile fields                     |
| `PUT`    | `/profile/password` | Change password after current-password verification |
| `DELETE` | `/profile`          | Delete the account after password confirmation      |

### Update profile

`PUT /profile` accepts nullable fields. Omitted profile information may be sent as `null`.
`displayName` is limited to 80 characters, `bio` to 500, `avatarUrl` to 2048 (HTTP or
HTTPS URLs only), `college` and `location` to 120 each, and `studyYear` to an integer from
1 through 12.

```json
{
  "displayName": "Ada Lovelace",
  "bio": "Learning algorithms",
  "avatarUrl": "https://example.com/avatar.png",
  "college": "Analytical Engine Institute",
  "studyYear": 2,
  "location": "London"
}
```

The response is the updated profile DTO. Email and account identifiers are not editable.
Profile columns are added through the project's existing Hibernate
`spring.jpa.hibernate.ddl-auto=update` schema management.

### Change password

`PUT /profile/password` requires the current password and matching new-password fields.
New passwords must be 8–72 characters and are hashed using the auth password encoder.
Success returns `204 No Content`.

```json
{
  "currentPassword": "old-password",
  "newPassword": "new-password",
  "confirmPassword": "new-password"
}
```

An incorrect current password returns `401`; a mismatch between the new password and its
confirmation returns `400`.

### Delete account

`DELETE /profile` accepts `{ "password": "current-password" }`. Success returns
`204 No Content`, deletes the authenticated user's account and invalidates outstanding
OTP rows for that email. A wrong password returns `401`.

## Progress tracking

All progress endpoints require the authenticated user's bearer token. The user is derived
from the JWT principal; clients cannot select an account. Completing an already-recorded
item is idempotent.

| Method | Path | Purpose |
| ------ | ---- | ------- |
| `GET` | `/progress` | Return completed visualizer and mastered challenge IDs |
| `POST` | `/progress/visualizer/{algorithmId}` | Record a completed visualizer |
| `POST` | `/progress/challenge` | Record a mastered challenge |

`GET /progress` returns:

```json
{
  "completedVisualizers": ["bubble-sort"],
  "masteredChallenges": ["merge-step-1"]
}
```

`POST /progress/visualizer/{algorithmId}` and `POST /progress/challenge` return
`204 No Content`. The challenge request body is `{ "challengeId": "merge-step-1" }`.
Unauthenticated calls return `401`; an empty or overlong challenge ID returns `400`.
Anonymous visualizer completions are retained in browser storage and synchronized when the
user signs in.

The quiz client submits each correctly answered challenge through
`POST /progress/challenge` after the quiz is finished. Incorrect answers remain part of the
client-side score and are not recorded as mastered progress; the progress API tracks mastered
challenge IDs rather than numeric quiz scores.
