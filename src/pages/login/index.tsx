import { useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { login } from "@/store/slices/authSlice";
import { googleLogin } from "@/store/slices/authSlice";
import GoogleSignInButton from "@/components/GoogleSignInButton";

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { token, user } = useAppSelector((state) => state.auth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      await dispatch(login({ email, password })).unwrap();
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
      await dispatch(googleLogin({ credential })).unwrap();
      navigate(from, { replace: true });
    } catch {
      setError(navigator.onLine ? "We could not authenticate that Google account." : "Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300 lg:hidden">
        ReadiNes
      </p>
      <h2 className="mt-4 text-3xl font-semibold text-white">Log in</h2>
      <p className="mt-2 text-sm text-slate-400">Use your email and password to continue.</p>

      <div className="mt-8">
        <GoogleSignInButton disabled={isSubmitting} onCredential={handleGoogleCredential} onError={setError} />
        <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-wider text-slate-500">
          <span className="h-px flex-1 bg-slate-800" /> or <span className="h-px flex-1 bg-slate-800" />
        </div>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-2 block text-sm text-slate-300">Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
            placeholder="you@example.com"
            required
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-slate-300">Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
            placeholder="Enter your password"
            required
          />
        </label>

        {error ? <p className="text-sm text-rose-400">{error}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-2xl bg-amber-300 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Logging in..." : "Login"}
        </button>
      </form>

      <div className="mt-6 space-y-3 text-sm">
        <button
          type="button"
          onClick={() => navigate("/signup")}
          className="block text-amber-300 transition hover:text-amber-200"
        >
          Go to signup
        </button>
        <button
          type="button"
          onClick={() => navigate("/forgot-password")}
          className="block text-slate-300 transition hover:text-white"
        >
          Go to forgot password
        </button>
      </div>
    </div>
  );
}
