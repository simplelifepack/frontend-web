import WaitlistModal from "./WaitlistModal";
import { MotionConfig } from "framer-motion";
import { BrandSurface, BrandBackdrop, BrandCallout } from "@/design-system/components/BrandSurface";
import { Radar } from "./LandingVisuals";
import { useState } from "react";
import { Text, Heading, Button, Container, Section, Row, Center, Content } from "@/design-system";
import { clearBillingIntent } from "@/lib/billing-api";
import { api } from "@/lib/api";
import { useAppDispatch } from "@/store/hooks";
import { googleLogin, login } from "@/store/slices/authSlice";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";
import { Brand, AuthModal, isExistingAccountError } from "./Landing.Brand";
import { useLandingLogic, LandingViewSection1, LandingViewSection2, LandingViewSection3 } from "./Landing.useLandingLogic";
import { LandingViewSection4, LandingViewSection5, LandingViewSection6 } from "./Landing.LandingViewSection4";
import { LandingViewSection7 } from "./Landing.LandingViewSection7";


export function Landing(props: Parameters<typeof useLandingLogic>[0]) {
const context = useLandingLogic(props);
const { initialAuthMode, earlyAccess, onAuthed, auth, setAuth, waitlistOpen, setWaitlistOpen, unsubscribeToken, setUnsubscribeToken, billing, setBilling, catalogue, setCatalogue, startPaid, start, navigateSection } = context;

return ((
    <MotionConfig reducedMotion="user">
      <BrandSurface>
        <LandingViewSection1 {...context} />
        <main>
          <LandingViewSection2 {...context} />

          <LandingViewSection3 {...context} />
          <LandingViewSection4 {...context} />
          <LandingViewSection5 {...context} />
          <LandingViewSection6 {...context} />
          <LandingViewSection7 {...context} />
          <Section>
            <Container>
              <BrandCallout $flush={false} $tone="default">
                <BrandBackdrop aria-hidden="true">
                  <Radar animated={false} />
                </BrandBackdrop>
                <Content $pad="s40">
                  <Center $gap="s24">
                    <Heading level={2} size="lg">
                      Be ready for life's important moments.
                    </Heading>
                    <Text as="p" size="lg">
                      Bring your records together, one document at a time.
                    </Text>
                    <Button size="lg" variant="primary" onClick={start}>
                      {earlyAccess ? "Register for Early Access" : "Get started"} <ArrowRight aria-hidden="true" />
                    </Button>
                  </Center>
                </Content>
              </BrandCallout>
            </Container>
          </Section>
        </main>
        <Section as="footer" $compact>
          <Container>
            <Row $justify="space-between">
              <Brand />
              <Text size="sm" tone="muted">
                Private by design · Encrypted storage · You control what is
                stored
              </Text>
            </Row>
          </Container>
        </Section>
        {(waitlistOpen || unsubscribeToken) && <WaitlistModal unsubscribeToken={unsubscribeToken} onClose={() => {
          setWaitlistOpen(false); setUnsubscribeToken(undefined);
          const url = new URL(window.location.href); url.searchParams.delete("waitlistUnsubscribe");
          window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
        }} />}
        {!earlyAccess && auth && (
          <AuthModal
            mode={auth}
            onClose={() => { setAuth(null); clearBillingIntent(); }}
            onAuthed={(isNew) => {
              if (isNew) sessionStorage.setItem("lp-new-account", "1");
              onAuthed(isNew);
            }}
          />
        )}
      </BrandSurface>
    </MotionConfig>
  ));
}


export function useAuthModalState({
  mode: initMode,
  onClose,
  onAuthed,
}: {
  mode: "signin" | "signup";
  onClose: () => void;
  onAuthed: (isNew: boolean, name: string) => void;
}) {

  const dispatch = useAppDispatch();
  const [mode, setMode] = useState<"signin" | "signup">(initMode);
  const [screen, setScreen] = useState<
    | "start"
    | "creds"
    | "pin-creds"
    | "signup-code"
    | "forgot-email"
    | "forgot-code"
    | "forgot-password"
  >("start");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [pin, setPin] = useState("");
  const [err, setErr] = useState("");
  const [otp, setOtp] = useState("");
  const [resetPw, setResetPw] = useState("");
  const [resetPw2, setResetPw2] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const passwordRule = (value: string) => {
    if (value.length < 8) return "Password must be at least 8 characters.";
    if (!/[a-z]/.test(value))
      return "Password must include a lowercase letter.";
    if (!/[A-Z]/.test(value))
      return "Password must include an uppercase letter.";
    if (!/\d/.test(value)) return "Password must include a number.";
    if (!/[^A-Za-z0-9]/.test(value)) return "Password must include a symbol.";
    return "";
  };
  const submit = async () => {
    setErr("");
    if (submitting) return;
    if (!email.trim() || !pw) return setErr("Enter your email and password.");
    setSubmitting(true);
    try {
      if (mode === "signup") {
        if (!name.trim()) return setErr("Enter your name.");
        if (pw !== pw2) return setErr("Passwords do not match.");
        await api.auth.requestSignupOtp({
          name: name.trim(),
          email: email.trim(),
          password: pw,
        });
        setOtp("");
        setScreen("signup-code");
      } else {
        const result = await dispatch(
          login({ email: email.trim(), password: pw }),
        ).unwrap();
        if (result.deletionCancelled) {
          toast.success(
            "Welcome back. Your account deletion request has been cancelled.",
          );
        }
        onAuthed(false, result.user.name);
      }
    } catch (error) {
      if (mode === "signup" && isExistingAccountError(error)) {
        setMode("signin");
        setPw("");
        setPw2("");
        setErr("User already exists. Log in.");
      } else {
        setErr(
          error instanceof Error
            ? error.message
            : mode === "signup"
              ? "Unable to create account."
              : "Unable to sign in.",
        );
      }
    } finally {
      setSubmitting(false);
    }
  };
  const handleGoogleCredential = async (credential: string) => {
    if (submitting) return;
    setErr("");
    setSubmitting(true);
    try {
      const result = await dispatch(googleLogin({ credential })).unwrap();
      if (result.deletionCancelled) {
        toast.success(
          "Welcome back. Your account deletion request has been cancelled.",
        );
      }
      onAuthed(mode === "signup", result.user.name);
    } catch {
      setErr(
        navigator.onLine
          ? "We could not authenticate that Google account."
          : "Check your connection and try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };
return { initMode, onClose, onAuthed, dispatch, mode, setMode, screen, setScreen, name, setName, email, setEmail, pw, setPw, pw2, setPw2, pin, setPin, err, setErr, otp, setOtp, resetPw, setResetPw, resetPw2, setResetPw2, submitting, setSubmitting, passwordRule, submit, handleGoogleCredential };
}
