import "styled-components";
import { colors } from "./colors";
import { spacing } from "./spacing";
import { typography } from "./typography";
import { radii } from "./radii";
import { breakpoints, mediaQueries, contentWidths } from "./layout";
import { vars } from "./vars";

// Colors reference the existing CSS variables, which applyTheme updates via .dark.
// A stable theme avoids duplicating palettes or changing unrelated screen styles.
export const lightTheme = {
  mode: "light" as "light" | "dark",
  colors,
  spacing,
  typography,
  radii,
  vars,
  breakpoints,
  media: mediaQueries,
  contentWidths,
};
export const darkTheme = { ...lightTheme, mode: "dark" as const };
export const theme = darkTheme;
export type DesignSystemTheme = typeof lightTheme;

declare module "styled-components" {
  export interface DefaultTheme {
    mode: DesignSystemTheme["mode"];
    colors: DesignSystemTheme["colors"];
    spacing: DesignSystemTheme["spacing"];
    typography: DesignSystemTheme["typography"];
    radii: DesignSystemTheme["radii"];
    vars: DesignSystemTheme["vars"];
    breakpoints: DesignSystemTheme["breakpoints"];
    media: DesignSystemTheme["media"];
    contentWidths: DesignSystemTheme["contentWidths"];
  }
}
