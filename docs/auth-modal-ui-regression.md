# Authentication modal UI regression repair

24 October 2026. Scope: authentication rendering and opt-in reusable design-system capabilities. All completed landing-page audit changes are preserved. No backend, API, store, theme-token, global typography, dependency, commit or deployment changes.

## Root cause

The audit migration removed the auth modal's inline layout definitions and `.rn-authside` responsive behavior, then replaced its structural `div` elements with generic `Stack` elements. It did not migrate the styling roles into equivalent shared capabilities:

- The 780px entry panel and 440px credential/recovery panels fell back to ModalPanel's generic 500px width.
- The entry panel lost its horizontal main/sidebar composition, 26px content padding, 300px sidebar, distinct sidebar background, and narrow-screen sidebar hiding. The security details became vertical stacks under the form, producing a roughly viewport-height entry modal.
- The sign-in/signup choices lost equal-width distribution. Notice centering, headline color, security-title block layout, checkmark circles, form/action spacing and the OTP email/Edit row also lost their intended styles.
- Button, Input, Modal, Heading and Text defaults and theme-token files had not been modified by the original audit. The regression came from deleting their caller's composition and overrides, not a global token change. The added generic Stack reset does not explain the missing widths/sidebar; the prior divs already had no default margin or padding.

Pre-audit implementation was obtained from Git HEAD, served temporarily for Playwright screenshots, and restored automatically afterward. The regressed implementation was captured separately before the repair. This repair was then compared against both sets of screenshots and the original code.

## Repair

- Added optional compact/wide ModalPanel sizes and shared split-dialog composition: ModalColumns, ModalContent, ModalAside, ModalHeader, ModalOptions, ModalForm, ModalActions, ModalDetailRow, ModalBullet and ModalBulletIcon.
- Restored panel widths, main/sidebar padding, sidebar separation, checkmark alignment and circles, heading colors, centered legal notice, form spacing, action placement and the OTP summary row. Existing modal borders, radii, backdrop, shadow, focus trap, scrolling and positioning are retained.
- Used existing token compositions for the original geometry: 780px = dialog + tooltip widths; 440px = dialog width minus s60; 300px sidebar = tooltip width + s20; 26px padding = s24 + s2. No theme tokens or raw visual values were added.
- The sidebar uses the existing tablet breakpoint (980px) to hide on narrow layouts. The old embedded CSS used a separate 819px threshold; the repair reuses the shared breakpoint instead of adding a page-specific breakpoint.
- Added opt-in Button/ChoiceGroup fullWidth capabilities, Input centered-text alignment, and Text's heading tone. Existing callers retain the same defaults and appearance.
- Added PasswordInput as a shared Input composition using the existing field styles and Button. Show/hide controls preserve the controlled value, native ref, field associations, keyboard behavior and disabled behavior. The pre-audit modal did not have visibility controls; these were added to satisfy the requested validation and prevent a separate local implementation.
- Password controls apply to sign-in, signup/repeat-password and reset/confirmation fields. “Confirm password” is used as the shorter visible reset placeholder at 320px; the accessible name remains “Confirm new password.”
- Validation messages now use `role="alert"`, and related fields reference them. Request handlers, validation rules, endpoints and auth-store interactions are unchanged. Loading actions use the existing Button loading behavior.
- Existing audit copy, including the safer privacy/export wording, remains intact.

## Measured visual comparison

Measurements were taken in both themes with a 1000px viewport height.

| View | Pre-audit | Regressed | Repaired |
| --- | --- | --- | --- |
| Desktop entry at 1440px | 780 × 508px, split layout | 500 × 920px, security details stacked below | 780 × 490px, split layout restored |
| Mobile entry at 390px | 354 × 480px, sidebar hidden | 354 × 920px; content scroll height 980px | 354 × 480px, sidebar hidden |
| Desktop credentials at 1440px | 440 × 312px | Generic 500px-wide panel | 440 × 312px |
| Mobile credentials at 390px | 354 × 316px | 354 × 294px with reduced spacing | 354 × 316px |

The desktop entry height differs from the pre-audit screenshot because the audited privacy/export copy is retained and the entry actions now use clear full-width rows. Borders, fields, padding and compact form geometry match the previous visual structure. This is not a blind rollback of the landing audit or its corrected claims.

## Files changed by this repair

| Files | Purpose |
| --- | --- |
| [Landing.tsx](/Users/ranjith/code/frontend-web/src/components/Landing.tsx) | Restore auth rendering using the shared compositions. The exported Landing implementation and auth request-handler source were compared with the saved audit implementation and remain unchanged. |
| [Landing.test.tsx](/Users/ranjith/code/frontend-web/src/components/Landing.test.tsx) | Add recovery-flow coverage for validation, OTP, visibility, confirmation and the existing reset payload. Existing landing tests retained. |
| Modal [index](/Users/ranjith/code/frontend-web/src/design-system/components/Modal/index.tsx), [styles](/Users/ranjith/code/frontend-web/src/design-system/components/Modal/styles.ts), [types](/Users/ranjith/code/frontend-web/src/design-system/components/Modal/types.ts) | Opt-in sizing and reusable modal composition exports. |
| Input [index](/Users/ranjith/code/frontend-web/src/design-system/components/Input/index.tsx), [styles](/Users/ranjith/code/frontend-web/src/design-system/components/Input/styles.ts), [types](/Users/ranjith/code/frontend-web/src/design-system/components/Input/types.ts), [PasswordInput](/Users/ranjith/code/frontend-web/src/design-system/components/Input/PasswordInput.tsx), [tests](/Users/ranjith/code/frontend-web/src/design-system/components/Input/PasswordInput.test.tsx) | Centered OTP input and accessible shared password control with tests. |
| Button [index](/Users/ranjith/code/frontend-web/src/design-system/components/Button/index.tsx), [styles](/Users/ranjith/code/frontend-web/src/design-system/components/Button/styles.ts), [types](/Users/ranjith/code/frontend-web/src/design-system/components/Button/types.ts) | Optional fullWidth presentation. |
| ChoiceGroup [index](/Users/ranjith/code/frontend-web/src/design-system/components/ChoiceGroup/index.tsx), [styles](/Users/ranjith/code/frontend-web/src/design-system/components/ChoiceGroup/styles.ts), [types](/Users/ranjith/code/frontend-web/src/design-system/components/ChoiceGroup/types.ts) | Optional equal-width choices. |
| Text [styles](/Users/ranjith/code/frontend-web/src/design-system/components/Text/styles.ts), [types](/Users/ranjith/code/frontend-web/src/design-system/components/Text/types.ts) | Optional heading-color tone, using the existing token. |
| This report and audit-report follow-up note | Evidence, scope and validation boundaries. |

The audit's Ring/Stack/landing changes and the pre-existing UploadDocumentModal work are preserved. UploadDocumentModal was not edited by this repair.

## Validation

| Check | Result |
| --- | --- |
| TypeScript: `npx tsc --noEmit` | Passed, no diagnostics. |
| Build: `npm run build` | Passed. Existing bundle-size warning remains. |
| Focused lint for modified design-system components and tests | Passed. |
| Full lint: `npm run lint` | Same baseline 7 errors and 1 warning, including Landing's existing max-lines violation. No lint rule was disabled. |
| Focused Vitest: landing, design system, sessions, Google button and AppShell access | 10 test files / 51 tests passed. |
| Full Vitest | 35 files passed, 1 failed; 152 tests passed, 3 failed. Same three pre-existing UploadDocumentModal failures confirmed in the earlier baseline reproduction. |
| Playwright auth matrix | 126 view/layout checks across 320, 375, 390, 768, 1024, 1440, 1920px in light and dark themes. |
| Short viewport checks | 16 entry/signup checks across 320×568, 375×667, 390×844, 1440×600, in both themes. No modal clipping or horizontal overflow. |
| Screens and interactions | Sign-in entry/credentials, signup, PIN, signup OTP, forgot-email, reset OTP, new-password and validation-error views. Show/hide preserves entered values. Weak-password and mismatched-confirmation errors display. Reset completion returns to sign-in. |
| Every modal entry point | `/login`, `/signup`, `/landing`, header Sign in, hero CTA, both pricing CTAs and final CTA checked. |
| Modal interaction | Close button, Escape, backdrop click, reopening, focus containment and trigger-focus restoration checked. |
| Visual metrics | Centering, desktop widths, input heights, equal-width choices, no horizontal modal overflow, existing shadow and Poppins-only rendering checked. |
| Scope checks | Exported landing implementation unchanged; auth request handlers unchanged; theme/global typography/API/store source unchanged. |
| Style/diff checks | No new handwritten classes, Tailwind utilities, inline styles, standalone CSS, hardcoded colors or raw visual values; `git diff --check` clean. |

Shared defaults remain unchanged: generic ModalPanel still uses the same 500px token and padding, ordinary Button/ChoiceGroup widths are unchanged, Input's existing field styles are reused, and Text's default tone is unchanged. The full test suite covers their existing consumers, including AppShell navigation, documents, packages, health, theme controls and other overlays. No new failures appeared beyond the established upload-modal baseline. Authenticated pages were not visually exercised against a real account; the browser checks prove the local auth UI and its entry points, not all production screens.

Auth API responses were synthetic. No account was created, real email sent, live Google authorization performed, or real password changed. Chrome through Playwright was tested; Safari, Firefox and physical-device keyboards were not tested.

## Screenshots and evidence

[Evidence folder](/Users/ranjith/.codex/visualizations/2026/10/24/01a16d42-a440-7293-8cec-139f325848a6/readines-auth-modal-repair) contains pre-audit, regressed and final screenshots, dimensions, the browser scripts, source-scope/style scans, and test/build/lint logs.

- Desktop sign-in: [pre-audit](/Users/ranjith/.codex/visualizations/2026/10/24/01a16d42-a440-7293-8cec-139f325848a6/readines-auth-modal-repair/pre-audit-dark-1440-signin.png), [regressed](/Users/ranjith/.codex/visualizations/2026/10/24/01a16d42-a440-7293-8cec-139f325848a6/readines-auth-modal-repair/regressed-dark-1440-signin.png), [repaired](/Users/ranjith/.codex/visualizations/2026/10/24/01a16d42-a440-7293-8cec-139f325848a6/readines-auth-modal-repair/final-dark-1440-signin.png).
- Mobile signup: [pre-audit](/Users/ranjith/.codex/visualizations/2026/10/24/01a16d42-a440-7293-8cec-139f325848a6/readines-auth-modal-repair/pre-audit-light-390-signup.png), [repaired](/Users/ranjith/.codex/visualizations/2026/10/24/01a16d42-a440-7293-8cec-139f325848a6/readines-auth-modal-repair/final-light-390-signup.png).
- [Password reset at 320px](/Users/ranjith/.codex/visualizations/2026/10/24/01a16d42-a440-7293-8cec-139f325848a6/readines-auth-modal-repair/final-light-320-forgot-password.png), [OTP summary](/Users/ranjith/.codex/visualizations/2026/10/24/01a16d42-a440-7293-8cec-139f325848a6/readines-auth-modal-repair/final-dark-1440-forgot-code.png), [validation error](/Users/ranjith/.codex/visualizations/2026/10/24/01a16d42-a440-7293-8cec-139f325848a6/readines-auth-modal-repair/final-dark-390-validation.png).

No commit or deployment was performed.
