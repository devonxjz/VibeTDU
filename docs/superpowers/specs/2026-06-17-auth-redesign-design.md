# Auth Redesign Design

## Goal

Build real authentication for VibeTDU with Google sign-in and email/password login, then replace the nickname prompt with a polished auth screen. The user's `name` becomes the app display name and the saved journal nickname.

## Assumptions

- Email is the login identifier for the username/password path. The UI may label it as "Email" to avoid implying a separate username column.
- The existing `users` table remains the source of truth. It will be extended with a nullable `password_hash` for local accounts.
- Google accounts use `provider = 'google'`, `google_sub`, `email`, `name`, and `picture_url`.
- Local accounts use `provider = 'local'`, `email`, `name`, and `password_hash`.
- A local account name is collected during registration. No separate nickname field is shown anywhere.
- Existing local journal storage can remain as offline fallback, but authenticated journal calls should use the backend with the JWT.

## User Experience

Unauthenticated users see a full-screen login experience instead of the old nickname modal. The page keeps the chemistry-lab identity: warm premium surfaces, a lab-inspired visual composition, and a focused auth panel.

The auth panel contains:

- A primary "Continue with Google" action.
- A divider.
- Email and password fields for login.
- A register mode with name, email, and password.
- Clear error messages for invalid credentials, duplicate email, and Google configuration issues.

After authentication:

- The frontend stores the JWT and user profile.
- `vibe_user_name` is set from `user.name`.
- The lab opens without asking for a nickname.
- Toolbar and journal title continue to display the user name.

## Backend Design

Add auth units:

- `User` entity maps the existing `users` table.
- `UserRepository` finds users by email and Google subject.
- `AuthService` owns local registration, local login, Google login, password hashing, daily quota defaults, and auth response creation.
- `JwtService` creates and validates internal JWTs.
- `GoogleTokenVerifier` verifies Google ID tokens using `app.auth.google.client-id`.
- `AuthController` exposes:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `POST /api/auth/google`
  - `GET /api/auth/me`
- `AuthFilter` reads `Authorization: Bearer <token>` and attaches the authenticated user for protected endpoints.

Journal ownership should be made real because the current comments already claim it:

- Add `user_id` to `lab_journals`.
- `LabJournalService.save` stores the authenticated user id.
- `LabJournalService.listAll` returns only that user's journals.
- `/api/journal` requires a valid JWT.

## Frontend Design

Replace `WelcomeModal` with an auth gate component that checks local auth state before rendering `ChemLabShell`.

Add frontend units:

- `src/api/client/auth.ts` for auth API calls.
- `src/stores/auth-store.ts` or a small React hook for token/user persistence.
- `src/components/auth/AuthGate.tsx` for the auth screen and authenticated rendering.
- `src/components/auth/AuthPanel.tsx` for the visual login/register form.

The frontend HTTP client should attach `Authorization` when a token exists.

The auth UI should use the project's Tailwind and Framer Motion stack. It should avoid nested-card clutter: one large art-directed scene area and one precise auth panel are enough.

## Data Flow

1. User signs in with Google or email/password.
2. Backend returns `{ token, user }`.
3. Frontend saves `vibetdu_auth_token`, `vibetdu_auth_user`, and `vibe_user_name`.
4. `ChemLabShell` renders.
5. Journal API calls send the JWT.
6. Backend resolves the authenticated user and filters journal rows by `user_id`.

## Error Handling

- Missing email/password returns HTTP 400 with a Vietnamese message.
- Duplicate local registration returns HTTP 409.
- Invalid login returns HTTP 401.
- Missing or invalid JWT on protected journal endpoints returns HTTP 401.
- Google login returns HTTP 400 if the token is invalid or the client id is not configured.

## Testing

Backend tests should cover:

- Register creates a local user with a password hash and returns a JWT.
- Login rejects invalid credentials.
- Google login creates or updates a Google user when token verification succeeds.
- `/api/auth/me` returns the authenticated profile.
- Journal list/save are scoped to the authenticated user.

Frontend tests should cover:

- Auth gate renders login UI when no token exists.
- Successful email login stores the user name as `vibe_user_name`.
- Journal client sends the bearer token.
- Nickname input no longer appears.

## Success Criteria

- There is no manual nickname prompt.
- Users can register/login with email and password.
- Users can login with Google when the client id is configured.
- The displayed nickname is always derived from `users.name`.
- Authenticated journal data is scoped per user.
- Frontend lint/build and relevant backend tests pass.
