import { useEffect, useRef, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { api } from "@/lib/api";
import { btnGhost, T } from "@/constants/theme";

type Mode = "change" | "reset";

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
const primaryStyle = { border: 0, borderRadius: 10, background: T.action, color: T.actionText, padding: "10px 14px", fontWeight: 800, cursor: "pointer" };

function cleanPin(value: string) {
  return value.replace(/\D/g, "").slice(0, 6);
}

export default function PinChangeModal({ currentEmail, onClose }: { currentEmail: string; onClose: () => void }) {
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
    if (mode === "change" && currentPin === newPin) return "New R-pin must be different from your current R-pin.";
    return "";
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    const validation = validateNewPin();
    if (validation) return setError(validation);
    if (mode === "change" && !/^\d{6}$/.test(currentPin)) return setError("Enter your current 6-digit R-pin.");
    if (mode === "reset" && !/^\d{6}$/.test(otp)) return setError("Enter the 6-digit email code.");
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
      setError(err instanceof Error ? err.message : "Unable to send verification code.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div onClick={onClose} role="presentation" style={{ position: "fixed", inset: 0, zIndex: 80, background: "var(--lpv-scrim)", display: "flex", alignItems: "center", justifyContent: "center", padding: 18 }}>
      <form role="dialog" aria-modal="true" aria-labelledby="pin-change-title" onClick={(event) => event.stopPropagation()} onSubmit={submit} style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 16, width: "min(460px,100%)", padding: 22, boxShadow: "0 24px 70px color-mix(in srgb, var(--lp-navy) 35%, transparent)" }}>
        <h2 id="pin-change-title" style={{ color: T.white, fontSize: 17, margin: "0 0 14px" }}>{mode === "reset" ? "Reset R-pin" : "Change R-pin"}</h2>
        {mode === "change" ? (
          <label style={labelStyle}>Current R-pin<input ref={firstField} style={{ ...fieldStyle, marginTop: 8 }} type="text" inputMode="numeric" value={currentPin} onChange={(event) => setCurrentPin(cleanPin(event.target.value))} /></label>
        ) : (
          <>
            <p style={{ color: T.muted, fontSize: 13.5, lineHeight: 1.6, margin: 0 }}>We sent a verification code to:<br /><b style={{ color: T.text }}>{currentEmail}</b></p>
            <label style={labelStyle}>OTP<input ref={firstField} style={{ ...fieldStyle, marginTop: 8 }} type="text" inputMode="numeric" value={otp} onChange={(event) => setOtp(cleanPin(event.target.value))} /></label>
          </>
        )}
        <label style={labelStyle}>New R-pin<input style={{ ...fieldStyle, marginTop: 8 }} type="text" inputMode="numeric" value={newPin} onChange={(event) => setNewPin(cleanPin(event.target.value))} /></label>
        <label style={labelStyle}>Confirm new R-pin<input style={{ ...fieldStyle, marginTop: 8 }} type="text" inputMode="numeric" value={confirmPin} onChange={(event) => setConfirmPin(cleanPin(event.target.value))} /></label>
        {error ? <div role="alert" style={{ color: T.coral, fontSize: 13, marginTop: 12 }}>{error}</div> : null}
        <button type="button" disabled={busy} onClick={() => void requestReset()} style={{ ...btnGhost, marginTop: 12, opacity: busy ? 0.6 : 1 }}>
          {resetRequested ? "Send another email code" : "Forgot R-pin?"}
        </button>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
          <button type="button" onClick={onClose} disabled={busy} style={{ ...btnGhost, padding: "10px 12px" }}>Cancel</button>
          <button type="submit" disabled={busy} style={{ ...primaryStyle, opacity: busy ? 0.7 : 1 }}>{busy ? "Working..." : "Save R-pin"}</button>
        </div>
      </form>
    </div>
  );
}
