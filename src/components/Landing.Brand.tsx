import { motion } from "framer-motion";
import { fade } from "./LandingVisuals";
import { type ReactNode } from "react";
import { Text, Heading, ModalPanel, ModalColumns, ModalContent, ModalAside, ModalHeader, ModalBullet, ModalBulletIcon, ModalBackdrop, Button, Stack, Grid, Row, colors, spacing, vars } from "@/design-system";
import { BrandMark, BrandWordmark } from "./BrandLogo";
import { Check, X } from "lucide-react";
import { useAuthModalLogic } from "./Landing.useAuthModalLogic";
import { AuthModalViewSection1, AuthModalViewSection2, AuthModalViewSection3 } from "./Landing.AuthModalViewSection1";
import { AuthModalViewSection4, AuthModalViewSection5, AuthModalViewSection6, AuthModalViewSection7 } from "./Landing.AuthModalViewSection4";


export function Brand() {
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


export function Highlights({ items }: { items: readonly string[] }) {
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


export function Feature({
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
export const freePrice = 0;

export const freeFeatures = [
  "Encrypted vault with 50 MB of storage",
  "3 AI package searches a month, when enabled",
  "Prepare packages from document checklists",
  "Browse modules and add records manually",
  "Export your data from Settings",
];

export const paidFeatures = [
  "All available packages",
  "AI processing without a monthly action limit, when enabled",
  "Encrypted storage for your whole family",
  "Documents, Health, Wealth, and family access",
  "Export your data from Settings",
];

export const comparison = [
  ["Encrypted storage", "50 MB", "For your whole family"],
  ["AI package searches, with your consent", "3 a month", "Unlimited"],
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


export function isExistingAccountError(error: unknown) {
  return error instanceof Error && /already exists/i.test(error.message);
}


 export function AuthModal(props: Parameters<typeof useAuthModalLogic>[0]) {
const context = useAuthModalLogic(props);
const { initMode, onClose, onAuthed, dispatch, mode, setMode, screen, setScreen, name, setName, email, setEmail, pw, setPw, pw2, setPw2, pin, setPin, err, setErr, otp, setOtp, resetPw, setResetPw, resetPw2, setResetPw2, submitting, setSubmitting, passwordRule, submit, handleGoogleCredential, submitPin, verifySignupOtp, requestResetOtp, continueWithOtp, resetPassword, SEC, error, describedBy, back } = context;

return ((
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
              <AuthModalViewSection1 {...context} />
            )}

            {screen === "creds" && (
              <AuthModalViewSection2 {...context} />
            )}

            {screen === "pin-creds" && (
              <AuthModalViewSection3 {...context} />
            )}

            {screen === "signup-code" && (
              <AuthModalViewSection4 {...context} />
            )}

            {screen === "forgot-email" && (
              <AuthModalViewSection5 {...context} />
            )}

            {screen === "forgot-code" && (
              <AuthModalViewSection6 {...context} />
            )}

            {screen === "forgot-password" && (
              <AuthModalViewSection7 {...context} />
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
  ));
}
