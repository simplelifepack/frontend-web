# ReadiNes landing-page UX audit implementation

> Visual-restoration correction: the earlier removal of the approved cream palette and decorative styling was a regression. See [the restoration report](readines-landing-visual-restoration.md); the targeted audit changes are retained.

Date: 24 October 2026. Scope: public landing page and the shared design-system capabilities needed by it. No backend, authenticated-dashboard, dependency, API-contract, commit, or deployment changes.

## References and review

All five pages of [the supplied audit](/Users/ranjith/Downloads/ReadiNes%20website%20UX%20audit.pdf) were rendered and visually inspected, including their screenshots, annotations, and recommendations. The pasted task was read as supporting task context. The user's mandatory instructions govern conflicts, especially Poppins and the existing design system.

Implementation was compared with the reference screenshots for section order, alternating feature composition, progress state, pricing alignment, comparison readability, CTA scale, and navigation labels. The old landing page had a separate cream palette, embedded CSS, inline visual values, perpetual radar/floating animations, and a fifth Search feature. Those landing-specific styling definitions have been removed.

## Audit checklist

| Audit location | Recommendation | Result |
| --- | --- | --- |
| Page 1, hero 1–2 | Remove READY badge; show a 100% success progress; stop floating | Complete. Static native progress; travel example is 100% in the existing success token. Other examples retain partial values. |
| Page 1, hero 3–4 | Remove top-nav signup CTA and hero eyebrow badge | Complete. Sign in remains; main hero signup CTA remains. |
| Page 1, hero 5 and 9 | Correct product spelling | Complete. Product copy uses ReadiNes; “Readiness” remains the generic score label. |
| Page 1, hero 6 | Privacy supporting line | Complete with a verified-claim adjustment: “Private by design \| Encrypted storage \| You control what is stored.” End-to-end encryption is unsupported by the server-managed key architecture. |
| Page 1, hero 7 | Explain imports clearly | Complete. Upload files/photos, review Gmail attachments, or scan connected Google Drive from Documents. No promise of unattended automatic imports. |
| Page 1, hero 8 | Approved header logo | Existing repository BrandMark and tick BrandWordmark reused with semantic theme tokens. A separately approved replacement asset was not supplied; replacing the identity with a different asset remains pending that input. |
| Page 1, cards 10 | Meaningful card labels/titles | Complete. Travel pack, Care records, Document checklist, Family access; grammatical titles and restrained claims. |
| Page 1, cards 11–12 | Contrast and primary-font tags | Complete. Existing Card/Pill variants and semantic colors; Poppins throughout. |
| Page 1, cards 13 | Remove hover affordances on static cards | Complete. No transform, pointer, hover lift, or entrance animation on the static cards. |
| Page 1, cards 14 | Rewrite closing paragraph | Complete. Shorter copy, commas, clear next steps. |
| Page 2, 1 and 3 | Travel pack label and remove “to add” | Complete. Travel pack example; missing confirmation row retains its plus sign without the trailing phrase. |
| Page 2, 2 | Preserve stacked alternating composition | Complete. Four desktop alternating feature rows, stacked on mobile. |
| Page 2, 4 | Packages, Documents, Health, Wealth; remove separate Search card | Complete. Each module has its own title, description, highlights, and illustrative preview. Search is included in Documents. |
| Page 3, workflow 1–2 | Move How it works earlier; explain actual journey | Complete. Immediately follows hero: add/import, consent-based extraction/manual review, search/package preparation. |
| Page 3, privacy 3 | Move privacy earlier and rewrite | Complete. Immediately follows How it works; explains encrypted storage, server-managed keys, user control, Trust Center permissions, and optional AI processing. |
| Page 3, pricing 1 | Clear pricing heading | Complete. Visible Pricing heading with “Start with the essentials. Choose more room when you need it.” |
| Page 3, pricing 2 | Equal desktop card height and aligned content | Complete. Shared grid tracks align headers, prices, lists, and CTA rows across billing/offer states. |
| Page 3, pricing 3 | Toggle states use design system | Complete. Existing ChoiceGroup/Choice default, selected, hover, focus and disabled styling reused. |
| Page 3, pricing 4 | Equal full-width CTA dimensions | Complete. Same Button size inside shared Content composition. Browser measurements verify equal width/height and desktop baseline. |
| Page 4, comparison 1 | Accessible colors; header matches paid card | Complete. Shared action/actionText tokens; neutral panel/body text; matching header colors. |
| Page 4, comparison 2 | Left-align values and improve readability | Complete. Semantic table, left-aligned column and row headers/values, token-based cell padding. |
| Page 4, comparison 3 | Highlight ownership/export message within comparison card | Complete. Heading and export information are inside the same Card below the table. Permanent retention after stopping payment is not claimed because that policy could not be established. |
| Page 4, CTA 1–3 | Smaller final heading, static card, prominent button | Complete. Existing lg heading, primary lg Button, no decorative animation. |
| Page 4, footer 4 | Remove family-archive sentence | Complete. Brand and concise privacy copy remain. Original footer had no legal navigation links to remove. Existing auth legal notice remains. |
| Page 4, navigation | Match visible section headings and anchors | Complete. Features, How it works, Privacy, Pricing all point to labelled sections. Header-aware scrolling, target focus, native hashes, reduced-motion support, and visible mobile navigation. |
| Page 5 | Typography hierarchy | Complete under user override. Poppins only; existing shared Heading/Text/Button/Pill scales and 400/500/600/700 weights retained. No new fonts. |
| Supporting task | Responsive and accessibility checks | Complete for the requested Chromium/Chrome widths and both themes. See validation limits below. |

## Source-grounded claim adjustments

These are source checks, not live production or provider-integration proof.

- Backend `src/services/documentEncryptionKeyring.ts`, `documentHybridEncryption.ts` and document read/export services support server-side key access/decryption. The site therefore says encrypted storage, not end-to-end encryption or zero knowledge.
- Backend `src/services/aiProcessing.service.ts` enforces `aiProcessingEnabled`; imported-document analysis has a manual fallback. The page describes optional processing and review, rather than guaranteed automatic understanding.
- Frontend `src/lib/api.ts`, backend `src/routes/gmail.routes.ts`, and the Gmail scanner/importer implement authorization, scanning, candidate review, and explicit import. Drive routes/scanner implement connection and scans. Copy distinguishes these steps.
- Backend `src/services/accountUsage.service.ts` confirms the existing 50 MB free storage allowance and three monthly AI actions. Paid accounts bypass these quota checks. The existing advertised ₹0, ₹249/month, ₹1,999/year and optional ₹1,499/year amounts are retained.
- Package listing in backend `src/routes/packs.routes.ts` and `src/services/packs.service.ts` has no one-package paid-tier restriction. Removed the old landing-only “one curated package” claim instead of inventing an entitlement.
- Trust/Wealth and Gmail/Drive routes do not require the paid plan. The comparison no longer presents those as paid-only benefits.
- Account export routes/services require authentication/ownership but do not gate export on paid status. Prepared archives expire after 24 hours. The highlighted message explains requesting a fresh archive; it makes no indefinite storage promise.
- The existing landing CTAs open signup. No checkout, payment selection persistence, or billing integration exists in that flow to validate or change. Prices remain advertised values, not newly implemented payment behavior.

## Modified files

| File | Change |
| --- | --- |
| [Landing.tsx](/Users/ranjith/code/frontend-web/src/components/Landing.tsx) | Audit composition/copy, static previews, four module rows, pricing alignment, accessible comparison, navigation and signup entry points. Existing auth handlers retained; its old inline layouts replaced with shared primitives and accessible input names. |
| [Landing.test.tsx](/Users/ranjith/code/frontend-web/src/components/Landing.test.tsx) | Four regression tests for section/module order, billing/offer state, sign-in validation/focus restoration, and signup OTP contract. |
| [Stack/index.tsx](/Users/ranjith/code/frontend-web/src/design-system/components/Stack/index.tsx) | Reusable responsive layout, navigation, surface-header, scroll-region, and comparison-table capabilities. |
| [Ring/styles.ts](/Users/ranjith/code/frontend-web/src/design-system/components/Ring/styles.ts) | Native non-animated LinearProgress with existing action/success tones. |
| [Ring/index.tsx](/Users/ranjith/code/frontend-web/src/design-system/components/Ring/index.tsx) | Export LinearProgress. |
| This report | Checklist, evidence, limitations and design-system inventory. |

`src/components/UploadDocumentModal.tsx` was already modified when work began and was left untouched. Its baseline test failures are recorded separately. The backend worktree remains unchanged.

## Design-system reuse and extensions

Reused: Heading, Text, Button (primary/secondary/tertiary; sm/lg), Card (default/flush), Pill (flat/warn), Stack, ChoiceGroup, Choice, ModalBackdrop, ModalPanel, Input, the existing BrandMark/BrandWordmark and GoogleSignInButton. Existing colors, spacing, radii, typography, breakpoints, shell width, icon sizes, border widths, and navigation layer tokens supply the visual values.

The existing Stack family lacked responsive multi-column/alternating layouts, shared grid tracks, a constrained container, token-based section spacing, horizontal/centered/padded compositions, and a responsive sticky navigation composition. Added Container, Section, Grid, Row, Center, Content, SiteNav, NavLayout, and NavLink there. Grid's shared-row capability handles aligned comparison cards; Row's non-wrapping option keeps checkmarks beside wrapping list text. SurfaceHeader, ComparisonTable, and ScrollRegion provide reusable comparison presentation and keyboard-scrollable overflow. These capabilities are exercised by multiple sections and contain no landing-page selector or duplicated per-page palette.

The Ring family gained LinearProgress because the existing circular Ring did not provide a static horizontal progress indicator. It uses native progress semantics, token-based height/radius/background, and existing action/success tones. No new theme tokens or fonts were needed.

No new page-specific styling classes, Tailwind utilities, inline style attributes, CSS modules, standalone CSS files, color literals, arbitrary visual values, or duplicated page CSS were introduced. `Landing.tsx` now contains zero `style`/`className` attributes and no embedded CSS or motion import. Shared styled-components generate their normal internal class names. Structural CSS values such as zero resets, percentages and grid fractions describe layout, not a new visual scale. Existing internal implementations of unmodified brand/Google components were reused.

## Validation

| Check | Result |
| --- | --- |
| `npm run build` | Passed. Existing bundle-size warning remains. |
| `npx tsc --noEmit` | Passed; no diagnostics. |
| `npm run lint` | Blocked by repository baseline: 7 errors and 1 warning. Landing retains an existing max-lines violation; its prior two no-explicit-any errors are removed. Other diagnostics are in untouched files. No lint rule was disabled. |
| Focused landing/design-system/session Vitest run | 7 files, 40 tests passed. |
| Full `npx vitest run` | 34 files passed, 1 failed; 149 tests passed, 3 failed. All failures are in pre-existing UploadDocumentModal work. |
| Baseline reproduction | With the four landing/design-system source edits temporarily restored to HEAD, UploadDocumentModal still produced the same 3 failures and 3 passes. Current task edits were restored afterward. |
| Playwright | All 14 width/theme combinations passed at 320, 375, 390, 768, 1024, 1440, 1920px in light and dark themes, using installed Chrome through Playwright. |
| Browser interactions | Anchor targets and header clearance, focused section targets, keyboard focus, annual/monthly/offer amounts, CTA dimensions, desktop card/list/CTA alignment, mobile table keyboard scrolling, sign-in validation, modal dismissal, and signup entry verified. |
| Auth screens | Credential/PIN failure handling, password-reset entry, and signup OTP request verified with synthetic API responses. No real account created or provider message sent. |
| Rendered contrast | Text checks at 390/1440px in both themes passed applicable 4.5:1/3:1 thresholds. Minimum observed text contrast: light 4.53:1, dark 4.83:1. Informational wealth pills use the existing neutral variant after the success variant measured below 4.5:1 in light mode. |
| Fonts, static content and image checks | Poppins only; zero running landing animations and zero broken images in the inspected views. |
| Overflow | No page-level horizontal overflow. The 320px comparison table scrolls within its named, focusable region. |
| Style and diff scans | Passed: no page styling attributes/classes/palette literals, no page CSS/motion import, and `git diff --check` clean. |

The browser checks use an anonymous refresh response and synthetic auth failures/OTP responses. They do not establish authenticated runtime, live Gmail/Drive authorization, successful payment, email delivery, database migration, or production security behavior. Chromium/Chrome was tested; Safari/Firefox and screen-reader behavior were not tested. CSS subgrid is used for desktop pricing alignment.

## Evidence

[All screenshots, scripts, metrics and logs](/Users/ranjith/.codex/visualizations/2026/10/24/01a16d42-a440-7293-8cec-139f325848a6/readines-ux-audit).

- Before: [desktop](/Users/ranjith/.codex/visualizations/2026/10/24/01a16d42-a440-7293-8cec-139f325848a6/readines-ux-audit/before-1440.png), [mobile](/Users/ranjith/.codex/visualizations/2026/10/24/01a16d42-a440-7293-8cec-139f325848a6/readines-ux-audit/before-390.png).
- After hero: [light desktop](/Users/ranjith/.codex/visualizations/2026/10/24/01a16d42-a440-7293-8cec-139f325848a6/readines-ux-audit/hero-light-1440.png), [dark mobile](/Users/ranjith/.codex/visualizations/2026/10/24/01a16d42-a440-7293-8cec-139f325848a6/readines-ux-audit/hero-dark-390.png).
- After pricing: [dark desktop](/Users/ranjith/.codex/visualizations/2026/10/24/01a16d42-a440-7293-8cec-139f325848a6/readines-ux-audit/pricing-dark-1440.png), [light mobile](/Users/ranjith/.codex/visualizations/2026/10/24/01a16d42-a440-7293-8cec-139f325848a6/readines-ux-audit/pricing-light-390.png).
- Full-page captures are included for all seven widths in both themes, plus a mobile signup OTP dialog.

## Pending and decisions requiring input

1. A distinct approved replacement logo, if the current repository identity is not the intended approved asset.
2. Product/legal confirmation of the exact retention policy after stopping payment; no perpetual-retention wording was published locally.
3. Existing repository lint debt and the three baseline UploadDocumentModal test failures. They remain outside this landing-page scope.
4. Live provider, authenticated, production, and checkout proof remains outside the local synthetic browser validation. Existing functionality and routes were preserved; no checkout was invented.

No commit or deployment was performed.

## Authentication follow-up

The first audit migration caused an authentication layout regression by removing the existing composition without equivalent shared variants. That regression has been repaired separately while retaining the landing improvements. See the [authentication repair report](/Users/ranjith/code/frontend-web/docs/auth-modal-ui-regression.md) for the cause, original/regressed/repaired screenshots, affected files and updated validation results.
