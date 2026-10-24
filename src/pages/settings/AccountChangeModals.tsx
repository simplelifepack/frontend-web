import { passwordError } from "./password-validation";
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
import { useNavigate } from "react-router-dom";

import { api, type AuthUser } from "@/lib/api";
import { Stack, Row, PasswordInput } from "@/design-system";
import { useAppDispatch } from "@/store/hooks";
import { logout, updateCurrentUser } from "@/store/slices/authSlice";

type Kind = "email" | "password";

export default function AccountChangeModal({
  kind,
  currentEmail,
  onClose,
}: {
  kind: Kind;
  currentEmail: string;
  onClose: () => void;
}) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const firstField = useRef<HTMLInputElement | null>(null);
  const [step, setStep] = useState<"form" | "otp">("form");
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [tick, setTick] = useState(Date.now());
  const cooldown = Math.max(0, Math.ceil((cooldownUntil - tick) / 1000));
  const title =
    step === "otp"
      ? kind === "email"
        ? "Verify Email Change"
        : "Verify Password Change"
      : kind === "email"
        ? "Change Email"
        : "Change Password";

  useEffect(() => {
    firstField.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, step]);

  useEffect(() => {
    if (!cooldownUntil) return;
    const id = window.setInterval(() => setTick(Date.now()), 500);
    return () => window.clearInterval(id);
  }, [cooldownUntil]);

  const requestCode = async () => {
    if (busy) return;
    setError("");
    if (kind === "email") {
      const candidate = newEmail.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidate))
        return setError("Enter a valid email address.");
      if (candidate === currentEmail.toLowerCase())
        return setError("New email must be different from your current email.");
    } else {
      const rule = passwordError(newPassword);
      if (rule) return setError(rule);
      if (newPassword !== confirmPassword)
        return setError("Passwords do not match.");
      if (newPassword === currentPassword)
        return setError(
          "New password must be different from your current password.",
        );
    }
    setBusy(true);
    try {
      if (kind === "email") {
        await api.auth.requestEmailChange({
          newEmail: newEmail.trim(),
          currentPassword,
        });
      } else {
        await api.auth.requestPasswordChange({ currentPassword, newPassword });
      }
      setOtp("");
      setStep("otp");
      setCooldownUntil(Date.now() + 60_000);
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

  const verify = async () => {
    if (busy) return;
    setError("");
    if (!/^\d{6}$/.test(otp.trim()))
      return setError("Enter the 6-digit code from your email.");
    setBusy(true);
    try {
      if (kind === "email") {
        const result = await api.auth.verifyEmailChange({ otp: otp.trim() });
        dispatch(updateCurrentUser(result.user as AuthUser));
        toast.success("Email updated");
        onClose();
      } else {
        await api.auth.verifyPasswordChange({ otp: otp.trim() });
        toast.success("Password updated. Please sign in again.");
        dispatch(logout());
        onClose();
        navigate("/", { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to verify code.");
    } finally {
      setBusy(false);
    }
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    void (step === "form" ? requestCode() : verify());
  };

  return (
    <ModalBackdrop onClick={onClose} role="presentation">
      <ModalPanel
        onDismiss={onClose}
        as="form"
        role="dialog"
        aria-modal="true"
        aria-labelledby="account-change-title"
        onClick={(event) => event.stopPropagation()}
        onSubmit={submit}
      >
        <Stack $gap="s16">
          <Heading level={2} size="sm" id="account-change-title">
            {title}
          </Heading>
          {step === "form" && kind === "email" ? (
            <>
              <Field label="New email">
                <Input
                  ref={firstField}
                  type="email"
                  value={newEmail}
                  onChange={(event) => setNewEmail(event.target.value)}
                  autoComplete="email"
                />
              </Field>
              <Field label="Current password">
                <PasswordInput
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  autoComplete="current-password"
                />
              </Field>
            </>
          ) : null}
          {step === "form" && kind === "password" ? (
            <>
              <Field label="Current password">
                <PasswordInput
                  ref={firstField}
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  autoComplete="current-password"
                />
              </Field>
              <Field label="New password">
                <PasswordInput
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  autoComplete="new-password"
                />
              </Field>
              <Field label="Confirm new password">
                <PasswordInput
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  autoComplete="new-password"
                />
              </Field>
            </>
          ) : null}
          {step === "otp" ? (
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
                  pattern="[0-9]{6}"
                  value={otp}
                  onChange={(event) => setOtp(event.target.value)}
                />
              </Field>
              <Button
                variant="secondary"
                type="button"
                disabled={busy || cooldown > 0}
                onClick={() => void requestCode()}
              >
                {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
              </Button>
            </>
          ) : null}
          {error ? (
            <Text as="div" size="md" tone="danger" role="alert">
              {error}
            </Text>
          ) : null}
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
              {busy ? "Working..." : step === "form" ? "Save" : "Verify"}
            </Button>
          </Row>
        </Stack>
      </ModalPanel>
    </ModalBackdrop>
  );
}
