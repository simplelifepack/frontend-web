import { Text, ChoiceGroup, Choice, ModalOptions, ModalForm, ModalActions, PasswordInput, Input, Button, Stack, Center } from "@/design-system";
import GoogleSignInButton from "./GoogleSignInButton";
import { ArrowRight } from "lucide-react";
import { useAuthModalLogic } from "./Landing.useAuthModalLogic";


export function AuthModalViewSection1(context: ReturnType<typeof useAuthModalLogic>) {
const { initMode, onClose, onAuthed, dispatch, mode, setMode, screen, setScreen, name, setName, email, setEmail, pw, setPw, pw2, setPw2, pin, setPin, err, setErr, otp, setOtp, resetPw, setResetPw, resetPw2, setResetPw2, submitting, setSubmitting, passwordRule, submit, handleGoogleCredential, submitPin, verifySignupOtp, requestResetOtp, continueWithOtp, resetPassword, SEC, error, describedBy, back } = context;
return (<Stack $gap="s14">
                <ChoiceGroup fullWidth aria-label="Account action">
                  {(["signin", "signup"] as const).map((value) => (
                    <Choice
                      key={value}
                      aria-pressed={mode === value}
                      onClick={() => {
                        setMode(value);
                        setErr("");
                      }}
                    >
                      {value === "signin" ? "Sign in" : "Create account"}
                    </Choice>
                  ))}
                </ChoiceGroup>
                <ModalOptions>
                  <GoogleSignInButton
                    disabled={submitting}
                    onCredential={handleGoogleCredential}
                    onError={setErr}
                  />
                  <Button
                    fullWidth
                    variant="primary"
                    onClick={() => setScreen("creds")}
                  >
                    Continue with email
                  </Button>
                  {mode === "signin" && (
                    <Button
                      fullWidth
                      variant="secondary"
                      onClick={() => {
                        setErr("");
                        setScreen("pin-creds");
                      }}
                    >
                      Sign in with PIN
                    </Button>
                  )}
                </ModalOptions>
                {mode === "signin" && (
                  <Center>
                    <Button
                      variant="tertiary"
                      onClick={() => {
                        setErr("");
                        setScreen("forgot-email");
                      }}
                    >
                      Forgot password?
                    </Button>
                  </Center>
                )}
                {error}
                <Center>
                  <Text as="p" size="sm" tone="muted">
                    By continuing you agree to our Terms and Privacy Policy.
                    <br />
                    Your account is created in Readines and protected by the
                    app's normal sign-in flow.
                  </Text>
                </Center>
              </Stack>);
}


export function AuthModalViewSection2(context: ReturnType<typeof useAuthModalLogic>) {
const { initMode, onClose, onAuthed, dispatch, mode, setMode, screen, setScreen, name, setName, email, setEmail, pw, setPw, pw2, setPw2, pin, setPin, err, setErr, otp, setOtp, resetPw, setResetPw, resetPw2, setResetPw2, submitting, setSubmitting, passwordRule, submit, handleGoogleCredential, submitPin, verifySignupOtp, requestResetOtp, continueWithOtp, resetPassword, SEC, error, describedBy, back } = context;
return (<ModalForm>
                {mode === "signup" && (
                  <Input
                    aria-label="Your name"
                    placeholder="Your name"
                    autoComplete="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                  />
                )}
                <Input
                  aria-label="Email"
                  placeholder="Email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  aria-describedby={describedBy}
                />
                <PasswordInput
                  aria-label="Password"
                  placeholder="Password"
                  autoComplete={
                    mode === "signup" ? "new-password" : "current-password"
                  }
                  value={pw}
                  onChange={(event) => setPw(event.target.value)}
                  aria-describedby={describedBy}
                  onKeyDown={(event) =>
                    event.key === "Enter" && mode === "signin" && submit()
                  }
                />
                {mode === "signup" && (
                  <PasswordInput
                    aria-label="Repeat password"
                    placeholder="Repeat password"
                    autoComplete="new-password"
                    value={pw2}
                    onChange={(event) => setPw2(event.target.value)}
                    aria-describedby={describedBy}
                    onKeyDown={(event) => event.key === "Enter" && submit()}
                  />
                )}
                {error}
                <ModalActions>
                  <Button
                    fullWidth
                    size="lg"
                    variant="primary"
                    loading={submitting}
                    onClick={submit}
                  >
                    {submitting
                      ? "Working..."
                      : mode === "signin"
                        ? "Sign in"
                        : "Create my Readines"}
                    <ArrowRight aria-hidden="true" />
                  </Button>
                  <Button variant="tertiary" onClick={back}>
                    ← Other sign-in options
                  </Button>
                </ModalActions>
              </ModalForm>);
}


export function AuthModalViewSection3(context: ReturnType<typeof useAuthModalLogic>) {
const { initMode, onClose, onAuthed, dispatch, mode, setMode, screen, setScreen, name, setName, email, setEmail, pw, setPw, pw2, setPw2, pin, setPin, err, setErr, otp, setOtp, resetPw, setResetPw, resetPw2, setResetPw2, submitting, setSubmitting, passwordRule, submit, handleGoogleCredential, submitPin, verifySignupOtp, requestResetOtp, continueWithOtp, resetPassword, SEC, error, describedBy, back } = context;
return (<ModalForm>
                <Input
                  type="email"
                  autoComplete="email"
                  aria-label="Email"
                  placeholder="Email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  aria-describedby={describedBy}
                />
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  aria-label="6-digit PIN"
                  placeholder="6-digit PIN"
                  value={pin}
                  onChange={(event) =>
                    setPin(event.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  aria-describedby={describedBy}
                  onKeyDown={(event) => event.key === "Enter" && submitPin()}
                />
                {error}
                <ModalActions>
                  <Button
                    fullWidth
                    size="lg"
                    variant="primary"
                    loading={submitting}
                    onClick={submitPin}
                  >
                    {submitting ? "Working..." : "Sign in with PIN"}
                    <ArrowRight aria-hidden="true" />
                  </Button>
                  <Button variant="tertiary" onClick={back}>
                    ← Other sign-in options
                  </Button>
                </ModalActions>
              </ModalForm>);
}
