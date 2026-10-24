import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  billingApi,
  billingIntentEvent,
  clearBillingIntent,
  pendingBillingPlan,
  type BillingPlan,
} from "@/lib/billing-api";
import RazorpayTestPaymentButton from "./RazorpayTestPaymentButton";
import { openRazorpay } from "@/lib/razorpay-checkout";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { refreshUsage } from "@/store/slices/usageSlice";

export default function BillingCheckoutController() {
  const dispatch = useAppDispatch();
  const { user, token, initialized } = useAppSelector((state) => state.auth);
  const running = useRef(false);
  const [testButton, setTestButton] = useState<{
    id: string;
    plan: BillingPlan;
  } | null>(null);
  const run = useCallback(async () => {
    const plan = pendingBillingPlan();
    if (
      !plan ||
      !token ||
      !user?.pinConfigured ||
      !initialized ||
      running.current
    )
      return;
    running.current = true;
    clearBillingIntent();
    const message = toast.loading("Preparing secure checkout…");
    try {
      const catalogue = await billingApi.plans();
      if (catalogue.testPaymentButtonId) {
        toast.dismiss(message);
        setTestButton({
          id: catalogue.testPaymentButtonId,
          plan: catalogue.plans[plan],
        });
        return;
      }
      const checkout = await billingApi.checkout(plan);
      if (checkout.alreadyPaid) {
        toast.success("Your Full plan is already active.", { id: message });
      } else {
        toast.dismiss(message);
        const response = await openRazorpay(checkout, user, () =>
          toast.error(
            "Payment failed. You can retry in Checkout or close it and try again later.",
          ),
        );
        if (!response) {
          toast.info(
            "Checkout closed. Your plan selection is saved; you can retry anytime.",
          );
          return;
        }
        toast.loading("Verifying your payment…", { id: message });
        let status = await billingApi.verify(response);
        for (
          let attempt = 0;
          status.accountTier !== "paid" && attempt < 4;
          attempt++
        ) {
          await new Promise((resolve) => window.setTimeout(resolve, 1500));
          status = await billingApi.status();
        }
        if (status.accountTier === "paid")
          toast.success("Your Full plan is active.", { id: message });
        else
          toast.info(
            "Your payment is still being confirmed. Check Billing in Settings; no second payment is needed.",
            { id: message },
          );
      }
      await dispatch(refreshUsage(true));
      window.dispatchEvent(new Event("readines-billing-updated"));
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Payment could not be completed. Please retry from Billing in Settings.",
        { id: message },
      );
    } finally {
      running.current = false;
    }
  }, [dispatch, initialized, token, user]);
  useEffect(() => {
    const listener = () => void run();
    window.addEventListener(billingIntentEvent, listener);
    void run();
    return () => window.removeEventListener(billingIntentEvent, listener);
  }, [run]);
  return testButton ? (
    <RazorpayTestPaymentButton
      buttonId={testButton.id}
      plan={testButton.plan}
      onClose={() => setTestButton(null)}
    />
  ) : null;
}
