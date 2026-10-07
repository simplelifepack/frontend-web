import BrandLogo from "@/components/BrandLogo";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { api } from "@/lib/api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchMe, logout, updateCurrentUser } from "@/store/slices/authSlice";

function cleanPin(value: string) {
  return value.replace(/\D/g, "").slice(0, 6);
}

export default function PinSetupGate() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (!/^\d{6}$/.test(pin)) return setError("Enter a 6-digit R-pin.");
    if (pin !== confirmPin) return setError("R-pins do not match.");
    setBusy(true);
    try {
      const result = await api.auth.setupPin({ pin });
      dispatch(updateCurrentUser(result.user));
      toast.success("R-pin created");
    } catch (err) {
      if (err instanceof Error && /already configured/i.test(err.message)) {
        const result = await dispatch(fetchMe()).unwrap();
        dispatch(updateCurrentUser(result.user));
        return;
      }
      setError(err instanceof Error ? err.message : "Unable to create R-pin.");
    } finally {
      setBusy(false);
    }
  };

  const signOut = async () => {
    await api.auth.logout().catch(() => undefined);
    dispatch(logout());
  };

  return (
    <div className="min-h-dvh bg-[var(--lp-bg)] px-5 py-10 text-[var(--lp-text)]">
      <div className="mx-auto max-w-sm">
        <BrandLogo height={64} />
        <h1 className="mt-8 text-2xl font-semibold text-[var(--lp-heading)]">Create your R-pin</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--lp-muted)]">
          Add a 6-digit R-pin for {user?.email ?? "your account"} before continuing.
        </p>
        <form className="mt-8 space-y-4" onSubmit={submit}>
          <label className="block">
            <span className="mb-2 block text-sm text-[var(--lp-text)]">R-pin</span>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="new-password"
              value={pin}
              onChange={(event) => setPin(cleanPin(event.target.value))}
              className="w-full rounded-2xl border border-[var(--lp-border)] bg-[var(--lp-raised)] px-4 py-3 text-sm text-[var(--lp-heading)] outline-none transition focus:border-[var(--lp-action)]"
              placeholder="000000"
              required
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm text-[var(--lp-text)]">Confirm R-pin</span>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="new-password"
              value={confirmPin}
              onChange={(event) => setConfirmPin(cleanPin(event.target.value))}
              className="w-full rounded-2xl border border-[var(--lp-border)] bg-[var(--lp-raised)] px-4 py-3 text-sm text-[var(--lp-heading)] outline-none transition focus:border-[var(--lp-action)]"
              placeholder="000000"
              required
            />
          </label>
          {error ? <p className="text-sm text-[var(--lp-coral)]">{error}</p> : null}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-2xl bg-[var(--lp-action)] px-4 py-3 text-sm font-semibold text-[var(--lp-action-text)] transition hover:bg-[var(--lp-action-hover)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {busy ? "Saving..." : "Continue"}
          </button>
        </form>
        <button
          type="button"
          onClick={() => void signOut()}
          className="mt-5 text-sm text-[var(--lp-muted)] transition hover:text-[var(--lp-heading)]"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
