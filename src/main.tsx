import { hasFullApplicationAccess } from "./lib/domain-access";
import React, { useSyncExternalStore } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { GoogleOAuthProvider } from "@react-oauth/google";

import App from "./App";
import { ThemeProvider } from "styled-components";
import { lightTheme, darkTheme, GlobalTypography } from "./design-system";
import { Toaster } from "./design-system";
import { store } from "./store";
import {
  applyTheme,
  getStoredTheme,
  subscribeAppearance,
  getAppliedAppearance,
} from "./lib/theme";
import "./styles.css";

applyTheme(getStoredTheme());

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim();
const googleScriptErrorEvent = "readiness:google-script-error";
function Application() {
  const appearance = useSyncExternalStore(
    subscribeAppearance,
    getAppliedAppearance,
    () => "dark",
  );
  return (
    <Provider store={store}>
      <ThemeProvider theme={appearance === "dark" ? darkTheme : lightTheme}>
        <GlobalTypography />
        <BrowserRouter>
          <App />
          <Toaster position="bottom-right" closeButton />
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
}
const app = <Application />;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {googleClientId && hasFullApplicationAccess(window.location.hostname) ? (
      <GoogleOAuthProvider
        clientId={googleClientId}
        onScriptLoadSuccess={() => {
          window.dispatchEvent(
            new CustomEvent(googleScriptErrorEvent, { detail: false }),
          );
        }}
        onScriptLoadError={() => {
          window.dispatchEvent(
            new CustomEvent(googleScriptErrorEvent, { detail: true }),
          );
        }}
      >
        {app}
      </GoogleOAuthProvider>
    ) : (
      app
    )}
  </React.StrictMode>,
);
