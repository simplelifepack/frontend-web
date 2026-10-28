import { Text, ModalForm, ModalActions, ModalDetailRow, PasswordInput, Input, Button, Center } from "@/design-system";
import { ArrowRight } from "lucide-react";
import { useAuthModalLogic } from "./Landing.useAuthModalLogic";


export function AuthModalViewSection4(context: ReturnType<typeof useAuthModalLogic>) {
const { initMode, onClose, onAuthed, dispatch, mode, setMode, screen, setScreen, name, setName, email, setEmail, pw, setPw, pw2, setPw2, pin, setPin, err, setErr, otp, setOtp, resetPw, setResetPw, resetPw2, setResetPw2, submitting, setSubmitting, passwordRule, submit, handleGoogleCredential, submitPin, verifySignupOtp, requestResetOtp, continueWithOtp, resetPassword, SEC, error, describedBy, back } = context;
return (<ModalForm>
                <Text as="p" tone="muted">
                  Enter the 6-digit code sent to {email.trim()} to create your
                  account.
                </Text>
                <Input
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6}"
                  aria-label="6-digit code"
                  placeholder="6-digit code"
                  textAlign="center"
                  value={otp}
                  onChange={(event) => setOtp(event.target.value)}
                  aria-describedby={describedBy}
                  onKeyDown={(event) =>
                    event.key === "Enter" && verifySignupOtp()
                  }
                />
                {error}
                <ModalActions>
                  <Button
                    fullWidth
                    size="lg"
                    variant="primary"
                    loading={submitting}
                    onClick={verifySignupOtp}
                  >
                    {submitting ? "Verifying..." : "Verify and create account"}
                    <ArrowRight aria-hidden="true" />
                  </Button>
                  <Button
                    variant="tertiary"
                    onClick={() => {
                      setScreen("creds");
                      setErr("");
                    }}
                  >
                    ← Edit signup details
                  </Button>
                </ModalActions>
              </ModalForm>);
}


export function AuthModalViewSection5(context: ReturnType<typeof useAuthModalLogic>) {
const { initMode, onClose, onAuthed, dispatch, mode, setMode, screen, setScreen, name, setName, email, setEmail, pw, setPw, pw2, setPw2, pin, setPin, err, setErr, otp, setOtp, resetPw, setResetPw, resetPw2, setResetPw2, submitting, setSubmitting, passwordRule, submit, handleGoogleCredential, submitPin, verifySignupOtp, requestResetOtp, continueWithOtp, resetPassword, SEC, error, describedBy, back } = context;
return (<ModalForm>
                <Text as="p" tone="muted">
                  Enter your account email. If it exists, we will send a 6-digit
                  reset code.
                </Text>
                <Input
                  type="email"
                  autoComplete="email"
                  aria-label="Email"
                  placeholder="Email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  aria-describedby={describedBy}
                  onKeyDown={(event) =>
                    event.key === "Enter" && requestResetOtp()
                  }
                />
                {error}
                <ModalActions>
                  <Button
                    fullWidth
                    size="lg"
                    variant="primary"
                    loading={submitting}
                    onClick={requestResetOtp}
                  >
                    {submitting ? "Sending..." : "Send OTP"}
                    <ArrowRight aria-hidden="true" />
                  </Button>
                  <Button variant="tertiary" onClick={back}>
                    ← Back to sign in
                  </Button>
                </ModalActions>
              </ModalForm>);
}


export function AuthModalViewSection6(context: ReturnType<typeof useAuthModalLogic>) {
const { initMode, onClose, onAuthed, dispatch, mode, setMode, screen, setScreen, name, setName, email, setEmail, pw, setPw, pw2, setPw2, pin, setPin, err, setErr, otp, setOtp, resetPw, setResetPw, resetPw2, setResetPw2, submitting, setSubmitting, passwordRule, submit, handleGoogleCredential, submitPin, verifySignupOtp, requestResetOtp, continueWithOtp, resetPassword, SEC, error, describedBy, back } = context;
return (<ModalForm>
                <Text as="p" tone="muted">
                  Check your email for the 6-digit OTP. It expires in 30
                  minutes.
                </Text>
                <ModalDetailRow>
                  <Text weight="semibold" tone="heading">
                    {email}
                  </Text>
                  <Button
                    size="sm"
                    variant="tertiary"
                    onClick={() => setScreen("forgot-email")}
                  >
                    Edit
                  </Button>
                </ModalDetailRow>
                <Input
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  aria-label="Reset code"
                  placeholder="000000"
                  textAlign="center"
                  value={otp}
                  autoFocus
                  onChange={(event) =>
                    setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  aria-describedby={describedBy}
                  onKeyDown={(event) =>
                    event.key === "Enter" &&
                    otp.length === 6 &&
                    continueWithOtp()
                  }
                />
                {error}
                <ModalActions>
                  <Button
                    fullWidth
                    size="lg"
                    variant="primary"
                    onClick={continueWithOtp}
                    disabled={otp.length !== 6}
                  >
                    Continue
                    <ArrowRight aria-hidden="true" />
                  </Button>
                </ModalActions>
                <Center>
                  <Button
                    variant="tertiary"
                    size="sm"
                    loading={submitting}
                    onClick={requestResetOtp}
                  >
                    Resend OTP
                  </Button>
                </Center>
              </ModalForm>);
}


export function AuthModalViewSection7(context: ReturnType<typeof useAuthModalLogic>) {
const { initMode, onClose, onAuthed, dispatch, mode, setMode, screen, setScreen, name, setName, email, setEmail, pw, setPw, pw2, setPw2, pin, setPin, err, setErr, otp, setOtp, resetPw, setResetPw, resetPw2, setResetPw2, submitting, setSubmitting, passwordRule, submit, handleGoogleCredential, submitPin, verifySignupOtp, requestResetOtp, continueWithOtp, resetPassword, SEC, error, describedBy, back } = context;
return (<ModalForm>
                <Text as="p" tone="muted">
                  Use at least 8 characters with lowercase, uppercase, number,
                  and symbol.
                </Text>
                <PasswordInput
                  autoComplete="new-password"
                  aria-label="New password"
                  placeholder="New password"
                  value={resetPw}
                  onChange={(event) => setResetPw(event.target.value)}
                  aria-describedby={describedBy}
                />
                <PasswordInput
                  autoComplete="new-password"
                  aria-label="Confirm new password"
                  placeholder="Confirm password"
                  value={resetPw2}
                  onChange={(event) => setResetPw2(event.target.value)}
                  aria-describedby={describedBy}
                  onKeyDown={(event) =>
                    event.key === "Enter" && resetPassword()
                  }
                />
                {error}
                <ModalActions>
                  <Button
                    fullWidth
                    size="lg"
                    variant="primary"
                    loading={submitting}
                    onClick={resetPassword}
                  >
                    {submitting ? "Updating..." : "Update password"}
                    <ArrowRight aria-hidden="true" />
                  </Button>
                  <Button
                    variant="tertiary"
                    onClick={() => {
                      setErr("");
                      setScreen("forgot-code");
                    }}
                  >
                    ← Back
                  </Button>
                </ModalActions>
              </ModalForm>);
}
