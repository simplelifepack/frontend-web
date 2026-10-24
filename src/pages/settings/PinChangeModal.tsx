import {
  Field,
  Heading,
  Text,
  ModalBackdrop,
  ModalPanel,
  Input,
  Button,
} from "@/design-system";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { api } from "@/lib/api";
import { Stack, Row, PasswordInput } from "@/design-system";

type Mode = "change" | "reset";

function cleanPin(value: string) {
  return value.replace(/\D/g, "").slice(0, 6);
}

export default function PinChangeModal({
  currentEmail,
  onClose,
}: {
  currentEmail: string;
  onClose: () => void;
}) {
  const firstField = useRef<HTMLInputElement | null>(null);
  const [mode, setMode] = useState<Mode>("change");
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [otp, setOtp] = useState("");
  const [resetRequested, setResetRequested] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    firstField.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, mode, resetRequested]);

  const validateNewPin = () => {
    if (!/^\d{6}$/.test(newPin)) return "Enter a 6-digit R-pin.";
    if (newPin !== confirmPin) return "R-pins do not match.";
    if (mode === "change" && currentPin === newPin)
      return "New R-pin must be different from your current R-pin.";
    return "";
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    const validation = validateNewPin();
    if (validation) return setError(validation);
    if (mode === "change" && !/^\d{6}$/.test(currentPin))
      return setError("Enter your current 6-digit R-pin.");
    if (mode === "reset" && !/^\d{6}$/.test(otp))
      return setError("Enter the 6-digit email code.");
    setBusy(true);
    try {
      if (mode === "change") {
        await api.auth.changePin({ currentPin, newPin });
      } else {
        await api.auth.resetPin({ otp, newPin });
      }
      toast.success("R-pin updated");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update R-pin.");
    } finally {
      setBusy(false);
    }
  };

  const requestReset = async () => {
    setError("");
    setBusy(true);
    try {
      await api.auth.requestPinReset();
      setMode("reset");
      setResetRequested(true);
      setOtp("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to send verification code.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <ModalBackdrop onClick={onClose} role="presentation">
      <ModalPanel
        onDismiss={onClose}
        as="form"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pin-change-title"
        onClick={(event) => event.stopPropagation()}
        onSubmit={submit}
      >
        <Stack $gap="s16">
          <Heading level={2} size="sm" id="pin-change-title">
            {mode === "reset" ? "Reset R-pin" : "Change R-pin"}
          </Heading>
          {mode === "change" ? (
            <Field label="Current R-pin">
              <Input
                ref={firstField}
                type="text"
                inputMode="numeric"
                value={currentPin}
                onChange={(event) =>
                  setCurrentPin(cleanPin(event.target.value))
                }
              />
            </Field>
          ) : (
            <>
              <Text as="p" size="md" tone="muted">
                We sent a verification code to:
                <br />
                <b>{currentEmail}</b>
              </Text>
              <Field label="OTP">
                <Input
                  ref={firstField}
                  type="text"
                  inputMode="numeric"
                  value={otp}
                  onChange={(event) => setOtp(cleanPin(event.target.value))}
                />
              </Field>
            </>
          )}
          <Field label="New R-pin">
            <Input
              type="text"
              inputMode="numeric"
              value={newPin}
              onChange={(event) => setNewPin(cleanPin(event.target.value))}
            />
          </Field>
          <Field label="Confirm new R-pin">
            <Input
              type="text"
              inputMode="numeric"
              value={confirmPin}
              onChange={(event) => setConfirmPin(cleanPin(event.target.value))}
            />
          </Field>
          {error ? (
            <Text as="div" size="md" tone="danger" role="alert">
              {error}
            </Text>
          ) : null}
          <Button
            variant="secondary"
            type="button"
            disabled={busy}
            onClick={() => void requestReset()}
          >
            {resetRequested ? "Send another email code" : "Forgot R-pin?"}
          </Button>
          <Row $justify="space-between" $gap="s12">
            <Button
              variant="secondary"
              size="md"
              type="button"
              onClick={onClose}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button
              loading={Boolean(busy)}
              variant="primary"
              type="submit"
              disabled={busy}
            >
              {busy ? "Working..." : "Save R-pin"}
            </Button>
          </Row>
        </Stack>
      </ModalPanel>
    </ModalBackdrop>
  );
}
