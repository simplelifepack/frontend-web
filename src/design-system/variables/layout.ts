// Existing layout thresholds; names describe the compositions that share them.
export const breakpoints = {
  compact: 520,
  field: 540,
  mobile: 760,
  navigation: 767,
  tablet: 980,
  desktop: 1280,
} as const;
export const media = Object.fromEntries(
  Object.entries(breakpoints).map(([name, width]) => [
    name,
    `(max-width: ${width}px)`,
  ]),
) as Record<keyof typeof breakpoints, string>;
export const contentWidths = { shell: "1554px" } as const;
// Used by both styled-components and the stylesheet's build-time media aliases.
export const mediaQueries = {
  ...media,
  desktop: `(min-width: ${breakpoints.desktop}px)`,
};
