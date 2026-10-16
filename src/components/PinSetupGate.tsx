import { Heading, Text, Input, Button } from "@/design-system";

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
        <Heading level={1} size="lg" className="mt-8 text-[var(--lp-heading)]">Create your R-pin</Heading>
        <Text as="p" size="md" className="mt-2 text-[var(--lp-muted)]">
          Add a 6-digit R-pin for {user?.email ?? "your account"} before continuing.
        </Text>
        <form className="mt-8 space-y-4" onSubmit={submit}>
          <Text as="label" size="md" className="block">
            <span className="mb-2 block text-sm text-[var(--lp-text)]">R-pin</span>
            <Input
              type="text"
              inputMode="numeric"
              autoComplete="new-password"
              value={pin}
              onChange={(event) => setPin(cleanPin(event.target.value))}
              className="w-full rounded-2xl border border-[var(--lp-border)] bg-[var(--lp-raised)] px-4 py-3 text-sm text-[var(--lp-heading)] outline-none transition focus:border-[var(--lp-action)]"
              placeholder="000000"
              required
            />
          </Text>
          <Text as="label" size="md" className="block">
            <span className="mb-2 block text-sm text-[var(--lp-text)]">Confirm R-pin</span>
            <Input
              type="text"
              inputMode="numeric"
              autoComplete="new-password"
              value={confirmPin}
              onChange={(event) => setConfirmPin(cleanPin(event.target.value))}
              className="w-full rounded-2xl border border-[var(--lp-border)] bg-[var(--lp-raised)] px-4 py-3 text-sm text-[var(--lp-heading)] outline-none transition focus:border-[var(--lp-action)]"
              placeholder="000000"
              required
            />
          </Text>
          {error ? <Text as="p" size="md" className="text-[var(--lp-coral)]">{error}</Text> : null}
          <Button size="lg" loading={Boolean(busy)} variant="primary"
            type="submit"
            disabled={busy}
          >
            {busy ? "Saving..." : "Continue"}
          </Button>
        </form>
        <Button size="sm" variant="tertiary"
          type="button"
          onClick={() => void signOut()}
         style={{ marginTop: "var(--space-s20)" }}>
          Sign out
        </Button>
      </div>
    </div>
  );
}
