# Frontend Security Headers

Production Vercel responses set a CSP in `vercel.json`.

`style-src 'unsafe-inline'` is intentionally retained because the current React app uses inline `style` props across authenticated document, package, health, and wealth flows, and Google Sign-In injects its own inline style attributes. `script-src` does not allow `unsafe-inline` or `unsafe-eval`.

`connect-src` allows the app origin, Google Sign-In telemetry, and the Readiness backend production domains. Replace the `*.vercel.app` fallback with the exact backend origin once the production API hostname is fixed.
