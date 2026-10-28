# DigiLocker web verification — 2026-10-25

Verified the web application and existing backend API contracts. Mobile files were not changed.

## Fixes

- Preserve the Documents query string and OAuth callback fragment through the existing landing/sign-in return navigation. Continue to use the existing session restoration and PIN gates.
- Reject callbacks that do not match the pending session before loading any session or document list.
- Poll pending consent and load the provider list once authentication completes, including when document-list retrieval is delayed.
- Recover running imports, display their per-document results, exclude completed references from selection and refresh normal Documents after completion.
- Allow a missing/deleted session to be closed or replaced instead of trapping the user behind a failed cancel request.
- Keep explicit Allow & Import consent, supported-document restrictions, existing authorization headers/cookie refresh, and retry behavior.

## Verification

34 frontend tests passed across DigiLocker dialog, API client, auth/session routing, manual-upload dialog and client encryption tests. Eight backend DigiLocker tests passed. TypeScript, targeted ESLint, backend OpenAPI validation (142 operations with the main checkout's current billing edits), and the production web build passed. Vite reports the existing large-chunk advisory.

Live local API checks:

- `/health`: HTTP 200.
- Unauthenticated DigiLocker status and document-list access: HTTP 401 and no-store cache policy.
- Invalid OAuth state: HTTP 303 back to `/documents#digilocker_error=invalid_state`, with no-store cache policy.

The actual Chrome Documents dialog was observed with Connect DigiLocker enabled and no coming-soon message. Backend environment variables were checked for presence without revealing values. No credentials, provider account permissions, or secret validity are established by those checks.

## Remaining live verification

A real DigiLocker sign-in, provider consent return and authorized document download were not exercised. Automated provider/download fixtures are synthetic; the backend encryption and local file-storage tests execute the real existing pipeline. Desktop/mobile viewport and light/dark visual verification of the post-consent list is still required in an authenticated browser with real provider access.

No deployment, new worktree, auth bypass, mobile edit or real document import was performed.

## Combined security/import integration — 2026-10-28

Draft PR #4 now includes PR #3 and current main. The separate Vercel test branch is
`codex/digilocker-durable-integration`; no PR has been merged.

- IndexedDB clears and writes serialize through transaction commit. Account/generation checks reject stale writes.
- Pending Redux request IDs expire after ten minutes and are capped at 2,048. Late responses from logout or account replacement are rejected.
- DigiLocker polling forwards AbortSignal, backs off with Retry-After, and pauses scheduling while the tab is hidden. Refresh Status, Cancel Import and Reconnect provide recovery actions.
- Individual results and clear expiry messages preserve partial success. The scroll region renders fifty documents at a time, with Show More Documents.
- Large inherited modules were separated into hooks and view components using the same design-system components and styling. Both lint and TypeScript checks pass. The combined frontend suite passes 57 files / 266 tests; production build passes with existing bundle-size warnings.
- Existing unrelated local BrandLogo and AppLayout edits were excluded from the integration commit and deployment snapshot.

A real localhost OAuth attempt reached the provider and was rejected with
`redirect_uri_mismatch` before authentication or document consent. The registered
callback is the existing backend Vercel root URL. The user authorized test-branch
deployment against the connected Supabase test environment, preserving records
and existing production aliases. Hosted OAuth/scopes/HMAC/imports, real payment
lifecycle, mobile/light/dark/focus QA and production-equivalent performance remain
live verification gates until separately evidenced.
