import BrandLogo from "@/components/BrandLogo";
import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { forgotPassword } from "@/store/slices/authSlice";

export default function ForgotPasswordPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { token, user } = useAppSelector((state) => state.auth);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (token && user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const response = await dispatch(forgotPassword({ email })).unwrap();
      setSuccessMessage(response.message);
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Unable to submit password reset.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="lg:hidden"><BrandLogo height={64} /></div>
      <h2 className="mt-4 text-3xl font-semibold text-[var(--lp-heading)]">Forgot password</h2>
      <p className="mt-2 text-sm text-[var(--lp-muted)]">
        Enter your email and we will send reset instructions if the account exists.
      </p>

      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
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

        {error ? <p className="text-sm text-[var(--lp-coral)]">{error}</p> : null}
        {successMessage ? <p className="text-sm text-[var(--lp-mint)]">{successMessage}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-2xl bg-[var(--lp-action)] px-4 py-3 text-sm font-semibold text-[var(--lp-action-text)] transition hover:bg-[var(--lp-action-hover)] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>
      </form>

      <div className="mt-6 text-sm">
        <button
          type="button"
          onClick={() => navigate("/", { state: { authMode: "signin" } })}
          className="text-[var(--lp-text)] transition hover:text-[var(--lp-heading)]"
        >
          Go to login
        </button>
      </div>
    </div>
  );
}
