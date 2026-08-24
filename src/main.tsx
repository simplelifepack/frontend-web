import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { GoogleOAuthProvider } from "@react-oauth/google";

import App from "./App";
import { store } from "./store";
import "./styles.css";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim();
const googleScriptErrorEvent = "ReadiNes:google-script-error";
const app = (
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>
);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {googleClientId ? (
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
