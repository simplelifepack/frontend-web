import WaitlistModal from "./WaitlistModal";
import { motion, MotionConfig } from "framer-motion";
import {
  BrandSurface,
  BrandBackdrop,
  BrandCallout,
  BrandPlanHeader,
} from "@/design-system/components/BrandSurface";
import { landingBrand as C } from "@/design-system/variables/brand";
import {
  Radar,
  ReadinessMock,
  PackDetail,
  DocGraph,
  WealthMock,
  HealthMock,
  MomentCard,
  MOMENTS,
  fade,
} from "./LandingVisuals";
import { useEffect, useState, type MouseEvent, type ReactNode } from "react";
import {
  Text,
  Heading,
  ChoiceGroup,
  Choice,
  ModalPanel,
  ModalColumns,
  ModalContent,
  ModalAside,
  ModalHeader,
  ModalOptions,
  ModalForm,
  ModalActions,
  ModalDetailRow,
  ModalBullet,
  ModalBulletIcon,
  PasswordInput,
  ModalBackdrop,
  Input,
  Button,
  Card,
  Pill,
  Stack,
  Container,
  Section,
  Grid,
  Row,
  Center,
  Content,
  SiteNav,
  NavLayout,
  NavLink,
  SurfaceHeader,
  ScrollRegion,
  ComparisonTable,
  LinearProgress,
  colors,
  spacing,
  vars,
} from "@/design-system";
import { BrandMark, BrandWordmark } from "./BrandLogo";
import { billingApi, billingPrice, requestBillingCheckout, clearBillingIntent, selectedBillingPlan, selectBillingPlan, type BillingCatalogue } from "@/lib/billing-api";
import { api } from "@/lib/api";
import { useAppDispatch } from "@/store/hooks";
import {
  googleLogin,
  login,
  loginWithPin,
  signup,
} from "@/store/slices/authSlice";
import GoogleSignInButton from "./GoogleSignInButton";
import { toast } from "sonner";
import {
  ShieldCheck,
  ArrowRight,
  HeartPulse,
  Lock,
  Wallet,
  Check,
  UploadCloud,
  Sparkles,
  FileText,
  Plane,
  Briefcase,
  X,
  FolderOpen,
  Users,
  Search,
  Mail,
  HardDrive,
} from "lucide-react";

function Brand() {
  return (
    <Row $gap="s8">
      <BrandMark
        size={Number.parseInt(spacing.s24)}
        color={colors.readiness}
        carve={colors.surface}
      />
      <BrandWordmark
        tick
        size={Number.parseInt(spacing.s18)}
        color={colors.heading}
        accent={colors.readiness}
      />
    </Row>
  );
}

function Highlights({ items }: { items: readonly string[] }) {
  return (
    <Stack as="ul" $gap="s8">
      {items.map((item) => (
        <Row as="li" key={item} $wrap={false}>
          <Check
            aria-hidden="true"
            size={vars.icons.small}
            color={colors.success}
          />
          <Text size="md">{item}</Text>
        </Row>
      ))}
    </Stack>
  );
}

function Feature({
  name,
  title,
  body,
  points,
  children,
  reverse,
}: {
  name: string;
  title: string;
  body: string;
  points: string[];
  children: ReactNode;
  reverse?: boolean;
}) {
  return (
    <motion.div {...fade()}>
      <Grid $reverse={reverse} $align="center">
        <Stack $gap="s18">
          <Text tone="muted" weight="semibold">
            {name}
          </Text>
          <Heading level={3} size="lg">
            {title}
          </Heading>
          <Text as="p" size="lg">
            {body}
          </Text>
          <Highlights items={points} />
        </Stack>
        {children}
      </Grid>
    </motion.div>
  );
}

// Existing advertised prices and offer calculation; signup remains the CTA action.
const freePrice = 0;
const freeFeatures = [
  "Encrypted vault with 50 MB of storage",
  "3 AI actions a month, when enabled",
  "Prepare packages from document checklists",
  "Browse modules and add records manually",
  "Export your data from Settings",
];
const paidFeatures = [
  "All available packages",
  "AI processing without a monthly action limit, when enabled",
  "Encrypted storage for your whole family",
  "Documents, Health, Wealth, and family access",
  "Export your data from Settings",
];
const comparison = [
  ["Encrypted storage", "50 MB", "For your whole family"],
  ["AI actions, with your consent", "3 a month", "Unlimited"],
  [
    "Package checklists",
    "Browse available packages",
    "Browse available packages",
  ],
  ["Documents, Health, Wealth, and family access", "Included", "Included"],
  [
    "Gmail and Google Drive imports",
    "Connect from Documents",
    "Connect from Documents",
  ],
  [
    "Export your documents and data",
    "Available in Settings",
    "Available in Settings",
  ],
];

function isExistingAccountError(error: unknown) {
  return error instanceof Error && /already exists/i.test(error.message);
}

function AuthModal({
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

  return (
    <ModalBackdrop onClick={onClose}>
      <ModalPanel
        onDismiss={onClose}
        aria-label="Account access"
        flush
        size={screen === "start" ? "wide" : "compact"}
        onClick={(event) => event.stopPropagation()}
      >
        <ModalColumns>
          <ModalContent>
            <ModalHeader>
              <Text as="b" size="lg" weight="semibold" tone="heading">
                {screen === "forgot-email"
                  ? "Reset your password"
                  : screen === "signup-code" || screen === "forgot-code"
                    ? "Check your email"
                    : screen === "forgot-password"
                      ? "Create a new password"
                      : screen === "pin-creds"
                        ? "Sign in with PIN"
                        : mode === "signin"
                          ? "Welcome back"
                          : "Create your account"}
              </Text>
              <Button
                size="sm"
                iconOnly
                variant="tertiary"
                aria-label="Close sign in"
                onClick={onClose}
              >
                <X aria-hidden="true" />
              </Button>
            </ModalHeader>

            {screen === "start" && (
              <Stack $gap="s14">
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
              </Stack>
            )}

            {screen === "creds" && (
              <ModalForm>
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
              </ModalForm>
            )}

            {screen === "pin-creds" && (
              <ModalForm>
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
              </ModalForm>
            )}

            {screen === "signup-code" && (
              <ModalForm>
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
              </ModalForm>
            )}

            {screen === "forgot-email" && (
              <ModalForm>
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
              </ModalForm>
            )}

            {screen === "forgot-code" && (
              <ModalForm>
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
              </ModalForm>
            )}

            {screen === "forgot-password" && (
              <ModalForm>
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
              </ModalForm>
            )}
          </ModalContent>
          {screen === "start" && (
            <ModalAside aria-label="Account security information">
              <Text as="b" size="lg" weight="semibold" tone="heading">
                Your documents, with you in control.
              </Text>
              <Stack $gap="s10">
                {SEC.map(([title, description]) => (
                  <ModalBullet key={title}>
                    <ModalBulletIcon>
                      <Check aria-hidden="true" size={spacing.s12} />
                    </ModalBulletIcon>
                    <div>
                      <Text as="div" size="md" weight="semibold" tone="heading">
                        {title}
                      </Text>
                      <Text as="div" size="sm" tone="muted">
                        {description}
                      </Text>
                    </div>
                  </ModalBullet>
                ))}
              </Stack>
            </ModalAside>
          )}
        </ModalColumns>
      </ModalPanel>
    </ModalBackdrop>
  );
}

export default function Landing({
  initialAuthMode = null,
  earlyAccess = false,
  onAuthed,
}: {
  earlyAccess?: boolean;
  initialAuthMode?: "signin" | "signup" | null;
  onAuthed: (isNew: boolean) => void;
}) {
  const [auth, setAuth] = useState<null | "signin" | "signup">(earlyAccess ? null : initialAuthMode);
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [unsubscribeToken, setUnsubscribeToken] = useState(() => new URLSearchParams(window.location.search).get("waitlistUnsubscribe") ?? undefined);
  const [billing, setBilling] = useState<"annual" | "monthly">(selectedBillingPlan);
  const [catalogue, setCatalogue] = useState<BillingCatalogue | null>(null);
  useEffect(() => { if (!earlyAccess) void billingApi.plans().then(setCatalogue).catch(() => {}); }, [earlyAccess]);
  const startPaid = () => {
    if (earlyAccess) { setWaitlistOpen(true); return; }
    if (!catalogue?.available) { toast.error("Payments are not available yet. Please try again later."); return; }
    requestBillingCheckout(billing); start();
  };
  useEffect(() => {
    if (!earlyAccess && initialAuthMode) setAuth(initialAuthMode);
  }, [earlyAccess, initialAuthMode]);
  const start = () => {
    if (earlyAccess) { setWaitlistOpen(true); return; }
    sessionStorage.setItem("lp-fresh", "1");
    setAuth("signup");
  };
  const navigateSection = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
      return;
    const id = event.currentTarget.hash;
    const target = document.getElementById(id.slice(1));
    if (!target) return;
    event.preventDefault();
    const nav = event.currentTarget.closest("nav");
    const top =
      target.getBoundingClientRect().top +
      window.scrollY -
      (nav?.getBoundingClientRect().height ?? 0) -
      Number.parseInt(spacing.s16);
    window.history.pushState(null, "", id);
    target.focus({ preventScroll: true });
    window.scrollTo({
      top,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  };
  return (
    <MotionConfig reducedMotion="user">
      <BrandSurface>
        <SiteNav aria-label="Main navigation">
          <Container>
            <NavLayout>
              <Brand />
              <Row as="div" $gap="s18" $justify="center">
                {[
                  ["features", "Features"],
                  ["how", "How it works"],
                  ["privacy", "Privacy"],
                  ["pricing", "Pricing"],
                ].map(([id, label]) => (
                  <NavLink key={id} href={`#${id}`} onClick={navigateSection}>
                    {label}
                  </NavLink>
                ))}
              </Row>
              <Button
                size="sm"
                variant="tertiary"
                onClick={() => earlyAccess ? setWaitlistOpen(true) : setAuth("signin")}
              >
                {earlyAccess ? "Register for Early Access" : "Sign in"}
              </Button>
            </NavLayout>
          </Container>
        </SiteNav>
        <main>
          <header className="lp-hero">
            <div className="lp-herobg" aria-hidden>
              <Radar />
            </div>
            <div className="lp-heroinner">
              <motion.div {...fade()}>
                <Heading level={1} size="xl" className="lp-h1">
                  Your documents,
                  <br />
                  in order and{" "}
                  <span style={{ color: C.clay }}>
                    ready
                    <br />
                    when you need them.
                  </span>
                </Heading>
                <Text as="p" size="md" className="lp-sub">
                  Readines helps you organize important records, find what you
                  need, and prepare for life’s important moments.
                </Text>
                <div className="lp-herocta">
                  <Button
                    size="lg"
                    variant="primary"
                    type="button"
                    onClick={start}
                  >
                    {earlyAccess ? "Register for Early Access" : "Get started"}{" "}
                    <ArrowRight
                      aria-hidden="true"
                      focusable="false"
                      size={17}
                    />
                  </Button>
                  <Text size="md" className="lp-trust">
                    <Lock aria-hidden="true" focusable="false" size={12} />{" "}
                    Private by design | Encrypted storage | You control what is
                    stored.
                  </Text>
                </div>
              </motion.div>
              <div className="lp-heromock">
                <ReadinessMock />
              </div>
            </div>
            <div className="lp-connectors">
              <Text size="md">
                Upload files or photos, review Gmail attachments, or scan
                connected Google Drive from Documents.
              </Text>
              <Text size="md" className="lp-conn">
                <Mail aria-hidden="true" focusable="false" size={14} /> Email
              </Text>
              <Text size="md" className="lp-conn">
                <HardDrive aria-hidden="true" focusable="false" size={14} />{" "}
                Drive
              </Text>
              <Text size="md" className="lp-conn">
                <UploadCloud aria-hidden="true" focusable="false" size={14} />{" "}
                Upload &amp; scan
              </Text>
            </div>
          </header>

          <Section
            id="how"
            tabIndex={-1}
            aria-labelledby="how-heading"
            data-brand-tone="raised"
          >
            <motion.div {...fade()}>
              <Container>
                <Stack $gap="s32">
                  <Center>
                    <Heading id="how-heading" level={2} size="lg">
                      How it works
                    </Heading>
                    <Text as="p" size="lg">
                      From scattered paperwork to the records you need.
                    </Text>
                  </Center>
                  <Grid $columns={3}>
                    {[
                      {
                        icon: UploadCloud,
                        title: "Add your documents",
                        body: "Upload a file or photo. Or connect Gmail to review attachments, or Google Drive to scan documents.",
                      },
                      {
                        icon: Sparkles,
                        title: "Organize and review",
                        body: "Choose AI processing to extract document details, then review the results. You can also enter details manually.",
                      },
                      {
                        icon: Briefcase,
                        title: "Find it. Prepare it.",
                        body: "Search your records, choose a package, and check which documents are ready and what is missing.",
                      },
                    ].map((step, i) => (
                      <Card key={step.title}>
                        <Stack $gap="s16">
                          <Row $justify="space-between">
                            <step.icon
                              aria-hidden="true"
                              color={colors.action}
                            />
                            <Text tone="muted">0{i + 1}</Text>
                          </Row>
                          <Heading level={3} size="sm">
                            {step.title}
                          </Heading>
                          <Text as="p">{step.body}</Text>
                        </Stack>
                      </Card>
                    ))}
                  </Grid>
                </Stack>
              </Container>
            </motion.div>
          </Section>
          <Section id="privacy" tabIndex={-1} aria-labelledby="privacy-heading">
            <motion.div {...fade()}>
              <Container>
                <Card>
                  <Content>
                    <Stack $gap="s24">
                      <Row>
                        <Lock aria-hidden="true" color={colors.action} />
                        <Heading id="privacy-heading" level={2} size="lg">
                          Privacy: private by design
                        </Heading>
                      </Row>
                      <Text as="p" size="lg">
                        Your documents are stored encrypted. Readines manages
                        the encryption keys to support the features you choose,
                        including document analysis and export.
                      </Text>
                      <Grid $columns={3}>
                        {[
                          [
                            "You control your documents",
                            "Choose what you upload, review extracted details, and export your documents and data from Settings.",
                          ],
                          [
                            "Sharing needs your permission",
                            "Use Trust Center to choose who can access your records and manage their permissions.",
                          ],
                          [
                            "AI processing is your choice",
                            "When enabled, document content is sent for AI processing. Keep it disabled to enter details manually.",
                          ],
                        ].map(([title, body]) => (
                          <Stack key={title}>
                            <Heading level={3} size="sm">
                              {title}
                            </Heading>
                            <Text as="p">{body}</Text>
                          </Stack>
                        ))}
                      </Grid>
                    </Stack>
                  </Content>
                </Card>
              </Container>
            </motion.div>
          </Section>
          <Section $tone="raised">
            <Container>
              <Stack $gap="s32">
                <Center>
                  <Heading level={2} size="lg">
                    Life happens. Keep the paperwork ready.
                  </Heading>
                  <Text as="p">
                    For a new role, a new place, a trip, or a care visit, keep
                    important records in reach.
                  </Text>
                </Center>
                <div className="lp-moments">
                  {MOMENTS.map((m, i) => (
                    <MomentCard key={m.kind} m={m} i={i} />
                  ))}
                </div>
                <Center>
                  <Text as="p" size="lg">
                    Open Readines to find your records, review what is missing,
                    and prepare for what comes next.
                  </Text>
                </Center>
              </Stack>
            </Container>
          </Section>
          <Section
            id="features"
            tabIndex={-1}
            aria-labelledby="features-heading"
          >
            <Container>
              <Stack $gap="s60">
                <Center>
                  <Heading id="features-heading" level={2} size="lg">
                    Features
                  </Heading>
                  <Text as="p" size="lg">
                    Four modules for the records that matter.
                  </Text>
                </Center>
                <Feature
                  name="Packages"
                  title="Know what is ready and what is missing."
                  body="Choose a life event and review the required documents. Match records from your library and fill the gaps before you need them."
                  points={[
                    "Clear document checklists",
                    "Review and change document matches",
                    "Prepare and export your package",
                  ]}
                >
                  <PackDetail />
                </Feature>
                <Feature
                  reverse
                  name="Documents"
                  title="A home for your important records."
                  body="Upload documents or import from Gmail and Google Drive. Review extracted details when AI processing is enabled, organize records, and search when you need them."
                  points={[
                    "Files and photos in one library",
                    "Review categories and document details",
                    "Search across your records",
                  ]}
                >
                  <DocGraph />
                </Feature>
                <Feature
                  name="Health"
                  title="Bring the right records to your next visit."
                  body="Keep reports, medications, and measurements together for each family member. Review trends and prepare records for appointments."
                  points={[
                    "Health records for family members",
                    "Measurements and medication lists",
                    "Doctor visit preparation",
                  ]}
                >
                  <HealthMock />
                </Feature>
                <Feature
                  reverse
                  name="Wealth"
                  title="See your financial records more clearly."
                  body="Keep assets, loans, and insurance records together. Review recorded values and nominee details, with supporting documents close at hand."
                  points={[
                    "Assets, loans, and insurance",
                    "Review nominee information",
                    "Link supporting documents",
                  ]}
                >
                  <WealthMock />
                </Feature>
              </Stack>
            </Container>
          </Section>
          <Section
            id="pricing"
            tabIndex={-1}
            aria-labelledby="pricing-heading"
            $tone="raised"
          >
            <motion.div {...fade()}>
              <Container>
                <Stack $gap="s32">
                  <Center>
                    <Heading id="pricing-heading" level={2} size="lg">
                      Pricing
                    </Heading>
                    <Text as="p" size="lg">
                      Start with the essentials. Choose more room when you need
                      it.
                    </Text>
                  </Center>
                  <Grid $sharedRows={5}>
                    <Card flush>
                      <BrandPlanHeader>Free</BrandPlanHeader>
                      <Content>
                        <Text tone="muted">Begin with the essentials</Text>
                      </Content>
                      <Content>
                        <Center>
                          <Heading level={3} size="lg">
                            ₹{freePrice}
                          </Heading>
                          <Text>Everything you need to try Readines.</Text>
                        </Center>
                      </Content>
                      <Content>
                        <Highlights items={freeFeatures} />
                      </Content>
                      <Content>
                        <Button size="lg" variant="secondary" onClick={start}>
                          {earlyAccess ? "Register for Early Access" : "Start free"} <ArrowRight aria-hidden="true" />
                        </Button>
                      </Content>
                    </Card>
                    <Card flush>
                      <BrandPlanHeader $accent>Full plan</BrandPlanHeader>
                      <Content>
                        <ChoiceGroup aria-label="Billing period">
                          {(["annual", "monthly"] as const).map((period) => (
                            <Choice
                              key={period}
                              aria-pressed={billing === period}
                              onClick={() => { setBilling(period); if (!earlyAccess) selectBillingPlan(period); }}
                            >
                              {period === "annual" ? "Annual" : "Monthly"}
                            </Choice>
                          ))}
                        </ChoiceGroup>
                      </Content>
                      <Content>
                        <Center>
                          <Row>
                            <Heading level={3} size="lg">
                              {earlyAccess ? "At launch" : "₹"}
                              {earlyAccess ? "" : catalogue ? billingPrice(catalogue.plans[billing].amountPaise) : "—"}
                            </Heading>
                            <Text>
                              {earlyAccess ? "" : billing === "monthly" ? "/month" : "/year"}
                            </Text>
                          </Row>
                          <Text size="sm" tone="muted">
                            {earlyAccess ? "Paid plans will be available at launch." : catalogue
                              ? billing === "monthly"
                                ? `Cancel anytime · annual saves ₹${billingPrice(catalogue.annualSavingsPaise)} a year`
                                : `About ₹${catalogue.annualMonthlyEquivalent} a month, billed yearly`
                              : "Loading pricing…"}
                          </Text>
                          <Text size="sm" tone="muted">{earlyAccess ? "Register for updates" : catalogue?.testPaymentButtonId ? "Test payment button · No subscription activation" : "Renews automatically · Cancel anytime"}</Text>
                        </Center>
                      </Content>
                      <Content>
                        <Highlights items={paidFeatures} />
                      </Content>
                      <Content>
                        <Button size="lg" variant="primary" onClick={startPaid} disabled={!earlyAccess && !catalogue}>
                          {earlyAccess ? "Register for Early Access" : "Get started"} <ArrowRight aria-hidden="true" />
                        </Button>
                      </Content>
                    </Card>
                  </Grid>
                  <Card flush>
                    <ScrollRegion
                      role="region"
                      aria-label="Plan comparison"
                      tabIndex={0}
                    >
                      <ComparisonTable>
                        <caption>Compare plans</caption>
                        <thead>
                          <tr>
                            <th scope="col">What you get</th>
                            <th scope="col">Free</th>
                            <th scope="col">Full plan</th>
                          </tr>
                        </thead>
                        <tbody>
                          {comparison.map(([feature, free, paid]) => (
                            <tr key={feature}>
                              <th scope="row">{feature}</th>
                              <td>{free}</td>
                              <td>{paid}</td>
                            </tr>
                          ))}
                        </tbody>
                      </ComparisonTable>
                    </ScrollRegion>
                    <Content>
                      <Row>
                        <ShieldCheck aria-hidden="true" color={colors.action} />
                        <Heading level={3} size="sm">
                          Your documents remain yours.
                        </Heading>
                      </Row>
                      <Text as="p">
                        Export your documents and data from Settings on either
                        plan. Prepared export downloads are available for 24
                        hours; request a new export if the link expires.
                      </Text>
                    </Content>
                  </Card>
                </Stack>
              </Container>
            </motion.div>
          </Section>
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
  );
}
