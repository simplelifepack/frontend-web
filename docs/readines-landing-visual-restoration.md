# ReadiNes landing visual restoration

24 October 2026. No commit or deployment. This report covers the urgent landing regression repair; authenticated application changes from the ongoing UI task remain in the working tree.

## Exact cause

The uncommitted UX-audit rewrite of `src/components/Landing.tsx` replaced the approved landing composition with generic `Section`, `Container`, `Card`, and typography compositions. In doing so it removed:

- The `C` cream/ink/clay brand palette and the embedded `CSS` rules.
- `.lp-root` background, cream/deeper-cream sections, mock-card surfaces, shadows, navigation treatment, hero geometry and glow.
- `Radar`, illustrated `MomentScene` cards, the detailed feature previews, and Framer Motion entrances/decorative animation.

The replacement inherited the authenticated application's neutral light surfaces, explaining the mostly white appearance. This was a presentation rewrite, not a failed CSS import, missing font download, broken ThemeProvider, or a backend change. The audit did not authorize removal of this visual identity.

The reference is `HEAD` commit `4cb021315e3335d71916340b7768603cadee2e0d`, specifically its `src/components/Landing.tsx`, alongside all five rendered PDF pages. Reference, regressed, and restored browser captures are retained in the evidence folder. Scroll-triggered content was scrolled into view before full-page capture.

## Restored / preserved checklist

| Item | Result |
| --- | --- |
| Cream background, ink/clay hierarchy, white illustration surfaces, card borders and shadows | Restored from the prior implementation. |
| Original radar rings, sweep, hero backdrop/glow, detailed preview illustrations | Restored. Radar remains decorative and is disabled under reduced motion. |
| Four illustrated moment cards | Restored; no entrance animation, hover lift, or image zoom. Tags use the existing Poppins caption scale. |
| Hero readiness card | Original appearance restored; static position, no READY stamp, Travel paperwork 100% in green. |
| Section entrance effects | Restored on explanatory content, feature rows, and pricing. Reduced-motion support retained. |
| Final CTA | Original decorative radar retained as a static backdrop; smaller audit-approved heading and prominent button retained. |
| Navigation | Sign in retained; no duplicate Get started button or hero eyebrow. Current labelled anchors and mobile navigation retained. |
| Workflow/privacy | Still precede features, with the clarified consent/manual-processing and encrypted-storage copy. |
| Feature rows | Four alternating modules: Packages, Documents, Health, Wealth. Original detailed mock illustrations restored; separate Search feature remains removed. |
| Pricing | Current aligned card composition, billing/offer behavior, full-width CTAs and accessible semantic comparison table retained. Paid and comparison headers both use the original ink/paper brand treatment. |
| Footer | Removed family-archive sentence stays removed. Approved purple SVG remains. |
| Authentication | Repaired AuthModal function is unchanged according to normalized AST comparison. Portal dialogs continue to use the application theme. |
| Authenticated routes | Their app palette remains independent; Home, Documents and Health checked in both themes. |

Typography matches the last styled source: Poppins was already the global family before this restoration. No global font or typography-token changes were made. The PDF's suggested multi-font system is separate from the user's instruction to match the actual landing typography; no replacement family was guessed.

## Files responsible and repair files

The regression originated in the earlier modifications to `src/components/Landing.tsx`. Generic compositions added to `src/design-system/components/Stack/index.tsx` supplied the replacement surfaces; the components themselves were not missing their stylesheet or theme. They have not been reverted or globally recolored.

Restoration files:

- `src/components/Landing.tsx`: restored hero/background composition and original visual components; retains current audit copy/order, pricing, anchors, and auth behavior.
- `src/components/LandingVisuals.tsx`: exports the restored presentation building blocks.
- `src/components/landing/{Radar,ReadinessMock,PackDetail,DocGraph,HealthMock,WealthMock,MomentScene,MomentCard}.tsx` and `motion.ts`: original artwork and decorative/entrance behavior, with the audit-specific static exclusions.
- `src/design-system/variables/brand.ts`: the approved prior landing palette, transferred without choosing a new palette.
- `src/design-system/components/BrandSurface/{index.tsx,legacy.ts}`: scoped brand surface, original decorative rules, static callout and matching pricing header treatment.
- `src/components/Landing.test.tsx`: browser-observer stub for unit testing the restored Framer Motion consumers; existing interaction assertions retained.

No application-wide theme, global typography, stylesheet import, backend API, store, or routing change was needed for this repair. The brand variables live inside BrandSurface; they do not replace the app's tokens. Existing historical illustration/SVG inline declarations and decorative CSS have been restored rather than indiscriminately stripped. New scope/layout work uses the shared design-system family. No new page-specific class names, Tailwind utilities, or font families were invented. This repair does not claim to have migrated every historical artwork declaration away from its original representation.

## Validation

- TypeScript: passes, no diagnostics.
- Build: passes; existing chunk-size advisory remains.
- Focused lint on restored visual/design-system modules and landing tests: passes.
- Full lint: seven existing file-size errors and one Package Admin hook-dependency warning remain. No lint rule disabled.
- Focused tests: 2 files, 7 tests pass, including landing/auth and password visibility.
- Full tests: 35 files pass, 1 fails; 152 tests pass and the same 3 previously established UploadDocumentModal tests fail. That pre-existing dirty component was not edited by this restoration.
- Playwright: seven viewport widths (320, 375, 390, 768, 1024, 1440, 1920), both saved app-theme preferences; checks branded background, section order, four illustrated cards, 100% progress, typography, no page overflow, and auth open/password visibility/Escape close.
- Motion checks: decorative radar changes over time with normal motion; hero-card position is stable, moment hover transform does not change, final CTA radar remains static, reduced-motion radar remains static.
- Scope checks: normalized AuthModal source is unchanged; `main.tsx`, global CSS, global color/theme/typography files unchanged. Six authenticated-route/theme-isolation checks pass.
- `git diff --check`: passes.

The public landing retains its approved cream brand treatment under either saved application theme, as in the prior design; authenticated pages and portal dialogs retain their separate light/dark theme behavior. Browser checks used local synthetic auth responses, not a real login, provider authorization, or production write.

## Evidence

[Evidence folder](/Users/ranjith/.codex/visualizations/2026/10/24/01a16d42-a440-7293-8cec-139f325848a6/readines-landing-restoration)

- [Before regression / reference](/Users/ranjith/.codex/visualizations/2026/10/24/01a16d42-a440-7293-8cec-139f325848a6/readines-landing-restoration/reference-desktop.png)
- [Regressed](/Users/ranjith/.codex/visualizations/2026/10/24/01a16d42-a440-7293-8cec-139f325848a6/readines-landing-restoration/regressed-desktop.png)
- [Restored hero](/Users/ranjith/.codex/visualizations/2026/10/24/01a16d42-a440-7293-8cec-139f325848a6/readines-landing-restoration/final-hero-desktop.png)
- [Restored artwork](/Users/ranjith/.codex/visualizations/2026/10/24/01a16d42-a440-7293-8cec-139f325848a6/readines-landing-restoration/final-artwork-desktop.png)
- [Pricing](/Users/ranjith/.codex/visualizations/2026/10/24/01a16d42-a440-7293-8cec-139f325848a6/readines-landing-restoration/final-pricing-desktop.png)
- [Mobile full page](/Users/ranjith/.codex/visualizations/2026/10/24/01a16d42-a440-7293-8cec-139f325848a6/readines-landing-restoration/final-light-390.png)

The earlier audit implementation report's removal of the landing palette/decorative styling is superseded by this restoration. Remaining full-suite/lint failures are listed above rather than described as passing.
