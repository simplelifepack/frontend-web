import BrandLogo from "@/components/BrandLogo";
import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { signup } from "@/store/slices/authSlice";
import { googleLogin } from "@/store/slices/authSlice";
import GoogleSignInButton from "@/components/GoogleSignInButton";

export default function SignupPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { token, user } = useAppSelector((state) => state.auth);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (token && user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      await dispatch(signup({ name, email, password })).unwrap();
      navigate("/", { replace: true });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to sign up.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleCredential = async (credential: string) => {
    if (isSubmitting) return;
    setError("");
    setIsSubmitting(true);
    try {
      await dispatch(googleLogin({ credential })).unwrap();
      navigate("/", { replace: true });
    } catch {
      setError(navigator.onLine ? "We could not authenticate that Google account." : "Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="lg:hidden"><BrandLogo height={64} /></div>
      <h2 className="mt-4 text-3xl font-semibold text-[var(--lp-heading)]">Create account</h2>
      <p className="mt-2 text-sm text-[var(--lp-muted)]">Set up your Readiness login.</p>

      <div className="mt-8">
        <GoogleSignInButton disabled={isSubmitting} onCredential={handleGoogleCredential} onError={setError} />
        <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-wider text-[var(--lp-faint)]">
          <span className="h-px flex-1 bg-[var(--lp-border)]" /> or <span className="h-px flex-1 bg-[var(--lp-border)]" />
        </div>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-2 block text-sm text-[var(--lp-text)]">Name</span>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-2xl border border-[var(--lp-border)] bg-[var(--lp-raised)] px-4 py-3 text-sm text-[var(--lp-heading)] outline-none transition focus:border-[var(--lp-action)]"
            placeholder="Your name"
            required
          />
        </label>

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

        <label className="block">
          <span className="mb-2 block text-sm text-[var(--lp-text)]">Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-2xl border border-[var(--lp-border)] bg-[var(--lp-raised)] px-4 py-3 text-sm text-[var(--lp-heading)] outline-none transition focus:border-[var(--lp-action)]"
            placeholder="Create a password"
            required
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-[var(--lp-text)]">Confirm password</span>
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="w-full rounded-2xl border border-[var(--lp-border)] bg-[var(--lp-raised)] px-4 py-3 text-sm text-[var(--lp-heading)] outline-none transition focus:border-[var(--lp-action)]"
            placeholder="Confirm your password"
            required
          />
        </label>

        {error ? <p className="text-sm text-[var(--lp-coral)]">{error}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-2xl bg-[var(--lp-action)] px-4 py-3 text-sm font-semibold text-[var(--lp-action-text)] transition hover:bg-[var(--lp-action-hover)] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Creating account..." : "Signup"}
        </button>
      </form>

      <div className="mt-6 text-sm">
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="text-[var(--lp-text)] transition hover:text-[var(--lp-heading)]"
        >
          Go to login
        </button>
      </div>
    </div>
  );
}
