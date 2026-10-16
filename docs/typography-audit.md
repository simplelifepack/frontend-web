# Typography standardization

Poppins is the sole application font, with a generic sans-serif fallback. Typography is centralized in `src/design-system/variables/typography.ts`.

## Initial audit

- Traced active routes, shell/navigation, shared components, dialogs, drawers and conditional forms from `src/main.tsx`.
- Found system/SF/Segoe/Roboto/Arial stacks, Inter, Space Grotesk, JetBrains Mono and monospace overrides in global CSS, Landing’s private Google Fonts import, inline styles, Ring/Pill and the printable emergency-card document.
- No installed font package or checked-in font binaries existed to remove. Existing unrelated package changes were preserved.

## Shared components and font loading

- Heading supports semantic levels 1–6 and independent sm/md/lg/xl sizing; defaults follow level. Native heading attributes and refs are preserved.
- Text accepts children, sm/md/lg size, regular/medium/semibold weight, default/muted/danger/success tone, and a generic typed as prop that couples native or router-link attributes and refs to the chosen element.
- Both follow the existing light/dark semantic color theme. Their rendering, styled definitions and public props are separated into index.tsx, styles.ts and types.ts.
- The font family, sizes, weights and line heights have one definition. Legacy CSS consumes generated semantic variables where native/business controls still own their typography. Button, Input, Select, Textarea, Choice, Pill and Ring use those tokens directly.
- Four self-hosted weights (400, 500, 600, 700), with font-display: swap, are defined once by the root GlobalTypography styles. No Google Fonts runtime import remains. The font files and SIL OFL license are under public/fonts/poppins/.
- Printable emergency cards reuse the same font definitions/tokens in their separate HTML document and wait for font loading before printing, with a sans-serif fallback on load failure.

## Migrated areas

65 Heading and 615 Text call sites across 79 reachable files, including the shared SectionHead adapter. 0 raw HTML heading call sites remain in active application modules. Inline emphasis within headings/text and control-owned labels retain their native semantics.

| Area | Covered flows |
|---|---|
| Public/authentication | Landing marketing copy, auth modes, PIN gate, forgot/reset password, invitation pages |
| Shell/navigation | Sidebar, mobile tab bar, account menu, global search, status/loading text |
| Home/Documents | Overview, cards, filters, document rows/tables, category/detail, preview and selection UI |
| Packages/admin | Catalogue, search, custom package dialog, drawer headings, requirements, sources and admin forms |
| Health | Overview, timeline, records/tables, medications, member forms, readings/reminders, visit packs and printable cards |
| Family/Trust/Wealth | Member/access forms, confirmation dialogs, holdings, capture/action dialogs, SOS handoff |
| Settings/shared UI | Account changes, preferences, help/data overlays, SectionHead, status/usage text |

### Exact active usage counts

| Source | Heading | Text |
|---|---:|---:|
| `src/pages/settings/index.tsx` | 0 | 4 |
| `src/design-system/components/SectionHead/index.tsx` | 1 | 1 |
| `src/components/AccountUsage.tsx` | 1 | 0 |
| `src/pages/settings/settings-ui.tsx` | 0 | 4 |
| `src/pages/settings/AccountChangeModals.tsx` | 1 | 2 |
| `src/pages/settings/PinChangeModal.tsx` | 1 | 2 |
| `src/pages/settings/PreferencesSection.tsx` | 0 | 6 |
| `src/pages/settings/SearchablePreferenceSelect.tsx` | 0 | 1 |
| `src/pages/settings/SettingsDataSections.tsx` | 0 | 7 |
| `src/components/AppShell.tsx` | 0 | 6 |
| `src/components/AccountMenu.tsx` | 0 | 4 |
| `src/components/GlobalSearch.tsx` | 0 | 4 |
| `src/components/UploadDocumentModal.tsx` | 1 | 13 |
| `src/components/AuthLayout.tsx` | 1 | 2 |
| `src/components/PinSetupGate.tsx` | 1 | 4 |
| `src/components/Landing.tsx` | 9 | 100 |
| `src/components/GoogleSignInButton.tsx` | 0 | 3 |
| `src/pages/documents/index.tsx` | 0 | 4 |
| `src/pages/documents/category-documents.tsx` | 0 | 2 |
| `src/pages/documents/document-rows.tsx` | 0 | 13 |
| `src/pages/documents/document-context-panel.tsx` | 2 | 12 |
| `src/pages/documents/file-preview.tsx` | 0 | 4 |
| `src/pages/documents/file-preview-content.tsx` | 0 | 5 |
| `src/pages/documents/file-preview-header.tsx` | 0 | 2 |
| `src/pages/documents/pending-pages-selection.tsx` | 0 | 4 |
| `src/pages/documents/document-bulk-actions.tsx` | 0 | 1 |
| `src/pages/documents/document-detail.tsx` | 0 | 10 |
| `src/pages/documents/documents-overview.tsx` | 0 | 3 |
| `src/pages/family/index.tsx` | 0 | 18 |
| `src/pages/forgot-password/index.tsx` | 1 | 3 |
| `src/pages/health/index.tsx` | 0 | 1 |
| `src/pages/health/components/HealthPageHeader.tsx` | 1 | 2 |
| `src/pages/health/HealthDialog.tsx` | 6 | 52 |
| `src/pages/health/components/HealthAttention.tsx` | 0 | 1 |
| `src/pages/health/medications/MedicationSummary.tsx` | 2 | 5 |
| `src/pages/health/medications/AddMedicationDialog.tsx` | 1 | 8 |
| `src/pages/health/members/AddMemberDialog.tsx` | 1 | 5 |
| `src/pages/health/members/MemberResolutionDialog.tsx` | 2 | 4 |
| `src/pages/health/overview/Overview.tsx` | 0 | 3 |
| `src/pages/health/overview/MetricCards.tsx` | 0 | 5 |
| `src/pages/health/overview/ReminderPanel.tsx` | 0 | 2 |
| `src/pages/health/overview/HealthReadiness.tsx` | 0 | 9 |
| `src/pages/health/overview/EmptyTracked.tsx` | 1 | 1 |
| `src/pages/health/overview/TrackedTestChooser.tsx` | 1 | 2 |
| `src/pages/health/timeline/Timeline.tsx` | 1 | 3 |
| `src/pages/health/overview/Trends.tsx` | 1 | 6 |
| `src/pages/health/components/HealthBlock.tsx` | 0 | 1 |
| `src/pages/health/records/AddRecordDialog.tsx` | 1 | 4 |
| `src/pages/health/records/DeleteRecordDialog.tsx` | 1 | 1 |
| `src/pages/health/records/MeasurementSelectionDialog.tsx` | 5 | 5 |
| `src/pages/health/records/RecordDetailModal.tsx` | 2 | 35 |
| `src/pages/health/records/Records.tsx` | 1 | 6 |
| `src/pages/home/index.tsx` | 0 | 7 |
| `src/pages/invite/index.tsx` | 1 | 6 |
| `src/pages/trust/index.tsx` | 0 | 32 |
| `src/pages/packages/index.tsx` | 0 | 3 |
| `src/pages/packages/package-detail-drawer.tsx` | 0 | 1 |
| `src/pages/packages/pack-detail.tsx` | 0 | 3 |
| `src/pages/packages/pack-change-document-dialog.tsx` | 2 | 12 |
| `src/pages/packages/pack-detail-panels.tsx` | 4 | 10 |
| `src/pages/packages/pack-detail-header.tsx` | 1 | 8 |
| `src/components/Stamp.tsx` | 0 | 1 |
| `src/pages/packages/package-list-ui.tsx` | 0 | 2 |
| `src/components/CustomPackButton.tsx` | 0 | 1 |
| `src/pages/packages/package-document-preview.tsx` | 1 | 1 |
| `src/pages/packages/package-search-panel.tsx` | 0 | 3 |
| `src/pages/packages/custom-pack-modal.tsx` | 0 | 13 |
| `src/pages/admin/packages/index.tsx` | 7 | 36 |
| `src/pages/reset-password/index.tsx` | 1 | 3 |
| `src/pages/wealth/index.tsx` | 1 | 1 |
| `src/pages/wealth/capture-proof-dialog.tsx` | 1 | 16 |
| `src/pages/wealth/record-actions-dialog.tsx` | 0 | 15 |
| `src/pages/wealth/sos-handoff-dialog.tsx` | 0 | 15 |
| `src/pages/wealth/wealth-actions.tsx` | 0 | 1 |
| `src/pages/wealth/wealth-summary.tsx` | 0 | 9 |
| `src/pages/wealth/wealth-attention.tsx` | 0 | 3 |
| `src/pages/wealth/wealth-record-section.tsx` | 0 | 2 |
| `src/pages/wealth/wealth-lent-section.tsx` | 0 | 3 |
| `src/pages/wealth/wealth-lent-row.tsx` | 0 | 3 |

## Removed duplication and justified exceptions

- Removed the Landing-only external font import; old display/mono font variables and utility references; every legacy font-family override; per-element inline font-family declarations; and duplicated typography on migrated text selectors.
- Removed SectionHead’s independent Title/Subtitle styled typography in favor of Heading/Text. No competing application Heading/Text implementation was added.
- Layout containers stay layout elements. Inline span/strong/em markup inside Heading/Text is retained for emphasis and inherited sizing. Existing links, labels, selection, field refs, table cells/colSpan and responsive layout attributes are preserved.
- Button/input/select/textarea/option content stays owned by the control; button labels and input values are not individually wrapped. Existing composite interactive rows likewise own typography through shared tokens.
- SVG chart labels stay SVG text nodes for correct namespace/geometry, using Poppins and shared tokens. The wordmark retains its existing graphic sizing API and inherits Poppins. Raster/vector artwork and uploaded PDF/image content are not rewritten as application typography.
- Unused starter components and unreachable legacy screens were not migrated to new primitives; obsolete font-family overrides and font utility names were removed from source globally.
- Concurrent design-system color/spacing/layout changes were preserved; this report describes typography work only.

## Verification

- Production build: **passed**, with the existing chunk-size warning.
- Focused typography/control/integration run: **42 tests passed across 7 files**. Includes semantic heading levels independent of size, heading/label refs, native label association, links, inline emphasis, tones in both themes, Button, Ring, native controls, Health and admin forms.
- Compile-time API checks reject invalid heading levels, unsupported Text weights, and anchor-only attributes on a label.
- Full workspace test run: **132 passed, 2 failed (134 total, 31 files)**. The remaining failures match the starting workspace: `AppShell.access.test.tsx` expects a single Health link although the responsive shell renders two, and `pack-refresh-readiness.test.tsx` expects an “Updated official checklist” source link. Typography did not change their navigation/source-generation logic.
- TypeScript: **13 starting diagnostics remain; zero added diagnostics** after normalizing line numbers. They concern admin metadata, a Health test fixture, dormant login dispatch, readiness assignment and catalogue test types.
- Focused ESLint on the new components, typography tokens, tests and plain HTML fallback helper: **passed**. Repository-wide lint still reports the same oversized-file/`any`/admin-effect issues (**9 errors, 1 warning**).
- `git diff --check`: **passed**.
- Source audit finds no old font families, font CDNs, display/mono utilities, or per-element fontFamily overrides. All remaining family rules are the central Poppins stack, shared-token rules, or inheritance. No font dependencies existed to uninstall, and all four added font files have live references.
- The four real font faces reported **loaded** in the browser (`400`, `500`, `600`, `700`). Computed families across visible application elements in the inspected pages returned only **`Poppins, sans-serif`**, including navigation, labels, form controls, and document table text.
- Browser views: **1440 × 1000 desktop**, **390 × 844 mobile**, light and dark. Inspected the real public Landing view and an isolated fixture mounting the actual AppShell, Home, Documents, Settings, medication dialog and package drawer. Verified long heading wrapping, row truncation/scrolling, selected controls, typed values, placeholders and readable text. Mobile views had no horizontal page overflow (`scrollWidth 380` within a `390` viewport).
- The fixture used sample content and stubbed reads; no login, upload, API write or live authenticated end-to-end run was performed. The checks used temporary local fixtures mounting actual product components; the production bundle was also built separately. Temporary typography fixture/configuration files were removed.
- Evidence: `/private/tmp/readiness-poppins-desktop-light.jpg` and `/private/tmp/readiness-poppins-mobile-dark.jpg`.

The standalone printable emergency-card HTML and unused error-page HTML helper cannot contain React typography components; both reuse the same Poppins font definitions and semantic typography values instead.
