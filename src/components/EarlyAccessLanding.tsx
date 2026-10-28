import { useEffect, useState } from "react";
import { MotionConfig } from "framer-motion";
import { BrandSurface } from "@/design-system/components/BrandSurface";
import { clearBillingIntent } from "@/lib/billing-api";
import { AuthModal } from "./Landing.Brand";
import WaitlistModal from "./WaitlistModal";
import { EarlyAccessHero } from "./EarlyAccessHero";

type Props = {
  initialAuthMode?: "signin" | "signup" | null;
  onAuthed: (isNew: boolean) => void;
};

export default function EarlyAccessLanding({
  initialAuthMode = null,
  onAuthed,
}: Props) {
  const [auth, setAuth] = useState(initialAuthMode);
  const [unsubscribeToken, setUnsubscribeToken] = useState(
    () =>
      new URLSearchParams(window.location.search).get("waitlistUnsubscribe") ??
      undefined,
  );
  useEffect(() => {
    if (initialAuthMode) setAuth(initialAuthMode);
  }, [initialAuthMode]);
  return (
    <MotionConfig reducedMotion="user">
      <EarlyAccessHero onSignIn={() => setAuth("signin")} />
      <BrandSurface>
        {auth && (
          <AuthModal
            mode={auth}
            onClose={() => {
              setAuth(null);
              clearBillingIntent();
            }}
            onAuthed={(isNew) => {
              if (isNew) sessionStorage.setItem("lp-new-account", "1");
              onAuthed(isNew);
            }}
          />
        )}
        {unsubscribeToken && (
          <WaitlistModal
            unsubscribeToken={unsubscribeToken}
            onClose={() => {
              setUnsubscribeToken(undefined);
              const url = new URL(window.location.href);
              url.searchParams.delete("waitlistUnsubscribe");
              window.history.replaceState(
                window.history.state,
                "",
                `${url.pathname}${url.search}${url.hash}`,
              );
            }}
          />
        )}
      </BrandSurface>
    </MotionConfig>
  );
}
