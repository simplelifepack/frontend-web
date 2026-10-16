# Active product UI inventory

Traced from `src/main.tsx`, including lazy route imports, conditional dialogs and drawers. 158 reachable modules before refactoring. This is a static reachability audit; runtime verification is recorded below.

## Existing shared implementations and callers

### `src/components/SectionHead.tsx`

- `src/pages/settings/index.tsx`
- `src/pages/documents/category-documents.tsx`
- `src/pages/documents/documents-overview.tsx`
- `src/pages/family/index.tsx`
- `src/pages/health/components/HealthPageHeader.tsx`
- `src/pages/home/index.tsx`
- `src/pages/trust/index.tsx`
- `src/pages/packages/index.tsx`
- `src/pages/wealth/index.tsx`

### `src/design-system/components/Button/index.tsx`

- `src/design-system/index.ts`

### `src/components/AccountUsage.tsx`

- `src/pages/settings/index.tsx`
- `src/pages/packages/index.tsx`

### `src/components/Card.tsx`

- `src/components/AccountUsage.tsx`
- `src/pages/settings/settings-ui.tsx`
- `src/pages/documents/index.tsx`
- `src/pages/documents/category-documents.tsx`
- `src/pages/documents/document-rows.tsx`
- `src/pages/documents/file-preview.tsx`
- `src/pages/documents/file-preview-content.tsx`
- `src/pages/documents/document-detail.tsx`
- `src/pages/documents/documents-overview.tsx`
- `src/pages/family/index.tsx`
- `src/pages/health/index.tsx`
- `src/pages/health/medications/MedicationSummary.tsx`
- `src/pages/health/overview/Overview.tsx`
- `src/pages/health/overview/MetricCards.tsx`
- `src/pages/health/overview/ReminderPanel.tsx`
- `src/pages/health/overview/HealthReadiness.tsx`
- `src/pages/health/overview/EmptyTracked.tsx`
- `src/pages/health/timeline/Timeline.tsx`
- `src/pages/health/overview/Trends.tsx`
- `src/pages/health/records/Records.tsx`
- `src/pages/home/index.tsx`
- `src/pages/invite/index.tsx`
- `src/pages/trust/index.tsx`
- `src/pages/packages/package-list-ui.tsx`
- `src/pages/wealth/wealth-summary.tsx`
- `src/pages/wealth/wealth-attention.tsx`
- `src/pages/wealth/wealth-record-section.tsx`
- `src/pages/wealth/wealth-lent-section.tsx`

### `src/components/ui/tooltip.tsx`

- `src/components/AccountUsage.tsx`
- `src/components/CustomPackButton.tsx`

### `src/components/AppShell.tsx`

- `src/App.tsx`

### `src/components/AccountMenu.tsx`

- `src/components/AppShell.tsx`

### `src/components/BrandLogo.tsx`

- `src/components/AppShell.tsx`
- `src/components/AuthLayout.tsx`
- `src/components/PinSetupGate.tsx`
- `src/components/Landing.tsx`
- `src/pages/forgot-password/index.tsx`
- `src/pages/reset-password/index.tsx`

### `src/components/GlobalSearch.tsx`

- `src/components/AppShell.tsx`

### `src/components/appShellNav.ts`

- `src/components/AppShell.tsx`

### `src/components/UploadDocumentModal.tsx`

- `src/components/AppShell.tsx`
- `src/pages/health/HealthDialog.tsx`
- `src/pages/packages/pack-change-document-dialog.tsx`
- `src/pages/packages/custom-pack-modal.tsx`
- `src/pages/wealth/capture-proof-dialog.tsx`

### `src/components/AuthLayout.tsx`

- `src/App.tsx`

### `src/components/ProtectedRoute.tsx`

- `src/App.tsx`

### `src/components/BootstrapSkeleton.tsx`

- `src/components/ProtectedRoute.tsx`
- `src/components/SessionGate.tsx`

### `src/components/PinSetupGate.tsx`

- `src/components/ProtectedRoute.tsx`

### `src/components/SessionGate.tsx`

- `src/App.tsx`

### `src/components/Landing.tsx`

- `src/pages/landing/index.tsx`

### `src/components/GoogleSignInButton.tsx`

- `src/components/Landing.tsx`

### `src/components/Pill.tsx`

- `src/pages/documents/document-detail.tsx`
- `src/pages/health/overview/Trends.tsx`

### `src/components/Ring.tsx`

- `src/pages/home/index.tsx`
- `src/pages/packages/pack-detail-header.tsx`
- `src/pages/packages/package-list-ui.tsx`

### `src/components/Stamp.tsx`

- `src/pages/packages/pack-detail-header.tsx`
- `src/pages/packages/package-list-ui.tsx`

### `src/components/CustomPackButton.tsx`

- `src/pages/packages/package-list-ui.tsx`
- `src/pages/packages/package-search-panel.tsx`

### `src/components/ui/sonner.tsx`

- `src/main.tsx`

## Classification and consolidation decisions

| UI                                                                                                               | Decision                                                                  | Duplicate appearance                                         |
| ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Button                                                                                                           | Reuse existing design-system implementation, four variants                | Existing Button migration is preserved                       |
| Card                                                                                                             | Consolidate active shared Card; flush and danger are reusable differences | Repeated zero padding/overflow, page borders and backgrounds |
| Pill                                                                                                             | Consolidate existing status primitive                                     | Inline color maps, typography, spacing                       |
| Ring                                                                                                             | Consolidate existing progress primitive                                   | Inline geometry presentation and score typography            |
| SectionHead                                                                                                      | Consolidate visual header; keep upload event in product adapter           | Inline heading/subtitle typography                           |
| Stamp                                                                                                            | Keep package READY stamp as business UI                                   | Package-specific meaning and presentation                    |
| Input, Textarea, Select                                                                                          | Consolidate active native controls                                        | Inline fieldStyle/inputStyle/inp, CSS route field selectors  |
| Checkbox, Radio                                                                                                  | Consolidate native controls                                               | Accent, focus and disabled styling                           |
| Modal surfaces                                                                                                   | Consolidate backdrop and surface, preserve caller interaction handlers    | Repeated fixed scrims, panel background/border/shadow        |
| Tooltip                                                                                                          | Reuse active Radix implementation with styled appearance                  | Tailwind surface/typography                                  |
| Toaster                                                                                                          | Reuse Sonner behavior with styled appearance                              | Utility-class theme overrides                                |
| AppShell, AuthLayout, BootstrapSkeleton                                                                          | Keep layout/composition                                                   | Responsive navigation and loading screen composition         |
| UploadDocumentModal, GlobalSearch, AccountMenu, AccountUsage, GoogleSignInButton, PinSetupGate, CustomPackButton | Keep business components                                                  | API, auth, navigation, quota and product events              |
| Health, package, document, wealth dialogs/drawers                                                                | Keep business composition, migrate their primitive fields/surfaces        | Conditional forms and content remain local                   |

## Active native-control and overlay locations

- `src/pages/settings/index.tsx`: input
- `src/pages/settings/AccountChangeModals.tsx`: input
- `src/pages/settings/PinChangeModal.tsx`: input
- `src/pages/settings/SearchablePreferenceSelect.tsx`: input
- `src/pages/settings/SettingsDataSections.tsx`: input
- `src/components/GlobalSearch.tsx`: input
- `src/components/UploadDocumentModal.tsx`: lp-modal-backdrop, lp-modal-panel, input, select
- `src/components/PinSetupGate.tsx`: input
- `src/components/Landing.tsx`: input
- `src/pages/documents/file-preview-header.tsx`: input
- `src/pages/documents/documents-overview.tsx`: input, select
- `src/pages/family/index.tsx`: input, select
- `src/pages/forgot-password/index.tsx`: input
- `src/pages/health/HealthDialog.tsx`: lp-modal-backdrop, lp-modal-panel, input, select, textarea
- `src/pages/health/medications/MedicationSummary.tsx`: lp-modal-backdrop, lp-modal-panel
- `src/pages/health/medications/AddMedicationDialog.tsx`: lp-modal-backdrop, lp-modal-panel, input
- `src/pages/health/members/AddMemberDialog.tsx`: lp-modal-backdrop, lp-modal-panel, input, select
- `src/pages/health/members/MemberResolutionDialog.tsx`: lp-modal-backdrop, lp-modal-panel, select
- `src/pages/health/overview/TrackedTestChooser.tsx`: lp-modal-backdrop, lp-modal-panel
- `src/pages/health/overview/Trends.tsx`: input
- `src/pages/health/records/AddRecordDialog.tsx`: lp-modal-backdrop, lp-modal-panel, input, select
- `src/pages/health/records/DeleteRecordDialog.tsx`: lp-modal-backdrop, lp-modal-panel
- `src/pages/health/records/MeasurementSelectionDialog.tsx`: lp-modal-backdrop, lp-modal-panel, select, input
- `src/pages/health/records/RecordDetailModal.tsx`: lp-modal-backdrop, lp-modal-panel
- `src/pages/invite/index.tsx`: input
- `src/pages/trust/index.tsx`: select, input
- `src/pages/packages/pack-change-document-dialog.tsx`: lp-modal-backdrop, lp-modal-panel, input
- `src/pages/packages/pack-detail-panels.tsx`: input
- `src/pages/packages/package-search-panel.tsx`: input
- `src/pages/packages/custom-pack-modal.tsx`: lp-modalwrap, lp-modalbox, textarea, input
- `src/pages/admin/packages/index.tsx`: input, select, textarea
- `src/pages/reset-password/index.tsx`: input
- `src/pages/wealth/capture-proof-dialog.tsx`: lp-modalwrap, lp-modalbox, input, select, textarea
- `src/pages/wealth/record-actions-dialog.tsx`: lp-modalwrap, lp-modalbox, input, textarea, select
- `src/pages/wealth/sos-handoff-dialog.tsx`: lp-modalwrap, lp-modalbox, input

## Unused starter UI — excluded

`accordion.tsx`, `alert-dialog.tsx`, `alert.tsx`, `aspect-ratio.tsx`, `avatar.tsx`, `badge.tsx`, `breadcrumb.tsx`, `calendar.tsx`, `card.tsx`, `carousel.tsx`, `checkbox.tsx`, `collapsible.tsx`, `command.tsx`, `context-menu.tsx`, `dialog.tsx`, `drawer.tsx`, `dropdown-menu.tsx`, `form.tsx`, `hover-card.tsx`, `input-otp.tsx`, `input.tsx`, `label.tsx`, `menubar.tsx`, `navigation-menu.tsx`, `pagination.tsx`, `popover.tsx`, `progress.tsx`, `radio-group.tsx`, `resizable.tsx`, `scroll-area.tsx`, `select.tsx`, `separator.tsx`, `sheet.tsx`, `skeleton.tsx`, `slider.tsx`, `switch.tsx`, `table.tsx`, `tabs.tsx`, `textarea.tsx`, `toggle-group.tsx`, `toggle.tsx`. These are not migrated or deleted. Login/signup page modules are also unreachable; public authentication runs through Landing.

## Implemented consolidation and active usage locations

Counts are JSX call sites in the route-reachable modules, not runtime instance counts. The existing Button migration was present when work started and was retained, then extended for the package action menu.

| Component | Active JSX call sites | Source files |
|---|---:|---:|
| Toaster | 1 | 1 |
| DrawerContainer | 1 | 1 |
| Button | 249 | 64 |
| Card | 47 | 29 |
| Checkbox | 6 | 5 |
| Choice | 15 | 10 |
| ChoiceGroup | 11 | 8 |
| DrawerBackdrop | 4 | 3 |
| DrawerPanel | 3 | 3 |
| Input | 104 | 22 |
| ModalBackdrop | 28 | 22 |
| ModalPanel | 30 | 24 |
| Pill | 5 | 2 |
| Radio | 2 | 1 |
| Ring | 3 | 3 |
| SearchField | 5 | 5 |
| SectionHead | 1 | 1 |
| Select | 28 | 12 |
| Switch | 1 | 1 |
| SwitchIndicator | 1 | 1 |
| Textarea | 12 | 5 |
| Tooltip | 2 | 2 |
| TooltipContent | 2 | 2 |
| TooltipProvider | 2 | 2 |
| TooltipTrigger | 2 | 2 |

### Exact usage locations after migration

**Toaster**

- `src/main.tsx`

**DrawerContainer**

- `src/pages/packages/package-detail-drawer.tsx`

**Button**

- `src/components/SectionHead.tsx`
- `src/pages/settings/settings-ui.tsx`
- `src/pages/settings/AccountChangeModals.tsx`
- `src/pages/settings/PinChangeModal.tsx`
- `src/pages/settings/PreferencesSection.tsx`
- `src/pages/settings/SearchablePreferenceSelect.tsx`
- `src/pages/settings/SettingsDataSections.tsx`
- `src/components/AppShell.tsx`
- `src/components/UploadDocumentModal.tsx`
- `src/components/ProtectedRoute.tsx`
- `src/components/PinSetupGate.tsx`
- `src/components/SessionGate.tsx`
- `src/components/Landing.tsx`
- `src/components/GoogleSignInButton.tsx`
- `src/pages/documents/index.tsx`
- `src/pages/documents/category-documents.tsx`
- `src/pages/documents/document-context-panel.tsx`
- `src/pages/documents/file-preview-header.tsx`
- `src/pages/documents/pending-pages-selection.tsx`
- `src/pages/documents/document-bulk-actions.tsx`
- `src/pages/documents/document-detail.tsx`
- `src/pages/documents/documents-overview.tsx`
- `src/pages/family/index.tsx`
- `src/pages/forgot-password/index.tsx`
- `src/pages/health/components/HealthPageHeader.tsx`
- `src/pages/health/HealthDialog.tsx`
- `src/pages/health/medications/MedicationSummary.tsx`
- `src/pages/health/medications/AddMedicationDialog.tsx`
- `src/pages/health/members/AddMemberDialog.tsx`
- `src/pages/health/members/MemberResolutionDialog.tsx`
- `src/pages/health/overview/Overview.tsx`
- `src/pages/health/overview/ReminderPanel.tsx`
- `src/pages/health/overview/HealthReadiness.tsx`
- `src/pages/health/overview/EmptyTracked.tsx`
- `src/pages/health/overview/TrackedTestChooser.tsx`
- `src/pages/health/overview/Trends.tsx`
- `src/pages/health/records/AddRecordDialog.tsx`
- `src/pages/health/records/DeleteRecordDialog.tsx`
- `src/pages/health/records/MeasurementSelectionDialog.tsx`
- `src/pages/health/records/RecordDetailModal.tsx`
- `src/pages/health/records/Records.tsx`
- `src/pages/home/index.tsx`
- `src/pages/invite/index.tsx`
- `src/pages/trust/index.tsx`
- `src/pages/packages/index.tsx`
- `src/pages/packages/package-detail-drawer.tsx`
- `src/pages/packages/pack-change-document-dialog.tsx`
- `src/pages/packages/pack-detail-panels.tsx`
- `src/pages/packages/pack-detail-header.tsx`
- `src/components/CustomPackButton.tsx`
- `src/pages/packages/package-document-preview.tsx`
- `src/pages/packages/package-search-panel.tsx`
- `src/pages/packages/custom-pack-modal.tsx`
- `src/pages/admin/packages/index.tsx`
- `src/pages/reset-password/index.tsx`
- `src/pages/wealth/index.tsx`
- `src/pages/wealth/capture-proof-dialog.tsx`
- `src/pages/wealth/record-actions-dialog.tsx`
- `src/pages/wealth/sos-handoff-dialog.tsx`
- `src/pages/wealth/wealth-actions.tsx`
- `src/pages/wealth/wealth-summary.tsx`
- `src/pages/wealth/wealth-attention.tsx`
- `src/pages/wealth/wealth-lent-section.tsx`
- `src/pages/wealth/wealth-lent-row.tsx`

**Card**

- `src/components/AccountUsage.tsx`
- `src/pages/settings/settings-ui.tsx`
- `src/pages/settings/SearchablePreferenceSelect.tsx`
- `src/pages/documents/index.tsx`
- `src/pages/documents/category-documents.tsx`
- `src/pages/documents/document-rows.tsx`
- `src/pages/documents/file-preview.tsx`
- `src/pages/documents/file-preview-content.tsx`
- `src/pages/documents/document-detail.tsx`
- `src/pages/documents/documents-overview.tsx`
- `src/pages/family/index.tsx`
- `src/pages/health/index.tsx`
- `src/pages/health/medications/MedicationSummary.tsx`
- `src/pages/health/overview/Overview.tsx`
- `src/pages/health/overview/MetricCards.tsx`
- `src/pages/health/overview/ReminderPanel.tsx`
- `src/pages/health/overview/HealthReadiness.tsx`
- `src/pages/health/overview/EmptyTracked.tsx`
- `src/pages/health/timeline/Timeline.tsx`
- `src/pages/health/overview/Trends.tsx`
- `src/pages/health/records/Records.tsx`
- `src/pages/home/index.tsx`
- `src/pages/invite/index.tsx`
- `src/pages/trust/index.tsx`
- `src/pages/packages/package-list-ui.tsx`
- `src/pages/wealth/wealth-summary.tsx`
- `src/pages/wealth/wealth-attention.tsx`
- `src/pages/wealth/wealth-record-section.tsx`
- `src/pages/wealth/wealth-lent-section.tsx`

**Checkbox**

- `src/pages/family/index.tsx`
- `src/pages/packages/pack-detail-panels.tsx`
- `src/pages/admin/packages/index.tsx`
- `src/pages/wealth/capture-proof-dialog.tsx`
- `src/pages/wealth/sos-handoff-dialog.tsx`

**Choice**

- `src/pages/settings/PreferencesSection.tsx`
- `src/pages/settings/SearchablePreferenceSelect.tsx`
- `src/components/Landing.tsx`
- `src/pages/documents/documents-overview.tsx`
- `src/pages/health/components/HealthPageHeader.tsx`
- `src/pages/health/HealthDialog.tsx`
- `src/pages/health/medications/MedicationSummary.tsx`
- `src/pages/health/medications/AddMedicationDialog.tsx`
- `src/pages/packages/package-list-ui.tsx`
- `src/pages/wealth/wealth-filters.tsx`

**ChoiceGroup**

- `src/pages/settings/PreferencesSection.tsx`
- `src/components/Landing.tsx`
- `src/pages/documents/documents-overview.tsx`
- `src/pages/health/components/HealthPageHeader.tsx`
- `src/pages/health/HealthDialog.tsx`
- `src/pages/health/medications/AddMedicationDialog.tsx`
- `src/pages/packages/package-list-ui.tsx`
- `src/pages/wealth/wealth-filters.tsx`

**DrawerBackdrop**

- `src/pages/documents/document-context-panel.tsx`
- `src/pages/packages/package-document-preview.tsx`
- `src/pages/wealth/wealth-actions.tsx`

**DrawerPanel**

- `src/pages/documents/document-context-panel.tsx`
- `src/pages/packages/package-detail-drawer.tsx`
- `src/pages/wealth/wealth-actions.tsx`

**Input**

- `src/pages/settings/index.tsx`
- `src/pages/settings/AccountChangeModals.tsx`
- `src/pages/settings/PinChangeModal.tsx`
- `src/pages/settings/SettingsDataSections.tsx`
- `src/components/UploadDocumentModal.tsx`
- `src/components/PinSetupGate.tsx`
- `src/components/Landing.tsx`
- `src/pages/family/index.tsx`
- `src/pages/forgot-password/index.tsx`
- `src/pages/health/HealthDialog.tsx`
- `src/pages/health/medications/AddMedicationDialog.tsx`
- `src/pages/health/members/AddMemberDialog.tsx`
- `src/pages/health/overview/Trends.tsx`
- `src/pages/health/records/MeasurementSelectionDialog.tsx`
- `src/pages/invite/index.tsx`
- `src/pages/trust/index.tsx`
- `src/pages/packages/pack-change-document-dialog.tsx`
- `src/pages/packages/custom-pack-modal.tsx`
- `src/pages/admin/packages/index.tsx`
- `src/pages/reset-password/index.tsx`
- `src/pages/wealth/capture-proof-dialog.tsx`
- `src/pages/wealth/record-actions-dialog.tsx`

**ModalBackdrop**

- `src/pages/settings/settings-ui.tsx`
- `src/pages/settings/AccountChangeModals.tsx`
- `src/pages/settings/PinChangeModal.tsx`
- `src/components/UploadDocumentModal.tsx`
- `src/components/Landing.tsx`
- `src/pages/family/index.tsx`
- `src/pages/health/HealthDialog.tsx`
- `src/pages/health/medications/MedicationSummary.tsx`
- `src/pages/health/medications/AddMedicationDialog.tsx`
- `src/pages/health/members/AddMemberDialog.tsx`
- `src/pages/health/members/MemberResolutionDialog.tsx`
- `src/pages/health/overview/TrackedTestChooser.tsx`
- `src/pages/health/records/AddRecordDialog.tsx`
- `src/pages/health/records/DeleteRecordDialog.tsx`
- `src/pages/health/records/MeasurementSelectionDialog.tsx`
- `src/pages/health/records/RecordDetailModal.tsx`
- `src/pages/trust/index.tsx`
- `src/pages/packages/pack-change-document-dialog.tsx`
- `src/pages/packages/custom-pack-modal.tsx`
- `src/pages/wealth/capture-proof-dialog.tsx`
- `src/pages/wealth/record-actions-dialog.tsx`
- `src/pages/wealth/sos-handoff-dialog.tsx`

**ModalPanel**

- `src/pages/settings/settings-ui.tsx`
- `src/pages/settings/AccountChangeModals.tsx`
- `src/pages/settings/PinChangeModal.tsx`
- `src/components/UploadDocumentModal.tsx`
- `src/components/Landing.tsx`
- `src/pages/documents/document-context-panel.tsx`
- `src/pages/family/index.tsx`
- `src/pages/health/HealthDialog.tsx`
- `src/pages/health/medications/MedicationSummary.tsx`
- `src/pages/health/medications/AddMedicationDialog.tsx`
- `src/pages/health/members/AddMemberDialog.tsx`
- `src/pages/health/members/MemberResolutionDialog.tsx`
- `src/pages/health/overview/TrackedTestChooser.tsx`
- `src/pages/health/records/AddRecordDialog.tsx`
- `src/pages/health/records/DeleteRecordDialog.tsx`
- `src/pages/health/records/MeasurementSelectionDialog.tsx`
- `src/pages/health/records/RecordDetailModal.tsx`
- `src/pages/trust/index.tsx`
- `src/pages/packages/pack-change-document-dialog.tsx`
- `src/pages/packages/package-document-preview.tsx`
- `src/pages/packages/custom-pack-modal.tsx`
- `src/pages/wealth/capture-proof-dialog.tsx`
- `src/pages/wealth/record-actions-dialog.tsx`
- `src/pages/wealth/sos-handoff-dialog.tsx`

**Pill**

- `src/pages/documents/document-detail.tsx`
- `src/pages/health/overview/Trends.tsx`

**Radio**

- `src/pages/packages/pack-change-document-dialog.tsx`

**Ring**

- `src/pages/home/index.tsx`
- `src/pages/packages/pack-detail-header.tsx`
- `src/pages/packages/package-list-ui.tsx`

**SearchField**

- `src/pages/settings/SearchablePreferenceSelect.tsx`
- `src/components/GlobalSearch.tsx`
- `src/pages/documents/documents-overview.tsx`
- `src/pages/packages/package-search-panel.tsx`
- `src/pages/admin/packages/index.tsx`

**SectionHead**

- `src/components/SectionHead.tsx`

**Select**

- `src/components/UploadDocumentModal.tsx`
- `src/pages/documents/documents-overview.tsx`
- `src/pages/family/index.tsx`
- `src/pages/health/HealthDialog.tsx`
- `src/pages/health/members/AddMemberDialog.tsx`
- `src/pages/health/members/MemberResolutionDialog.tsx`
- `src/pages/health/records/AddRecordDialog.tsx`
- `src/pages/health/records/MeasurementSelectionDialog.tsx`
- `src/pages/trust/index.tsx`
- `src/pages/admin/packages/index.tsx`
- `src/pages/wealth/capture-proof-dialog.tsx`
- `src/pages/wealth/record-actions-dialog.tsx`

**Switch**

- `src/pages/settings/PreferencesSection.tsx`

**SwitchIndicator**

- `src/pages/settings/NotificationSettingsRow.tsx`

**Textarea**

- `src/pages/health/HealthDialog.tsx`
- `src/pages/packages/custom-pack-modal.tsx`
- `src/pages/admin/packages/index.tsx`
- `src/pages/wealth/capture-proof-dialog.tsx`
- `src/pages/wealth/record-actions-dialog.tsx`

**Tooltip**

- `src/components/AccountUsage.tsx`
- `src/components/CustomPackButton.tsx`

**TooltipContent**

- `src/components/AccountUsage.tsx`
- `src/components/CustomPackButton.tsx`

**TooltipProvider**

- `src/components/AccountUsage.tsx`
- `src/components/CustomPackButton.tsx`

**TooltipTrigger**

- `src/components/AccountUsage.tsx`
- `src/components/CustomPackButton.tsx`

### Appearance and theme ownership

- Every consolidated component has `index.tsx`, `styles.ts`, and `types.ts`. Existing semantic colors, spacing, typography and radius scales were extended in `variables/`. Public component props stay in `types.ts`; transient styling state is kept private.
- `lightTheme` and `darkTheme` are typed and selected by the existing ThemeProvider. Both use the existing semantic CSS-variable palette, so there is one palette source for migrated and legacy product compositions. Appearance updates and cross-tab storage changes synchronize the provider and root CSS theme through `lib/theme.ts`. This deliberately preserves the existing root palette rather than adding a competing palette.
- Added field focus, invalid, disabled and read-only states; selected Choice and Switch states; native checkbox/radio appearance; themed portal surfaces; reduced-motion handling for the moved progress ring. Dark primary-action text now uses the dark ink token for contrast.
- Card supports a shared flush surface and danger border. ModalPanel supports flush content and native form/section rendering. DrawerPanel supports right drawers and bottom sheets. Button remains limited to primary, secondary, tertiary and default variants; the existing danger tone is orthogonal to those variants.

### Removed duplication and obsolete implementations

- Removed `src/components/Card.tsx`, `Pill.tsx`, and `Ring.tsx` after redirecting imports, including dormant callers/tests that still referenced them. No parallel Card/Pill/Ring implementation remains.
- Removed active `src/components/ui/tooltip.tsx` and `sonner.tsx`; the Radix portal and Sonner behavior are reused in the design system. Unused starter primitives, including the separate unused starter Card, are left untouched.
- SectionHead is now a product adapter containing the upload event only; its header appearance moved to the shared component.
- Removed inline field appearance from Landing/auth, family, trust, upload, Health, Wealth capture and settings; retained only layout values such as width and margins. Removed obsolete field CSS appearance rather than retaining a second set of styles behind exclusions.
- Removed base modal scrim/panel CSS, shared Card surface overrides, repeated search wrapper borders/backgrounds, choice/filter/tab styles, the hardcoded light medication-status buttons, package Add/menu action styling, drawer surface styling, and duplicate notification/AI-switch track/thumb styling. Existing native file pickers remain native.
- Replaced active preview modal surfaces in both document and package flows. Workflow handlers, refs, native inputs, submit handlers and navigation remain in callers.

## Remaining exceptions

- Branded Landing illustrations/marketing compositions, BrandLogo, and package READY Stamp remain product artwork/composition, not generic primitives.
- AppShell, AuthLayout, BootstrapSkeleton and page grid/responsive styles remain layouts. Settings rows, Health record/measurement rows, document rows, package requirement rows, search results and Wealth records remain clickable business compositions; their content-specific presentation remains local.
- The existing country preference selector remains a settings composition; its trigger, search input, popup surface and choices now reuse shared primitives. Country/currency data and formatting stay local.
- Report/document viewers and printable emergency/insurance cards retain document-specific paper styling. Chart geometry and document/category colors remain domain presentation.
- Native file/hidden inputs and upload dropzones retain file-selection/drop behavior. The dormant Gmail/Drive dialogs and unreachable legacy login/signup modules are not migrated.
- Generic surfaces preserve existing callers’ accessibility semantics, focus/escape handlers and scroll locking. This refactor does not replace those workflows with a new dialog controller or add a new focus-trap behavior.
- The pre-existing working tree contained broad Button, session/auth and other changes; unrelated behavior was not reverted or folded into this refactor.


## Route and conditional-flow coverage

- `/` and `/landing`: Landing authentication dialog, email/password, signup, PIN, forgotten-password states. `/login`, `/signin`, and `/signup` redirect into it; old login/signup modules are not rendered.
- `/forgot-password`, `/reset-password`, `/invite/:token`: standalone authentication/invitation forms.
- Protected routes run through SessionGate, ProtectedRoute and AppShell, including the PIN setup gate and global upload, search and account-menu flows.
- `/home`: summary Cards and Ring; `/packages`: category choices, results, custom-pack modal, package drawer, requirement actions, change-document modal, and document preview. `/coffee/packages`: admin search, add/edit/source/requirement forms and CSV upload.
- `/documents`, `/documents/:category`, `/documents/:category/:documentId`: overview filters, category/detail Cards, document context drawer, bulk actions, file previews and pending-page selection. Gmail/Drive dialog imports and renders are commented out and excluded.
- `/health`: Overview, Timeline, Medications and Records tabs; add/edit member, member resolution, medication creation/status/deletion, add/delete record, record detail and measurement selection, manual readings, tracked-test selection, reminders, visit-pack and printable-card dialogs.
- `/family` and `/trust`: member editing/invitations, emergency-access controls, remove confirmation and Trust permissions composition.
- `/wealth`: record/capture-proof/edit/action dialogs, SOS handoff, category choices, and mobile action sheet.
- `/settings`: account email/password and PIN modals, country search, appearance, notification and AI preferences, confirmation overlays and data controls. `/legacy` remains its existing page composition.

## Verification results

- Production build: **passed**. Vite retains its existing warning for chunks larger than 500 kB.
- Focused integration/component checks: **36 passed across 7 files**, covering Button, Ring, UploadDocumentModal, Health workflows, admin package creation and the new native-control/theme integration tests.
- Full Vitest suite: **119 passed, 2 failed (121 total, 29 files)**. Remaining failures are `AppShell.access.test.tsx` (expects one Health link; the responsive shell renders two) and `pack-refresh-readiness.test.tsx` (expects an “Updated official checklist” source link). Their navigation/source-generation behavior is outside this styling refactor. The admin test caught and verified the repair of an over-broad search-field replacement that had removed labels.
- Focused ESLint for design-system, main/theme wiring, SectionHead adapter and preference selector: **passed**.
- Repository-wide lint: **9 errors and 1 warning**, involving existing oversized files, Landing `any` annotations and the admin effect dependency. No new design-system lint errors.
- TypeScript: **13 baseline diagnostics remain**, with no added diagnostics. The old Card rejecting the existing `id` prop on the Wealth lent section is resolved by standard native div props. Remaining diagnostics concern admin metadata, Health test data, dormant login dispatch, readiness assignment and catalogue tests.
- `git diff --check`: **passed**. No references remain to the five removed implementations.
- Browser verification used **1440 × 1000 desktop and 390 × 844 mobile viewports**, light and dark. Inspected all four Button variants, danger, disabled/loading, Card, Pill, Ring, form fields, search, native checkbox/radio, Switch, Choice, invalid/disabled fields, keyboard focus, portal tooltip, and light/dark notifications. Opened the actual medication form, selected times/meals, validated its disabled submit state and simulated an error without API calls; inspected package drawer loading and Wealth mobile action-sheet surfaces. Shared-control layout had no horizontal overflow in the mobile fixture.
- Also checked the actual public landing/email sign-in form at desktop and mobile widths without submitting credentials. Other authenticated compositions were traced statically and exercised by the existing tests and an isolated temporary visual fixture; a live authenticated end-to-end data pass was **not performed**.
- The temporary visual fixture was removed. No demo route or speculative showcase component ships with the product.

Mobile sign-in verification evidence: `/private/tmp/readiness-ui-mobile-signin.jpg`.

## Foundation follow-up — 15 October 2026

See `design-system-foundations.md` for the current token ownership, native Field composition, body portals, focus containment/restoration, scoped Escape handling, shared chart palette, keyboard menu behavior, and latest verification. This supersedes the earlier exceptions about leaving modal focus management and chart colors local. The earlier verification section records the preceding migration, not this follow-up.
