import { spacing } from "@/design-system";
import {
  Heading,
  Text,
  Input,
  Button,
  Field,
  Stack,
  AuthFrame,
  AuthSurface,
} from "@/design-system";

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
    <AuthFrame>
      <AuthSurface>
        <section>
          <Stack $gap="s24">
            <BrandLogo height={Number.parseInt(spacing.s60)} />
            <Heading level={1} size="lg">
              Create your R-pin
            </Heading>
            <Text tone="muted">
              Add a 6-digit R-pin for {user?.email ?? "your account"} before
              continuing.
            </Text>
            <Stack as="form" $gap="s16" onSubmit={submit}>
              <Field label="R-pin">
                <Input
                  type="text"
                  inputMode="numeric"
                  autoComplete="new-password"
                  value={pin}
                  onChange={(event) => setPin(cleanPin(event.target.value))}
                  placeholder="000000"
                  required
                />
              </Field>
              <Field label="Confirm R-pin">
                <Input
                  type="text"
                  inputMode="numeric"
                  autoComplete="new-password"
                  value={confirmPin}
                  onChange={(event) =>
                    setConfirmPin(cleanPin(event.target.value))
                  }
                  placeholder="000000"
                  required
                />
              </Field>
              {error ? (
                <Text tone="danger" role="alert">
                  {error}
                </Text>
              ) : null}
              <Button
                size="lg"
                fullWidth
                loading={busy}
                variant="primary"
                type="submit"
                disabled={busy}
              >
                {busy ? "Saving..." : "Continue"}
              </Button>
            </Stack>
            <Button
              size="sm"
              variant="tertiary"
              type="button"
              onClick={() => void signOut()}
            >
              Sign out
            </Button>
          </Stack>
        </section>
        <Stack as="aside" $gap="s16">
          <Heading level={2} size="md">
            Your private living archive
          </Heading>
          <Text tone="muted">
            Keep your R-pin private. Use it for quick sign-in to your Readines
            account.
          </Text>
        </Stack>
      </AuthSurface>
    </AuthFrame>
  );
}
