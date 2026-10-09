# TutorMatch Backend and Chat Design

Date: 2026-10-09

## Goal

Connect the existing TutorMatch app to Supabase and add application-managed registration, login, saved tutors, and real-time chat. The app has two account types: students and tutors. Students swipe through tutor profiles, save tutors they like, and can start a conversation with a saved tutor to discuss lessons and pricing. Tutors maintain a profile and reply to conversations.

The current swipe and saved pages remain the starting point. The separate study-buddy-board concept in `FINAL_PROJECT_PROPOSAL.md` is not part of this implementation scope.

## Approved user flows

### Registration and login

- Registration creates either a student account or a tutor account.
- Both account types provide a display name, email, and password.
- Tutor registration also collects the fields already represented by sample tutor data: subjects, levels, hourly price, teaching mode, province, biography, and profile photo URL.
- Login accepts email and password. The app reads the account role and presents role-appropriate navigation.
- Logout revokes the application session and clears the browser cookie.

### Discover and save tutors

- Students browse active tutor profiles from Supabase, filter by subject, and swipe or use the existing buttons to pass or like a tutor.
- Likes are stored in Supabase and survive across devices and sessions.
- The saved page displays liked tutors. Students can remove a like there.
- A student can start a conversation only with a tutor they have liked.

### Chat

- The first student message creates a conversation for that student/tutor pair. A unique constraint ensures a pair has only one conversation; later visits reopen it.
- Both participants can view the conversation list and message history.
- Messages are persisted in Supabase before the UI treats them as sent. Supabase Realtime delivers new-message events over WebSocket to the private conversation channel.
- If the realtime connection drops, the chat keeps the saved history visible and reconnects; sending still reports database errors clearly.

## Architecture

The Next.js app owns credentials and application sessions. Supabase Auth user and session APIs are not used; Supabase only validates the app-issued JWT for database RLS and Realtime authorization.

Passwords are hashed with Argon2id before storage. Registration and login run on the server. A successful login creates a cryptographically random opaque session token; only its hash is stored in a `sessions` table. The raw token is held in an HttpOnly, Secure, SameSite cookie. Server code validates the session before issuing a short-lived Supabase-compatible JWT for database and Realtime access.

The custom JWT uses an imported asymmetric signing key (ES256), with `sub` set to the account UUID, `role` set to the Postgres role `authenticated`, and an application role claim for `student` or `tutor`. Its lifetime is five minutes. The signing private key and Supabase server secret remain server-only. The browser receives only the short-lived user-scoped JWT needed by the Supabase client; it never receives a privileged Supabase key. Supabase RLS uses the token claims to authorize database access and private Realtime channels.

Account/session management uses server routes or server actions with the server-only Supabase secret key, because anonymous clients must not be able to create or inspect credential records. Other user-scoped reads and writes use the publishable key and custom JWT so database RLS can enforce account and role permissions. No service-role key is exposed to browser code.

## Data model

- `accounts`: UUID, normalized unique email, password hash, role (`student` or `tutor`), creation time.
- `sessions`: UUID, account UUID, unique session-token hash, expiry, revocation time, creation time.
- `profiles`: account UUID, display name, optional avatar URL.
- `tutor_profiles`: tutor account UUID, biography, subjects, levels, hourly price, teaching mode, province, photo URL, active flag, update time.
- `likes`: student UUID, tutor UUID, creation time, unique student/tutor pair.
- `conversations`: UUID, student UUID, tutor UUID, creation time, unique student/tutor pair.
- `messages`: UUID, conversation UUID, sender UUID, body, creation time.

Credential fields are never available through public profile queries. Tutor discovery returns only active tutor profile fields intended for display.

## Authorization

RLS is enabled for application tables. Anonymous clients cannot read or write private data. Policies enforce that:

- Students can read active tutor discovery profiles and create/delete only their own likes.
- Tutors can update only their own tutor profile.
- Students can create a conversation only for a tutor they have liked.
- Only the student and tutor recorded on a conversation can read it or its messages.
- A message sender must be one of the conversation participants, and message ownership cannot be changed by another user.
- Realtime private-channel authorization checks that the authenticated account is a participant in the conversation named by the channel topic.

Server-side registration and session routes validate input, normalize email addresses, enforce role rules, and use parameterized Supabase operations. Login limits repeated failures by normalized email and source IP to reduce password guessing. Errors returned to login avoid revealing whether an email is registered.

## App changes

- Replace placeholder login and registration pages with working forms and validation.
- Add role selection and tutor profile fields to registration.
- Replace sample-only discovery and localStorage likes with Supabase-backed tutor queries and likes.
- Add role-aware navigation, logout, and a tutor profile-edit route based on the existing `/post` placeholder.
- Add an inbox/conversation list and a conversation page with persisted history and Supabase Realtime updates.
- Add SQL migrations for the schema, constraints, indexes, RLS policies, Realtime setup, and sample tutor seed data.
- Update `.env.example` and README setup instructions for the Supabase URL, publishable key, server secret, and imported ES256 signing private key.

## Error handling and session behavior

- Forms show field-level validation and readable server errors.
- Duplicate email and incomplete tutor profile submissions are rejected before account creation.
- Expired or revoked application sessions return users to login. A previously issued Supabase JWT can remain usable until its five-minute expiry, limiting the useful life of a copied token.
- Realtime connection failures show a reconnecting state; message history remains available from Supabase.
- Duplicate likes and conversations are prevented by database constraints, with UI operations treated idempotently.

## Scope boundaries

The first implementation does not include payments, push notifications, typing indicators, read receipts, image uploads, ratings, tutor verification, email verification, group study rooms, or a study-buddy matching mode. Tutor photos use a URL field in this phase. Pricing is negotiated in chat; the app does not process payments.

## Setup and operational requirements

Before running the app against a Supabase project, the developer must apply the SQL migrations, enable the required Realtime feature, import and activate the generated ES256 signing key in Supabase, and set the corresponding private key in a server-only environment variable. The README will document these steps and identify which values are safe for browser exposure. Supabase's server secret key is also required for credential and session operations and must remain server-only.

## Supabase references

- [Custom JWTs with Realtime](https://supabase.com/docs/guides/realtime/postgres-changes#custom-tokens)
- [Realtime Authorization](https://supabase.com/docs/guides/realtime/authorization)
- [JWT Signing Keys](https://supabase.com/docs/guides/auth/signing-keys)

## Validation

Review the schema and policies for least-privilege access. Check registration and login for both roles, role-specific profile behavior, persisted likes, conversation creation from a liked tutor, message persistence, participant-only message access, logout/revocation, and realtime reconnection. Confirm production compilation after implementation. No payment or external messaging integration is in scope.
