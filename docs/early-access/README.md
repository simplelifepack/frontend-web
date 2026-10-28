# Early-access landing implementation

`/` renders the separate `EarlyAccessLanding` through the existing `LandingRoute`. The existing `/landing` alias still uses that same route wrapper. No route paths were added or removed. The original `LandingPage` import remains in `App.tsx`; restoring its component reference restores the original page.

## Files

| File | Change |
| --- | --- |
| `src/App.tsx` | Import the new page and switch the route wrapper's rendered component. |
| `src/App.session.test.tsx` | Mock the new entry component and verify the original page is absent, preserving the existing session/redirect assertions. |
| `src/components/EarlyAccessLanding.tsx` | Separate page, existing authentication modal and unsubscribe handling. |
| `src/components/EarlyAccessHero.tsx` | Accessible form, existing challenge/proof/register contract, server messages, theme control and existing brand components. |
| `src/components/EarlyAccessHero.styles.ts` | Scoped responsive composition and semantic colors; 3px mascot float disabled with reduced motion. |
| `src/components/EarlyAccessLanding.test.tsx` | Eight tests for form, authentication entry, theme and cancellation behavior. |
| `public/images/early-access-squirrel.png` | Exact, unmodified user-supplied `Cheerful Purple Squirrel with Document Folder.png` (SHA-256 `555e0a03faa6718f15cdecba05427ad3021725768529752d63f1fbace667e7b0`). |
| `docs/early-access/` | Actual browser screenshots and validation evidence. |

Original `Landing*` files, `src/pages/landing`, `BrandLogo.tsx`, design-system files, fonts, theme tokens, registration API client, backend and payment code are unchanged. Verified with `git diff --exit-code HEAD -- src/components/Landing.tsx 'src/components/Landing.*' src/pages/landing src/components/BrandLogo.tsx src/design-system src/lib/waitlist-api.ts` before committing. The original dirty frontend checkout was left untouched; implementation used an isolated worktree based on `3434bfa` (also origin/main at verification).

## Validation

- `npm run lint`: passed across all `src`.
- `tsc --noEmit`: passed.
- `VITE_API_URL=https://api.example.invalid npm run build`: passed. Existing bundle-size warning remains (API chunk approximately 530 kB). The placeholder HTTPS API was build-only; it was never used for browser registration.
- Vitest: **30 passed across four files**: `EarlyAccessLanding.test.tsx` (8), original `Landing.test.tsx` (6), `App.session.test.tsx` (13), `lib/theme.test.ts` (3).
- Test command: `vitest run src/components/EarlyAccessLanding.test.tsx src/components/Landing.test.tsx src/App.session.test.tsx src/lib/theme.test.ts`. In this worktree, the final run used a temporary equivalent Vitest config that additionally allowed the original checkout's symlinked `node_modules` directory in Vite's filesystem policy; the default config initially denied its PDF worker import in the routing suite. No config change is shipped.
- Browser QA used Vite on `127.0.0.1:5177` and a local mock API on port 5180. The real frontend proof solver ran, and registration requests used the existing email/website/challenge/solution fields. Verified success, duplicate email, simulated 503, and retry. No production registrations, email delivery, charges or authenticated live login were performed.
- Existing Sign In opened its actual modal. Email validation worked, Google remained unavailable without configuration, Escape dismissed the modal, and focus returned to Sign In.
- Verified light/dark switching; desktop 1536×1024, tablet 768×1024, mobile 390×844, narrow mobile 320×720. No horizontal overflow; narrow submit button ended around y=601 within the 720px viewport. Mobile places text and signup before the mascot.
- A temporary PerformanceObserver (removed before build/commit) measured desktop development LCP ~464 ms and CLS ~0.000425; narrow mobile LCP ~316 ms and CLS ~0.000075. These are local warm-development observations, not production/network performance guarantees. The supplied PNG is 2.1 MB; image dimensions and a fixed aspect-ratio reserve its layout space. No animation JS listeners were added; challenge work is aborted on unmount and the existing appearance subscription supplies listener cleanup.

## Reference comparison

Compared the actual desktop light/dark captures with the ZIP's 1536×1024 references. The split composition, headline, form, reassurance row, prominent folder-holding squirrel and theme treatment are reproduced with real components. Remaining intentional differences:

- Repository `BrandMark`/`BrandWordmark` and `public/icons/favicon.svg` remain the logo source, as required by the handoff; its existing ReadiNes wordmark differs from the reference spelling and mark. No second logo source was introduced.
- Existing semantic lavender button colors, Poppins weights and design-system controls are retained instead of copying the screenshots' vivid dark CTA color.
- Lightweight token-based gradients replace the photographed room, plants, steps and floor. The supplied mascot is preserved byte-for-byte; its lighting and pose differ slightly from the reference compositions. No screenshot is used as a background.
- Mobile deliberately stacks the form before the mascot. Mascot blinking is unsupported by the static asset; only a small CSS float is used.

## Actual screenshots

Desktop images use a 1536×1024 viewport. Mobile images use a 390×844 viewport (some capture the full scrollable page). The original landing's brand surface used the same cream palette in both themes.

| Theme | Before | After |
| --- | --- | --- |
| Light desktop | ![Before light](screenshots/before-light-desktop.jpg) | ![After light](screenshots/after-light-desktop.jpg) |
| Dark desktop | ![Before dark](screenshots/before-dark-desktop.jpg) | ![After dark](screenshots/after-dark-desktop.jpg) |
| Dark mobile | ![Before mobile](screenshots/before-dark-mobile.jpg) | ![After mobile](screenshots/after-dark-mobile.jpg) |

Additional evidence: [light mobile](screenshots/after-light-mobile.jpg), [tablet](screenshots/after-dark-tablet.jpg), [320px mobile](screenshots/after-light-narrow.jpg), [registration success](screenshots/registration-success-mobile.jpg), [registration error](screenshots/registration-error-mobile.jpg), [sign-in validation](screenshots/sign-in-mobile.jpg).
