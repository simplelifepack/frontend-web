import { useEffect, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";

type GoogleSignInButtonProps = {
  disabled: boolean;
  onCredential: (credential: string) => void;
  onError: (message: string) => void;
};

export default function GoogleSignInButton({
  disabled,
  onCredential,
  onError,
}: GoogleSignInButtonProps) {
  const configured = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim());
  const [scriptFailed, setScriptFailed] = useState(false);
  const isLoopbackIp =
    typeof window !== "undefined" && window.location.hostname === "127.0.0.1";

  useEffect(() => {
    const handleScriptError = (event: Event) => {
      const failed =
        event instanceof CustomEvent ? Boolean(event.detail) : true;
      setScriptFailed(failed);
      if (failed) {
        onError(
          "Google sign-in could not load. Open ReadiNes at http://localhost:5173 and disable any blocker for accounts.google.com.",
        );
      }
    };
    window.addEventListener("ReadiNes:google-script-error", handleScriptError);
    return () =>
      window.removeEventListener(
        "ReadiNes:google-script-error",
        handleScriptError,
      );
  }, [onError]);

  if (!configured) {
    return (
      <div>
        <button
          type="button"
          disabled
          className="w-full rounded-lg border border-slate-700 bg-white px-4 py-2.5 text-sm font-medium text-slate-500 opacity-70"
        >
          Continue with Google
        </button>
        <p className="mt-2 text-center text-xs text-slate-400">
          Google sign-in is unavailable right now.
        </p>
      </div>
    );
  }

  if (scriptFailed || isLoopbackIp) {
    return (
      <div>
        <button
          type="button"
          disabled
          className="w-full rounded-lg border border-slate-700 bg-white px-4 py-2.5 text-sm font-medium text-slate-500 opacity-70"
        >
          Continue with Google
        </button>
        <p className="mt-2 text-center text-xs text-slate-400">
          {isLoopbackIp
            ? "Open ReadiNes at http://localhost:5173 to use Google sign-in."
            : "Google sign-in could not load. Disable blockers for accounts.google.com and try again."}
        </p>
      </div>
    );
  }

  return (
    <div
      className={disabled ? "pointer-events-none opacity-60" : ""}
      aria-busy={disabled}
    >
      <div className="flex min-h-10 justify-center overflow-hidden rounded-lg bg-white">
        <GoogleLogin
          onSuccess={(response) => {
            if (!response.credential) {
              onError(
                "Google did not return a valid account. Please try again.",
              );
              return;
            }
            onCredential(response.credential);
          }}
          onError={() =>
            onError("Google sign-in was cancelled or could not be completed.")
          }
          text="continue_with"
          shape="rectangular"
          theme="outline"
          size="large"
          width="360"
        />
      </div>
      {disabled ? (
        <p className="mt-2 text-center text-xs text-slate-400">
          Signing in securely…
        </p>
      ) : null}
    </div>
  );
}
