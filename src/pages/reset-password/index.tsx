import { useMemo, useState, type FormEvent } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";

import { api } from "@/lib/api";
import { useAppSelector } from "@/store/hooks";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { token: authToken, user } = useAppSelector((state) => state.auth);
  const resetToken = useMemo(() => searchParams.get("token")?.trim() ?? "", [searchParams]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (authToken && user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!resetToken) {
      setError("This reset link is missing a token.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.auth.resetPassword({ token: resetToken, password });
      setSuccessMessage(response.message);
      setPassword("");
      setConfirmPassword("");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to reset password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300 lg:hidden">
        Readiness
      </p>
      <h2 className="mt-4 text-3xl font-semibold text-white">Reset password</h2>
      <p className="mt-2 text-sm text-slate-400">
        Create a new password for your Readiness account.
      </p>

      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-2 block text-sm text-slate-300">New password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
            minLength={8}
            required
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-slate-300">Confirm password</span>
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
            minLength={8}
            required
          />
        </label>

        {error ? <p className="text-sm text-rose-400">{error}</p> : null}
        {successMessage ? <p className="text-sm text-emerald-400">{successMessage}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting || !resetToken}
          className="w-full rounded-2xl bg-amber-300 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Resetting..." : "Reset password"}
        </button>
      </form>

      <div className="mt-6 text-sm">
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="text-slate-300 transition hover:text-white"
        >
          Go to login
        </button>
      </div>
    </div>
  );
}
