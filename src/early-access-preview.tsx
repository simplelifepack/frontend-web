import React, { useSyncExternalStore } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "styled-components";
import { lightTheme, darkTheme, GlobalTypography } from "./design-system";
import { EarlyAccessHero } from "./components/EarlyAccessHero";
import { applyTheme, getStoredTheme, subscribeAppearance, getAppliedAppearance } from "./lib/theme";
import "./styles.css";

applyTheme(getStoredTheme());
function LandingPreview() {
  const appearance = useSyncExternalStore(subscribeAppearance, getAppliedAppearance, () => "light");
  return <ThemeProvider theme={appearance === "dark" ? darkTheme : lightTheme}><GlobalTypography/><EarlyAccessHero/></ThemeProvider>;
}
if (import.meta.env.DEV) createRoot(document.getElementById("root")!).render(<LandingPreview/>);
