# Email OTP authentication

Password + one-time-code auth for the Spring Boot backend, with the code delivered over
plain SMTP. Nothing in the code knows which mail provider it is talking to, so the same
build runs on any host and against any relay.

- [The flow](#the-flow)
- [API contract](#api-contract)
- [Errors](#errors)
- [What you have to configure](#what-you-have-to-configure)
- [Brevo setup](#brevo-setup)
- [Running it locally](#running-it-locally)
- [Deploying anywhere](#deploying-anywhere)
- [Design notes](#design-notes)

---

## The flow

```
register ──> 201 ──> "code on its way"      account exists, emailVerified = false
     │
     ├─ verify-email {code} ──> 200 + JWT   emailVerified = true, signed in
     ├─ login {password}     ──> 403        "verify your email first"
     └─ login {password}     ──> 200 + JWT   (after verification)

Already verified:
     ├─ login {password}     ──> 200 + JWT
     └─ otp/request ──> otp/verify {code} ──> 200 + JWT    (passwordless alternative)

Any endpoint ──> Authorization: Bearer <jwt>
```

There are two OTP purposes, stored separately and never interchangeable:
`EMAIL_VERIFICATION` (gates first sign-in) and `LOGIN` (passwordless sign-in).

---

## API contract

All paths are relative to `VITE_API_BASE_URL` (default `/api`).

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | – | Create account, email the verification code |
| `POST` | `/auth/verify-email` | – | Redeem the verification code, receive a session |
| `POST` | `/auth/resend-verification` | – | Re-send the verification code |
| `POST` | `/auth/login` | – | Email + password sign-in |
| `POST` | `/auth/otp/request` | – | Email a sign-in code |
| `POST` | `/auth/otp/verify` | – | Redeem a sign-in code, receive a session |
| `GET` | `/auth/me` | Bearer | Current user |
| `POST` | `/auth/logout` | Bearer | Sign out (client discards the token) |

### Requests

```jsonc
// POST /auth/register          password: 8-72 chars
{ "email": "you@example.com", "password": "correct-horse-battery" }

// POST /auth/verify-email      code: exactly 6 digits
{ "email": "you@example.com", "code": "417293" }

// POST /auth/resend-verification
{ "email": "you@example.com" }

// POST /auth/login
{ "email": "you@example.com", "password": "correct-horse-battery" }

// POST /auth/otp/request
{ "email": "you@example.com" }

// POST /auth/otp/verify        code: exactly 6 digits
{ "email": "you@example.com", "code": "830415" }
```

Emails are matched case-insensitively and stored lower-cased, so `Ada@Example.com` and
`ada@example.com` are the same account.

### Session response (`login`, `verify-email`, `otp/verify`)

```jsonc
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "tokenType": "Bearer",
  "expiresIn": 86400,          // seconds
  "user": {
    "id": 1,
    "email": "you@example.com",
    "emailVerified": true,
    "avatarUrl": null,
    "createdAt": "2026-09-30T07:20:30Z"
  }
}
```

`202 Accepted` responses (`register`, `resend-verification`, `otp/request`):

```jsonc
{ "message": "If that address needs a code, one is on its way." }
```

### Authenticated requests

```
Authorization: Bearer <token>
```

---

## Errors

Every failure, from every layer, returns the same envelope:

```jsonc
{
  "timestamp": "2026-09-30T07:20:30.844315Z",
  "status": 400,
  "error": "Bad Request",
  "message": "That code is not valid. 4 attempt(s) remaining.",
  "path": "/api/auth/verify-email",
  "fieldErrors": { "email": "email must be a valid address" }  // 400 only, else null
}
```

| Status | When |
| --- | --- |
| `400` | Validation failed, code wrong/expired/locked out, no active code |
| `401` | Wrong password, missing/invalid/expired token |
| `403` | Email not verified yet, account disabled |
| `404` | No such endpoint |
| `409` | Email already registered |
| `429` | Send cooldown, or per-hour send ceiling hit |
| `502` | The mail relay rejected the message — retry shortly |

---

## What you have to configure

Copy `backend/.env.example` to `backend/.env`. Five things are genuinely required:

| Variable | Notes |
| --- | --- |
| `DATABASE_URL` *or* `SPRING_DATASOURCE_URL` + `_USERNAME` + `_PASSWORD` | All PaaS Postgres add-ons inject `DATABASE_URL`; the app parses it |
| `MAIL_HOST`, `MAIL_USERNAME`, `MAIL_PASSWORD` | SMTP relay |
| `MAIL_FROM_EMAIL` | Must be **verified with your provider** |
| `JWT_SECRET` | `openssl rand -base64 48`; startup fails if absent or under 32 bytes |
| `CORS_ALLOWED_ORIGINS` | Your frontend origin, comma separated for several |

Everything else has a working default. See `backend/.env.example` for the full annotated list.

**The app refuses to boot without `MAIL_FROM_EMAIL` or with a bad `JWT_SECRET`,** failing
with a message naming the variable. That is deliberate: since email *is* the auth
mechanism, starting into a state where every login fails is worse than not starting.

**JWT_SECRET and OTP_PEPPER.** The OTP pepper defaults to `JWT_SECRET`, so there is nothing
extra to set. Set it separately if you want to rotate OTP hashing without touching sessions.
Changing either invalidates all outstanding codes.

---

## Brevo setup

Brevo (formerly Sendinblue) free tier: 300 emails/day.

1. **Create the account** at brevo.com, then confirm your email address.
2. **Verify the sender.** Brevo -> *Senders & Domains* -> *Email* -> *Add a new email*.
   Verify an address on a domain you control (SPF/DKIM are added for you).
   **This is the step people miss.** An unverified sender makes Brevo silently discard the
   message — the API returns success, nothing arrives, and you will debug the wrong thing.
3. **SMTP & API** -> *SMTP* -> *Generate a new SMTP key*.
   - `MAIL_USERNAME` is the generated **login** (looks like `xsmtpsib-...`), *not* your account email.
   - `MAIL_PASSWORD` is the **SMTP key**, *not* your account password.
4. Copy `.env.example` to `.env` and fill it in with those values plus `MAIL_FROM_EMAIL`
   from step 2.
5. Confirm your domain in Brevo (*Senders & Domains* -> *Domains*) so the SPF record is
   published. Without it, deliverability to Gmail and Outlook is poor.

**Watch the daily ceiling.** Brevo suspends accounts that exceed their quota, which would
take email login down entirely. The per-hour limits above (5 per address, 20 per IP) are
what keep a signup script from getting you there.

**Switching provider later** — Gmail, SES, Postmark — is a variable change only:

```properties
# Gmail (needs a 2FA app password, and will be locked out if Google flags it)
MAIL_HOST=smtp.gmail.com        MAIL_USERNAME=<your gmail address>
                               MAIL_PASSWORD=<16-char app password>

# Amazon SES
MAIL_HOST=email-smtp.us-east-1.amazonaws.com
MAIL_PORT=587
```

---

## Running it locally

The repo now ships a Maven wrapper, so no local Maven install is needed.

```bash
# backend
cd backend
cp .env.example .env          # then edit it
setx JWT_SECRET "<paste something long>"
./mvnw spring-boot:run        # Windows: .\mvnw.cmd spring-boot:run
```

Spring does not read `.env` on its own. Either export the variables in your shell, or run
from an IDE with them in the run configuration. No `.env` loader was added on purpose —
adding a dependency that reads secrets from a file in production tends to go wrong.

```bash
# frontend, in a second terminal
cd frontend
cp .env.example .env
npm install
npm run dev
```

Check it end to end with `curl`:

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"correct-horse-battery"}'

# then use the code from your inbox
curl -X POST http://localhost:8080/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","code":"123456"}'
```

`./mvnw test` runs 12 integration tests against H2 with a mocked mail sender — no Postgres
or SMTP credentials needed, so it works in CI as-is.

---

## Deploying anywhere

The backend is a stateless HTTP service, so any container host works. `PORT` and
`DATABASE_URL` are honoured because every provider injects them.

**Docker (works on Render, Railway, Fly.io, and any VPS):**

```bash
cd backend
docker build -t dsaviz-api .
docker run -p 8080:8080 --env-file .env dsaviz-api
```

**Health check:** `GET /actuator/health` → `{"status":"UP"}`. Point your platform's health
check at it.

**On Render / Railway / Fly:**

| Setting | Value |
| --- | --- |
| Build | Dockerfile in `backend/` (or root directory = `backend`) |
| Health check path | `/actuator/health` |
| Database | Add the provider's Postgres — `DATABASE_URL` appears automatically |
| Frontend | Static build, or Vercel/Netlify with `VITE_API_BASE_URL` |

**Also configured for you, so no platform-specific setup is needed:**

- `server.port=${PORT:8080}` and `server.forward-headers-strategy=framework`, so the app
  binds correctly behind a proxy and `getRemoteAddr()` is the real client.
- `DATABASE_URL` / `JDBC_DATABASE_URL` / `POSTGRES_URL` are parsed automatically, so the
  three-platform Postgres convention works without code changes.
- Cloudinary is optional — the bean only registers when `CLOUDINARY_URL` is non-empty, so a
  deploy with no image uploads still boots.

**Before going live:**

1. Set a real `JWT_SECRET`. Do not deploy with a guess.
2. Set `CORS_ALLOWED_ORIGINS` to your actual frontend origin. Never leave it `*`.
3. Set `APP_URL` so the email links point at production.
4. Run the app over HTTPS — the platform terminates TLS and the forwarded-headers setting
   handles the redirect.

---

## Design notes

Why the code looks the way it does, in case you extend it.

**Codes are never stored.** `otp_codes.code_hash` holds a peppered SHA-256 digest, so a
database leak cannot be replayed as a login. Only the code that was emailed exists in
plaintext, and only briefly.

**Wrong guesses are counted, and the count survives.** `OtpCodeService.verify` is
`@Transactional(noRollbackFor = BadRequestException.class)`, and `AuthService` is
deliberately *not* transactional. If either were the other way round, throwing would roll
the attempt counter back and the 6-digit space would stay brute-forceable. After 5 wrong
guesses the code is consumed and the legitimate user has to request a new one.

**Issuing a new code burns the old one.** The previous code is marked consumed *before* the
new one is emailed, so only the newest email can ever be redeemed.

**Anti-enumeration.** `resend-verification` and `otp/request` return `202` with an identical
message whether the address exists, is already verified, or has never been seen — otherwise
those endpoints become a way to test which emails are registered. `/login` returns a
byte-identical body for an unknown email and a wrong password, and hashes a decoy bcrypt
value in the unknown-email case so response timing does not leak it either. There is a test
asserting exactly this.

**Registration is atomic.** The user row and the code are written in one transaction that
also sends the email. If the relay rejects the message, the whole registration rolls back,
so nobody ends up with an account they can never verify.

**CSRF is disabled deliberately.** There are no cookies or sessions; the JWT arrives in an
`Authorization` header, which browsers do not send ambiently. That is the property CSRF
tokens exist to protect, so disabling the check is correct here rather than a shortcut.

**`/api/auth/**` is *not* blanket-permitted.** Each public endpoint is listed by name in
`SecurityConfig`, because a wildcard would also expose `/auth/me` and `/auth/logout`.

### Known limitations

- **Logout does not revoke.** Tokens are stateless, so `/auth/logout` is a no-op on the
  server and the client just discards the token. A stolen token stays valid until it
  expires. Add a `jti` denylist in Redis if you need real revocation.
- **The token is in `localStorage`**, which any script on the page can read — an XSS bug
  becomes a session-theft bug. It is isolated in `frontend/src/services/tokenStore.js`, so
  moving to httpOnly cookies is a change to one file.
- **`spring.jpa.hibernate.ddl-auto=update`** is fine for a prototype but has no migration
  history and no rollback. Adopt Flyway before the schema stops changing daily.
- **Rate limits are per-instance.** They are read from Postgres, so they hold across
  instances, but they are advisory rather than a hard distributed limit.
- **There is no password reset yet.** Same shape as the login OTP: request a
  `PASSWORD_RESET` purpose, verify the code, then set the new password.
