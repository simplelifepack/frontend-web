# Design-system UI regression repair — 15 October 2026

Scope: the Readiness web application in `frontend-web`, using the supplied test account against the configured live API through the local development build. Existing uncommitted design-system work was preserved. No deployment or commit was made.

## Root causes and repairs

- **Conflicting style ownership.** Unlayered styled typography defaults overrode Tailwind spacing utilities. Defaults on cards and modal containers also won over equal-specificity layout/layer classes because they loaded later. Text/Heading defaults now live in the existing components cascade layer; card/modal/drawer-container defaults use zero-specificity selectors so their compositions can control geometry and stacking. This restores intended margins and nested-dialog layers without `!important` overrides.
- **Unintended italics.** The shared Text component explicitly applied italic styling to every descendant `em`. Because Text also wrapped large layout containers, this reached unrelated badges and labels. Shared typography and controls now default to upright text, including descendant emphasis. Poppins remains the single app font. Binary checks confirm all four existing files are upright, with correct 400/500/600/700 weights; no replacement font downloads were needed.
- **Duplicate search-field styling and stretching.** Legacy toolbar labels added their own vertical padding around the new search control, producing a 60px row and stretching adjacent selects. Removed the duplicated visual ownership, migrated remaining measurement/document-picker composites to SearchField, and stopped native fields stretching in grid/flex rows. Desktop document fields now measure 40px, including selects; mobile inputs retain 16px text to avoid browser zoom.
- **Clipped overlays.** Country options lived inside an overflow-hidden card. They now use a shared, portaled Popover with collision detection, keyboard dismissal and focus restoration. Standalone drawers now use DrawerPortal, escaping route isolation; this fixes the mobile Wealth sheet appearing behind bottom navigation and protects document context drawers from the same cause.
- **Responsive layout.** Buttons no longer shrink their short labels into fragments. The shared upload header has a token-based gap and aligns its actions at the top. Health measurement toolbars wrap instead of clipping actions. Medication field labels align their contents at the start, preventing an oversized date field beside wrapped choices. Stack supplies explicit token-based spacing for package and document compositions.
- **Contrast and navigation.** The default brand wordmark uses the semantic heading color, fixing dark recovery screens. Collapsed Settings navigation now keeps its accessible name and tooltip.

## Live browser verification

Browser viewports: 1440×1000 desktop, 820×1180 tablet, 390×844 mobile. Main authenticated screens were visited at all three sizes. Light and dark themes were exercised across the audit, with the test account's original dark preference restored. These were browser viewport checks, not physical-device testing. Not every dialog/state was repeated in every viewport/theme combination.

| Area | Screens and interactions inspected |
| --- | --- |
| Authentication | Landing, email sign-in (successful), sign-up form without submission, PIN sign-in form, inline password recovery, standalone forgot/reset-password forms. Missing reset-token state keeps submission disabled. |
| Shell/Home | Expanded/collapsed sidebar, mobile bottom navigation, account menu, overview cards, attention/insight empty states, global search field. |
| Documents | Empty archive, quick filters, search, category/person/source/sort selects, Upload and Scan entry, upload dialog and its disabled continue action. Typed values and native selection verified. |
| Packages | Catalogue, categories, custom-pack entry and manual requirement form, detail drawer, requirement action menu, nested document picker, focus and dismissal above the drawer. |
| Health | Overview, Timeline, Medications, Records, measurement search, medication form, add-member form, manual reading form, reminder form, medical-profile editor, visit-pack empty state, emergency card, insurance empty state, record-upload dialog. Selected choices, typed input, disabled save, and blank-reading validation error inspected without creating records. |
| Wealth | Overview, categories, add-holding form, type-options dropdown, money lent/borrowed form, proof/vault picker empty state, SOS dialog without release, mobile action sheet. |
| Settings | Account name display, Country search popup, appearance controls, notification/AI states, credential-change modal layouts without entering credentials, release notes, help, feedback notice and About overlays. |
| Family/Trust | Empty emergency-access screen, add-person form, Trust center, add-member form, disabled Owner select; `/legacy` resolves to Trust. |
| Admin | `/coffee/packages` returns 403 for the supplied account. |

Text/control measurements on repaired document screens used Poppins with normal style. Desktop field height: 40px. Mobile form fields: approximately 42px with 16px type. Inspected mobile documents, packages and home had no horizontal document overflow. Decorative icon-only `i` elements can still have the browser's italic computed style, but contain no text.

## Automated validation — initial repair (superseded by follow-up below)

- Production build passed (existing chunk-size warning).
- Focused final run: 46 tests passed across 9 files.
- Full suite before the final typography-layer/brand refinement: 137 passed, 2 failed across 33 files. Failures match those documented in `typography-audit.md`: `AppShell.access.test.tsx` expects one Health link although desktop/mobile links coexist; `pack-refresh-readiness.test.tsx` expects an unavailable “Updated official checklist” link.
- TypeScript reports the same 13 diagnostics before/after this repair, in untouched admin metadata, Health test fixture, dormant login dispatch, readiness assignment and catalogue test code.
- Focused ESLint on the design system, preference selector and migrated Health search controls passed.
- `git diff --check` passed.
- New regressions cover actual font-file weight/style metadata, searchable options escaping clipped cards, filtering/selection/Escape/focus restoration, and standalone drawer portals.

## Limits

The account has no documents, medical records, medications or wealth holdings. Consequently populated previews, record-specific editors, populated visit packs, page-management flows and mismatch/replacement confirmations could not be verified live. No valid invitation or reset token was available. Admin editing was blocked by 403. OAuth providers, cloud imports, actual uploads/scans, push permission, exports/printing, invitation delivery, SOS release, deletions, resets and credential changes were not submitted. Hover/focus styling was inspected on exercised controls, not every individual control. A complete every-control × every-state × every-size × every-theme certification is therefore not claimed.

Evidence: `/private/tmp/readiness-ui-desktop-documents.jpg`, `/private/tmp/readiness-ui-mobile-sheet.jpg`.

## Known-issue follow-up — final validation

The two failing tests and all 13 TypeScript diagnostics listed above are now resolved. Existing UI repairs and other uncommitted work were preserved; no commit or deployment was made.

- The sidebar navigation now has a distinct accessible landmark name and explicit link labels, including when collapsed. Tests verify both responsive compositions, active Health state, destination paths, collapsed labels, and Family access through the account menu. JSDOM does not evaluate responsive CSS, so the test scopes assertions to each composition rather than claiming both are visible. Live browser checks at 1440, 768, 767 and 390px confirmed exactly one accessible Health link: sidebar above 767px, bottom tabs at/below 767px. The visible Health link exposes `aria-current="page"` on both layouts.
- Package refresh had a stale link-name assertion. Source chips intentionally show a provider/domain; the checklist title is a tooltip. The regression test now verifies the refreshed URL and title, replacement of the previous source, checked date, feedback, API call, cache invalidation, READY/readiness recalculation and source propagation to detail, active-list and catalogue state. Refresh implementation was preserved.
- Admin types now omit overridden metadata and nullable verification-date fields before extending PackSummary. Draft metadata is narrowed to an object record; only string country/applicability values populate the form. Tests cover null, valid and non-string values and preserve unrelated metadata on save.
- The medication fixture is explicitly typed as HealthMedication. Login dispatch branches are narrowed before dispatching their respective thunks, retaining `.unwrap()` and redirect behavior; tests cover both password and PIN payloads and the requested destination. Readiness holds a narrowed assignment reference through the document lookup. Catalogue fixtures/cache mocks use the actual PackageListResponse, PackageListQuery and CachedPackagePage contracts instead of an untyped response and outdated raw payload shape. No ts-ignore or blanket any casts were added.

| Final check | Result |
| --- | --- |
| Complete `npx vitest run` | **146 passed**, 34 files, no failures or skips |
| `npx tsc --noEmit` | **Passed**, zero diagnostics |
| `npm run lint` | **Still fails with 9 pre-existing errors and 1 pre-existing warning**; no new findings |
| `npm run build` | **Passed**; existing large-chunk warning remains |
| `git diff --check` | **Passed** |

Remaining lint findings: Landing has two explicit-any violations and a file-length violation; admin packages, HealthDialog, HealthPage.test, RecordDetailModal, Trust and capture-proof-dialog exceed the existing 250-line limit; admin's existing selected/selectedSlug effect has an exhaustive-dependencies warning. Those broader refactors were outside the requested known-test/TypeScript repair scope. Rules and checks were not disabled.

Live-verification gaps remain separate from these automated results: no privileged admin account, populated test records or valid invitation/reset token was supplied. This follow-up did not perform live admin writes, credential changes or server package refresh. Those paths were verified using typed fixtures/mocked API responses; the prior audit's other live-flow limits remain. The app was left signed in on Home with its normal browser viewport restored.

Navigation evidence: `/private/tmp/readiness-known-desktop-navigation.jpg`. Final command logs: `/private/tmp/readiness-known-final-{tests,tsc,lint,build}.log`.
