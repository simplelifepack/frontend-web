import { primaryPalette } from "@/design-system/variables/colors";
import {
  typography,
  poppinsFontFaces,
  typographyVariables,
} from "@/design-system/variables/typography";

export function renderErrorPage(): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>This page didn't load</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      ${poppinsFontFaces}
      ${typographyVariables}
      :root { color-scheme: light dark; --bg: #fafafa; --text: #111827; --muted: #4b5563; --panel: #ffffff; --border: #d1d5db; --primary: ${primaryPalette.light.base}; --primary-text: ${primaryPalette.light.text}; }
      @media (prefers-color-scheme: dark) { :root { --bg: #0b1220; --text: #ffffff; --muted: #8a97ae; --panel: #131c2e; --border: #27324a; --primary: ${primaryPalette.dark.base}; --primary-text: ${primaryPalette.dark.text}; } }
      body { font: ${typography.text.md}/${typography.lineHeights.body} ${typography.family}; background: var(--bg); color: var(--text); display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
      .card { max-width: 28rem; width: 100%; text-align: center; padding: 2rem; }
      h1 { font-size: ${typography.heading.md}; font-weight: ${typography.weights.semibold}; margin: 0 0 0.5rem; }
      p { color: var(--muted); margin: 0 0 1.5rem; }
      .actions { display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; }
      a, button { padding: 0.5rem 1rem; border-radius: 0.375rem; font: inherit; cursor: pointer; text-decoration: none; border: 1px solid transparent; }
      .primary { background: var(--primary); color: var(--primary-text); }
      .secondary { background: var(--panel); color: var(--text); border-color: var(--border); }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>This page didn't load</h1>
      <p>Something went wrong on our end. You can try refreshing or head back home.</p>
      <div class="actions">
        <button class="primary" onclick="location.reload()">Try again</button>
        <a class="secondary" href="/">Go home</a>
      </div>
    </div>
  </body>
</html>`;
}
