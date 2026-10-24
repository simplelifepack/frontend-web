import { useEffect, useRef, useState } from "react";
import {
  Button,
  Heading,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalPanel,
  Stack,
  Text,
} from "@/design-system";
import { billingPrice, type BillingPlan } from "@/lib/billing-api";

export default function RazorpayTestPaymentButton({
  buttonId,
  plan,
  onClose,
}: {
  buttonId: string;
  plan: BillingPlan;
  onClose: () => void;
}) {
  const form = useRef<HTMLFormElement>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const container = form.current;
    if (!container) return;
    let active = true;
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/payment-button.js";
    script.dataset.payment_button_id = buttonId;
    script.async = true;
    script.onload = () => {
      if (active) setLoading(false);
    };
    script.onerror = () => {
      if (active) {
        setLoading(false);
        setError(true);
      }
    };
    container.appendChild(script);
    return () => {
      active = false;
      container.replaceChildren();
    };
  }, [buttonId, attempt]);
  return (
    <ModalBackdrop onClick={onClose}>
      <ModalPanel
        size="compact"
        onDismiss={onClose}
        onClick={(event) => event.stopPropagation()}
        aria-label="Razorpay test payment"
      >
        <ModalHeader>
          <Heading level={2} size="sm">
            Razorpay test payment
          </Heading>
          <Button
            variant="tertiary"
            onClick={onClose}
            aria-label="Close test payment"
          >
            Close
          </Button>
        </ModalHeader>
        <ModalContent>
          <Stack $gap="s16">
            <Text>
              {plan.name} · ₹{billingPrice(plan.amountPaise)}/
              {plan.id === "annual" ? "year" : "month"}
            </Text>
            <Text size="sm" tone="muted">
              This test button uses the amount configured in Razorpay. It does
              not activate or automatically renew your Full plan.
            </Text>
            {loading && (
              <Text role="status">Loading Razorpay test button…</Text>
            )}
            <form
              ref={form}
              aria-label="Hosted Razorpay payment button"
              onSubmit={(event) => event.preventDefault()}
            />
            {error && (
              <>
                <Text role="alert" tone="danger">
                  The payment button could not load. Check your connection and
                  try again.
                </Text>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setError(false);
                    setLoading(true);
                    setAttempt((value) => value + 1);
                  }}
                >
                  Retry
                </Button>
              </>
            )}
          </Stack>
        </ModalContent>
      </ModalPanel>
    </ModalBackdrop>
  );
}
