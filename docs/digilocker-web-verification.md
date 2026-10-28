# DigiLocker web verification — 2026-10-28

Both PR #3 and PR #4 are included in main. Public-domain hostname/early-access
restrictions were removed as requested; normal authentication, PIN checks and
private-route authorization remain. The main domains use the registered backend
directly; temporary preview callback forwarding was removed.

## Completed behavior

- OAuth fragments survive sign-in/session restoration and mismatched callback
  sessions are rejected. Pending session IDs use independent account storage keys;
  a late previous-account cancellation cannot clear a new account's connection.
- Polling propagates AbortSignal, uses Retry-After/backoff and suspends scheduling
  while hidden. Startup checks abort after twenty seconds. Refresh Status is
  available even before a session exists; cancel, reconnect, partial results and
  expiry messages support recovery.
- Provider lists render in fifty-row increments and selection is capped at fifty
  per batch. Completed documents are excluded from new selections.
- DigiLocker provenance is labelled and filterable correctly in Documents.
- As explicitly requested, shared header buttons keep natural widths, modal
  actions use wrapping rows, and document bulk actions wrap. Buttons move to the
  next line when needed rather than being forced into full-width vertical stacks.
  Existing design-system colors, typography, spacing and control tokens remain.

## Verification

- All 56 frontend test files / 234 tests pass on combined code, including account
  isolation, timeouts/retry, cleanup aborts, hidden-tab polling, paging/selection,
  focus trap, Escape and focus restoration.
- Lint and TypeScript checks pass; production build passes with the existing
  bundle-size advisory.
- Real Chrome OAuth/consent/callback and listing succeeded. PAN correctly
  deduplicated. With explicit approval, a fresh Driving License PDF imported and
  appeared as the fourth archive record. Its real download/HMAC/encryption/AI
  path completed; closing the connection cleared credentials and the lease.
- Authenticated hosted fixture tests verified ownership/cancellation/replay and
  autonomous scheduler expiry. See the backend integration report and JSON
  evidence for exact checks and bounded load measurements.
- Real Chrome mobile emulation at 412 × 924 showed the dark archive and DigiLocker
  modal fitting the viewport. Browser refresh recovered an expired access token
  normally. This is emulation, not a physical-device/browser-matrix certification.

## Evidence boundaries

Large-provider-list and keyboard checks are automated component tests. Hosted
security checks are targeted regression testing, not an independent penetration
assessment. The hosted load run was bounded, not saturation/soak testing. Local
large-PDF memory profiling used synthetic documents with AI disabled; it does not
establish hosted AI peak RSS or historical production before/after performance.
Razorpay was explicitly excluded from the follow-up.
