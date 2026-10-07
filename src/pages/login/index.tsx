import BrandLogo from "@/components/BrandLogo";
import { useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { login, loginWithPin } from "@/store/slices/authSlice";
import { googleLogin } from "@/store/slices/authSlice";
import GoogleSignInButton from "@/components/GoogleSignInButton";

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { token, user } = useAppSelector((state) => state.auth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");
  const [mode, setMode] = useState<"password" | "pin">("password");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const from = (location.state as { from?: Location } | null)?.from?.pathname ?? "/";

  if (token && user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const result = await dispatch(mode === "pin" ? loginWithPin({ email, pin }) : login({ email, password })).unwrap();
      if (result.deletionCancelled) {
        toast.success("Welcome back. Your account deletion request has been cancelled.");
      }
      navigate(from, { replace: true });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to sign in.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleCredential = async (credential: string) => {
    if (isSubmitting) return;
    setError("");
    setIsSubmitting(true);
    try {
      const result = await dispatch(googleLogin({ credential })).unwrap();
      if (result.deletionCancelled) {
        toast.success("Welcome back. Your account deletion request has been cancelled.");
      }
      navigate(from, { replace: true });
    } catch {
      setError(navigator.onLine ? "We could not authenticate that Google account." : "Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="lg:hidden"><BrandLogo height={64} /></div>
      <h2 className="mt-4 text-3xl font-semibold text-[var(--lp-heading)]">Log in</h2>
      <p className="mt-2 text-sm text-[var(--lp-muted)]">Use your password, Google account, or R-pin to continue.</p>

      <div className="mt-8">
        <GoogleSignInButton disabled={isSubmitting} onCredential={handleGoogleCredential} onError={setError} />
        <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-wider text-[var(--lp-faint)]">
          <span className="h-px flex-1 bg-[var(--lp-border)]" /> or <span className="h-px flex-1 bg-[var(--lp-border)]" />
        </div>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-2 rounded-2xl border border-[var(--lp-border)] bg-[var(--lp-panel)] p-1">
        <button
          type="button"
          onClick={() => setMode("password")}
          className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${mode === "password" ? "bg-[var(--lp-action)] text-[var(--lp-action-text)]" : "text-[var(--lp-muted)] hover:text-[var(--lp-heading)]"}`}
        >
          Password
        </button>
        <button
          type="button"
          onClick={() => setMode("pin")}
          className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${mode === "pin" ? "bg-[var(--lp-action)] text-[var(--lp-action-text)]" : "text-[var(--lp-muted)] hover:text-[var(--lp-heading)]"}`}
        >
          Sign in with R-pin
        </button>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-2 block text-sm text-[var(--lp-text)]">Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-2xl border border-[var(--lp-border)] bg-[var(--lp-raised)] px-4 py-3 text-sm text-[var(--lp-heading)] outline-none transition focus:border-[var(--lp-action)]"
            placeholder="you@example.com"
            required
          />
        </label>

        {mode === "password" ? <label className="block">
          <span className="mb-2 block text-sm text-[var(--lp-text)]">Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-2xl border border-[var(--lp-border)] bg-[var(--lp-raised)] px-4 py-3 text-sm text-[var(--lp-heading)] outline-none transition focus:border-[var(--lp-action)]"
            placeholder="Enter your password"
            required
          />
        </label> : (
          <label className="block">
            <span className="mb-2 block text-sm text-[var(--lp-text)]">R-pin</span>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              value={pin}
              onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 6))}
              className="w-full rounded-2xl border border-[var(--lp-border)] bg-[var(--lp-raised)] px-4 py-3 text-sm text-[var(--lp-heading)] outline-none transition focus:border-[var(--lp-action)]"
              placeholder="000000"
              required
            />
          </label>
        )}

        {error ? <p className="text-sm text-[var(--lp-coral)]">{error}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-2xl bg-[var(--lp-action)] px-4 py-3 text-sm font-semibold text-[var(--lp-action-text)] transition hover:bg-[var(--lp-action-hover)] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Logging in..." : mode === "pin" ? "Sign in with R-pin" : "Login"}
        </button>
      </form>

      <div className="mt-6 space-y-3 text-sm">
        <button
          type="button"
          onClick={() => navigate("/signup")}
          className="block text-[var(--lp-action)] transition hover:text-[var(--lp-action-hover)]"
        >
          Go to signup
        </button>
        <button
          type="button"
          onClick={() => navigate("/forgot-password")}
          className="block text-[var(--lp-text)] transition hover:text-[var(--lp-heading)]"
        >
          Go to forgot password
        </button>
      </div>
    </div>
  );
}
