import { Text } from "@/design-system";
import { api } from "@/lib/api";
import { loginWithPin, signup } from "@/store/slices/authSlice";
import { toast } from "sonner";
import { isExistingAccountError } from "./Landing.Brand";
import { useAuthModalState } from "./Landing.Landing";


export function useAuthModalLogic(props: Parameters<typeof useAuthModalState>[0]) {

const { initMode, onClose, onAuthed, dispatch, mode, setMode, screen, setScreen, name, setName, email, setEmail, pw, setPw, pw2, setPw2, pin, setPin, err, setErr, otp, setOtp, resetPw, setResetPw, resetPw2, setResetPw2, submitting, setSubmitting, passwordRule, submit, handleGoogleCredential } = useAuthModalState(props);

  const submitPin = async () => {
    setErr("");
    if (submitting) return;
    if (!email.trim() || !pin.match(/^\d{6}$/))
      return setErr("Enter your email and 6-digit PIN.");
    setSubmitting(true);
    try {
      const result = await dispatch(
        loginWithPin({ email: email.trim(), pin }),
      ).unwrap();
      if (result.deletionCancelled) {
        toast.success(
          "Welcome back. Your account deletion request has been cancelled.",
        );
      }
      onAuthed(false, result.user.name);
    } catch (error) {
      setErr(
        error instanceof Error ? error.message : "Unable to sign in with PIN.",
      );
    } finally {
      setSubmitting(false);
    }
  };
  const verifySignupOtp = async () => {
    setErr("");
    if (submitting) return;
    if (!otp.match(/^\d{6}$/))
      return setErr("Enter the 6-digit code from your email.");
    setSubmitting(true);
    try {
      const result = await dispatch(
        signup({ name: name.trim(), email: email.trim(), password: pw, otp }),
      ).unwrap();
      onAuthed(true, result.user.name);
    } catch (error) {
      if (isExistingAccountError(error)) {
        setMode("signin");
        setScreen("creds");
        setPw("");
        setPw2("");
        setErr("User already exists. Log in.");
      } else {
        setErr(
          error instanceof Error
            ? error.message
            : "Invalid or expired signup code.",
        );
      }
    } finally {
      setSubmitting(false);
    }
  };
  const requestResetOtp = async () => {
    setErr("");
    if (submitting) return;
    if (!email.trim()) return setErr("Enter your account email.");
    setSubmitting(true);
    try {
      await api.auth.forgotPasswordOtp({ email: email.trim() });
      setOtp("");
      setScreen("forgot-code");
    } catch (error) {
      setErr(error instanceof Error ? error.message : "Email not valid.");
    } finally {
      setSubmitting(false);
    }
  };
  const continueWithOtp = () => {
    setErr("");
    if (!otp.match(/^\d{6}$/)) {
      setErr("Enter the 6-digit code from your email.");
      return;
    }
    setScreen("forgot-password");
  };
  const resetPassword = async () => {
    setErr("");
    if (submitting) return;
    const passwordError = passwordRule(resetPw);
    if (passwordError) return setErr(passwordError);
    if (resetPw !== resetPw2) return setErr("Passwords do not match.");
    setSubmitting(true);
    try {
      await api.auth.resetPasswordOtp({
        email: email.trim(),
        otp,
        password: resetPw,
      });
      toast.success("Password updated. Please sign in again.");
      setMode("signin");
      setScreen("creds");
      setPw("");
      setPw2("");
      setResetPw("");
      setResetPw2("");
      setOtp("");
    } catch (error) {
      setErr(
        error instanceof Error ? error.message : "Unable to update password.",
      );
    } finally {
      setSubmitting(false);
    }
  };
  const SEC = [
    [
      "Encrypted storage",
      "Documents are stored encrypted and protected in transit",
    ],
    [
      "Consent-led AI analysis",
      "Document content is analyzed only when you choose that option",
    ],
    [
      "Secure account sessions",
      "Refresh-cookie sessions keep access scoped to your account",
    ],
    [
      "App lock and biometrics",
      "Face or fingerprint on mobile, PIN on shared screens",
    ],
    [
      "Emergency SOS handoff",
      "The right people get access only when you release it",
    ],
    ["Export your data", "Prepare an archive from Settings"],
  ];

  const error = err ? (
    <Text as="p" id="auth-error" role="alert" size="md" tone="danger">
      {err}
    </Text>
  ) : null;
  const describedBy = err ? "auth-error" : undefined;
  const back = () => {
    setScreen("start");
    setErr("");
  };
return { initMode, onClose, onAuthed, dispatch, mode, setMode, screen, setScreen, name, setName, email, setEmail, pw, setPw, pw2, setPw2, pin, setPin, err, setErr, otp, setOtp, resetPw, setResetPw, resetPw2, setResetPw2, submitting, setSubmitting, passwordRule, submit, handleGoogleCredential, submitPin, verifySignupOtp, requestResetOtp, continueWithOtp, resetPassword, SEC, error, describedBy, back };
}
