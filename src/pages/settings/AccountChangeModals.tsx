import { useEffect, useRef, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import { api, type AuthUser } from "@/lib/api";
import { btnGhost, T } from "@/constants/theme";
import { useAppDispatch } from "@/store/hooks";
import { logout, updateCurrentUser } from "@/store/slices/authSlice";

type Kind = "email" | "password";
type Step = "form" | "otp";

const fieldStyle = {
  width: "100%",
  background: T.raised,
  border: `1px solid ${T.border}`,
  borderRadius: 11,
  padding: "11px 12px",
  color: T.white,
  fontSize: 14,
  outline: "none",
};

const labelStyle = { display: "block", color: T.text, fontSize: 13, fontWeight: 700, marginTop: 12 };
const primaryStyle = {
  border: 0,
  borderRadius: 10,
  background: T.action,
  color: T.actionText,
  padding: "10px 14px",
  fontWeight: 800,
  cursor: "pointer",
};

function passwordError(password: string) {
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (!/[a-z]/.test(password)) return "Password must include a lowercase letter.";
  if (!/[A-Z]/.test(password)) return "Password must include an uppercase letter.";
  if (!/\d/.test(password)) return "Password must include a number.";
  if (!/[^A-Za-z0-9]/.test(password)) return "Password must include a symbol.";
  return "";
}

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
  const [step, setStep] = useState<Step>("form");
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
  const title = step === "otp"
    ? kind === "email" ? "Verify Email Change" : "Verify Password Change"
    : kind === "email" ? "Change Email" : "Change Password";

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
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidate)) return setError("Enter a valid email address.");
      if (candidate === currentEmail.toLowerCase()) return setError("New email must be different from your current email.");
    } else {
      const rule = passwordError(newPassword);
      if (rule) return setError(rule);
      if (newPassword !== confirmPassword) return setError("Passwords do not match.");
      if (newPassword === currentPassword) return setError("New password must be different from your current password.");
    }
    setBusy(true);
    try {
      if (kind === "email") {
        await api.auth.requestEmailChange({ newEmail: newEmail.trim(), currentPassword });
      } else {
        await api.auth.requestPasswordChange({ currentPassword, newPassword });
      }
      setOtp("");
      setStep("otp");
      setCooldownUntil(Date.now() + 60_000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send verification code.");
    } finally {
      setBusy(false);
    }
  };

  const verify = async () => {
    if (busy) return;
    setError("");
    if (!/^\d{6}$/.test(otp.trim())) return setError("Enter the 6-digit code from your email.");
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
    <div onClick={onClose} role="presentation" style={{ position: "fixed", inset: 0, zIndex: 80, background: "var(--lpv-scrim)", display: "flex", alignItems: "center", justifyContent: "center", padding: 18 }}>
      <form role="dialog" aria-modal="true" aria-labelledby="account-change-title" onClick={(event) => event.stopPropagation()} onSubmit={submit} style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 16, width: "min(460px,100%)", padding: 22, boxShadow: "0 24px 70px color-mix(in srgb, var(--lp-navy) 35%, transparent)" }}>
        <h2 id="account-change-title" style={{ color: T.white, fontSize: 17, margin: "0 0 14px" }}>{title}</h2>
        {step === "form" && kind === "email" ? (
          <>
            <label style={labelStyle}>New email<input ref={firstField} style={{ ...fieldStyle, marginTop: 8 }} type="email" value={newEmail} onChange={(event) => setNewEmail(event.target.value)} autoComplete="email" /></label>
            <label style={labelStyle}>Current password<input style={{ ...fieldStyle, marginTop: 8 }} type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} autoComplete="current-password" /></label>
          </>
        ) : null}
        {step === "form" && kind === "password" ? (
          <>
            <label style={labelStyle}>Current password<input ref={firstField} style={{ ...fieldStyle, marginTop: 8 }} type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} autoComplete="current-password" /></label>
            <label style={labelStyle}>New password<input style={{ ...fieldStyle, marginTop: 8 }} type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} autoComplete="new-password" /></label>
            <label style={labelStyle}>Confirm new password<input style={{ ...fieldStyle, marginTop: 8 }} type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" /></label>
          </>
        ) : null}
        {step === "otp" ? (
          <>
            <p style={{ color: T.muted, fontSize: 13.5, lineHeight: 1.6, margin: 0 }}>We sent a verification code to:<br /><b style={{ color: T.text }}>{currentEmail}</b></p>
            <label style={labelStyle}>OTP<input ref={firstField} style={{ ...fieldStyle, marginTop: 8 }} type="text" inputMode="numeric" pattern="[0-9]{6}" value={otp} onChange={(event) => setOtp(event.target.value)} /></label>
            <button type="button" disabled={busy || cooldown > 0} onClick={() => void requestCode()} style={{ ...btnGhost, marginTop: 10, opacity: busy || cooldown > 0 ? 0.55 : 1 }}>{cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}</button>
          </>
        ) : null}
        {error ? <div role="alert" style={{ color: T.coral, fontSize: 13, marginTop: 12 }}>{error}</div> : null}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
          <button type="button" onClick={onClose} disabled={busy} style={{ ...btnGhost, padding: "10px 12px" }}>Cancel</button>
          <button type="submit" disabled={busy} style={{ ...primaryStyle, opacity: busy ? 0.7 : 1 }}>{busy ? "Working..." : step === "form" ? "Save" : "Verify"}</button>
        </div>
      </form>
    </div>
  );
}
