import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Button,
  Content,
  Stack,
  Text,
  Choice,
  ChoiceGroup,
} from "@/design-system";
import {
  billingApi,
  billingPrice,
  requestBillingCheckout,
  selectedBillingPlan,
  selectBillingPlan,
  type BillingCatalogue,
  type BillingStatus,
  type BillingPlanId,
} from "@/lib/billing-api";
import { Section } from "./settings-ui";
import { useAppDispatch } from "@/store/hooks";
import { refreshUsage } from "@/store/slices/usageSlice";

export default function BillingSection() {
  const dispatch = useAppDispatch();
  const [status, setStatus] = useState<BillingStatus | null>(null);
  const [catalogue, setCatalogue] = useState<BillingCatalogue | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [plan, setPlan] = useState<BillingPlanId>(selectedBillingPlan);
  const refresh = async () => {
    setBusy(true);
    setError("");
    try {
      const [current, prices] = await Promise.all([
        billingApi.status(),
        billingApi.plans(),
      ]);
      setStatus(current);
      setCatalogue(prices);
      await dispatch(refreshUsage(true));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load billing.");
    } finally {
      setBusy(false);
    }
  };
  useEffect(() => {
    void refresh();
    const updated = () => void refresh();
    window.addEventListener("readines-billing-updated", updated);
    return () =>
      window.removeEventListener("readines-billing-updated", updated);
    // refresh intentionally reads no props or changing state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const subscription = status?.subscription;
  const cancellable =
    subscription &&
    !["cancelled", "expired", "completed", "creation_failed"].includes(
      subscription.status,
    ) &&
    !subscription.cancelAtCycleEnd;
  const cancel = async () => {
    if (
      !window.confirm(
        "Cancel this subscription? Paid access continues until the end of the verified paid period. Future automatic renewals will stop.",
      )
    )
      return;
    setBusy(true);
    try {
      await billingApi.cancel();
      toast.success("Subscription cancellation confirmed.");
      await refresh();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Unable to cancel. Please retry.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <Section label="Billing">
      <Content>
        <Stack $gap="s12">
          <Text weight="semibold">
            {status?.accountTier === "paid" ? "Full plan" : "Free account"}
          </Text>
          {subscription && (
            <>
              <Text size="sm">
                {subscription.plan === "annual" ? "Annual" : "Monthly"} ·{" "}
                {subscription.status}
              </Text>
              {subscription.paidThrough && (
                <Text size="sm">
                  Paid access until{" "}
                  {new Date(subscription.paidThrough).toLocaleDateString()}
                </Text>
              )}
              <Text size="sm" tone="muted">
                {subscription.cancelAtCycleEnd ||
                ["cancelled", "expired", "completed"].includes(
                  subscription.status,
                )
                  ? "Automatic renewal is off."
                  : "Renews automatically unless cancelled."}
              </Text>
            </>
          )}
          {status?.legacyPaid && (
            <Text size="sm">
              Your existing paid access is active. No new subscription is
              needed.
            </Text>
          )}
          {status && status.accountTier !== "paid" && catalogue && (
            <>
              <ChoiceGroup aria-label="Subscription billing period">
                {(["annual", "monthly"] as const).map((id) => (
                  <Choice
                    key={id}
                    aria-pressed={plan === id}
                    onClick={() => {
                      setPlan(id);
                      selectBillingPlan(id);
                    }}
                  >
                    {id === "annual" ? "Annual" : "Monthly"} · ₹
                    {billingPrice(catalogue.plans[id].amountPaise)}
                  </Choice>
                ))}
              </ChoiceGroup>
              <Text size="sm" tone="muted">
                {plan === "annual" ? "Billed annually" : "Billed monthly"} ·
                {catalogue.testPaymentButtonId ? "Test payment only; no subscription activation" : "Renews automatically · Cancel anytime"}
              </Text>
              <Button
                disabled={busy || !catalogue.available}
                onClick={() => requestBillingCheckout(plan)}
              >
                Get started
              </Button>
              {!catalogue.available && (
                <Text size="sm">Payments are not available yet.</Text>
              )}
            </>
          )}
          {error && (
            <Text role="alert" tone="danger">
              {error}
            </Text>
          )}
          {cancellable && (
            <Button
              variant="secondary"
              disabled={busy}
              onClick={() => void cancel()}
            >
              Cancel renewal
            </Button>
          )}
          <Button
            variant="secondary"
            disabled={busy}
            onClick={() => void refresh()}
          >
            {busy ? "Loading…" : "Refresh billing status"}
          </Button>
        </Stack>
      </Content>
    </Section>
  );
}
