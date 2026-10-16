Import `Button` and its prop types from `@/design-system`.

- `variant`: `primary` (main action), `secondary` (supporting action or cancel), `tertiary` (lightweight action or close), `default` (neutral action; the default).
- `size`: `sm`, `md` (default), `lg`.
- `tone`: `neutral` (default), `danger`. Use danger for destructive actions at any hierarchy level.
- `iconOnly`: square control using the selected size. Provide an accessible label.
- `startIcon`, `endIcon`: optional icons; icons can also remain children.
- `loading`, `loadingText`, `loadingIndicator`: loading disables activation and exposes `aria-busy`. The existing label is retained unless loadingText is supplied.
- `asChild`: compose a real link or a primitive action; keeps the child’s navigation/ref semantics. Disabled/loading links expose `aria-disabled` and block activation.

Native handlers, refs, accessible labels, and form attributes are forwarded. The default type is `button`; use `type="submit"` explicitly for forms. All button visuals belong to the shared base, variant, size, and tone recipes in `design-system/components/Button/styles.ts`, using the typed theme. Callers may control placement and surrounding layout, but must not override button colors, padding, typography, borders, or state styling.

Calendar date cells, tabs, switches, dropdown options/triggers, selectors, result rows, and dropzones remain specialized controls. Alert-dialog actions, carousel navigation, and pagination links compose the shared Button directly. There are no compatibility variants, class helpers, or legacy Button imports.
