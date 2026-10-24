import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import BillingCheckoutController from "./BillingCheckoutController";
import { requestBillingCheckout, pendingBillingPlan } from "@/lib/billing-api";
const mocks = vi.hoisted(() => ({
  auth: {
    token: "token" as string | null,
    user: { name: "Test", email: "test@example.invalid", pinConfigured: true },
    initialized: true,
  },
  plans: vi.fn(),
  checkout: vi.fn(),
  verify: vi.fn(),
  status: vi.fn(),
  open: vi.fn(),
  dispatch: vi.fn(),
  success: vi.fn(),
  info: vi.fn(),
  error: vi.fn(),
}));
vi.mock("@/store/hooks", () => ({
  useAppDispatch: () => mocks.dispatch,
  useAppSelector: (select: (state: unknown) => unknown) =>
    select({ auth: mocks.auth }),
}));
vi.mock("@/store/slices/usageSlice", () => ({
  refreshUsage: () => ({ type: "usage/refresh" }),
}));
vi.mock("sonner", () => ({
  toast: {
    loading: () => "loading",
    dismiss: vi.fn(),
    success: mocks.success,
    info: mocks.info,
    error: mocks.error,
  },
}));
vi.mock("@/lib/razorpay-checkout", () => ({ openRazorpay: mocks.open }));
vi.mock("@/lib/billing-api", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  billingApi: {
    plans: mocks.plans,
    checkout: mocks.checkout,
    verify: mocks.verify,
    status: mocks.status,
  },
}));
const paid = { accountTier: "paid", subscription: null };
beforeEach(() => {
  vi.clearAllMocks();
  sessionStorage.clear();
  mocks.auth.token = "token";
  mocks.auth.initialized = true;
  mocks.plans.mockResolvedValue({ available: true });
  mocks.checkout.mockResolvedValue({
    alreadyPaid: false,
    keyId: "rzp_test",
    subscriptionId: "sub_test",
    plan: { id: "annual", amountPaise: 199900 },
  });
  mocks.verify.mockResolvedValue(paid);
  mocks.status.mockResolvedValue(paid);
  mocks.open.mockResolvedValue({
    razorpay_payment_id: "pay_test",
    razorpay_subscription_id: "sub_test",
    razorpay_signature: "test-signature",
  });
});
afterEach(cleanup);
describe("billing checkout lifecycle", () => {
  it.each(["annual", "monthly"] as const)(
    "checks out selected %s period and verifies before reporting success",
    async (plan) => {
      requestBillingCheckout(plan);
      render(<BillingCheckoutController />);
      await waitFor(() =>
        expect(mocks.success).toHaveBeenCalledWith(
          "Your Full plan is active.",
          expect.anything(),
        ),
      );
      expect(mocks.checkout).toHaveBeenCalledWith(plan);
      expect(mocks.verify).toHaveBeenCalledOnce();
      expect(mocks.dispatch).toHaveBeenCalledOnce();
    },
  );
  it("preserves a pending selection across authentication and initialization", async () => {
    mocks.auth.token = null;
    requestBillingCheckout("monthly");
    const view = render(<BillingCheckoutController />);
    expect(mocks.checkout).not.toHaveBeenCalled();
    expect(pendingBillingPlan()).toBe("monthly");
    mocks.auth = { ...mocks.auth, token: "token", initialized: false };
    view.rerender(<BillingCheckoutController />);
    expect(mocks.checkout).not.toHaveBeenCalled();
    mocks.auth = { ...mocks.auth, initialized: true };
    view.rerender(<BillingCheckoutController />);
    await waitFor(() => expect(mocks.checkout).toHaveBeenCalledWith("monthly"));
  });
  it("dismissal grants no access and allows an explicit retry", async () => {
    mocks.open.mockResolvedValue(null);
    requestBillingCheckout("annual");
    render(<BillingCheckoutController />);
    await waitFor(() => expect(mocks.info).toHaveBeenCalled());
    expect(mocks.verify).not.toHaveBeenCalled();
    await act(async () => requestBillingCheckout("annual"));
    await waitFor(() => expect(mocks.checkout).toHaveBeenCalledTimes(2));
  });
  it("uses the supplied hosted test button without creating or activating a subscription", async () => {
    mocks.plans.mockResolvedValue({ testPaymentButtonId: "pl_TroJQy6559FmHg", plans: { annual: { id: "annual", name: "Full plan · Annual", amountPaise: 199900 } } });
    requestBillingCheckout("annual"); render(<BillingCheckoutController />);
    await waitFor(() => expect(screen.getByRole("dialog", { name: "Razorpay test payment" })).toBeTruthy());
    const script = document.querySelector('script[data-payment_button_id="pl_TroJQy6559FmHg"]');
    expect(script?.getAttribute("src")).toBe("https://checkout.razorpay.com/v1/payment-button.js");
    expect(mocks.checkout).not.toHaveBeenCalled(); expect(mocks.verify).not.toHaveBeenCalled(); expect(mocks.dispatch).not.toHaveBeenCalled();
  });
  it("existing paid users never open Checkout", async () => {
    mocks.checkout.mockResolvedValue({ alreadyPaid: true });
    requestBillingCheckout("annual");
    render(<BillingCheckoutController />);
    await waitFor(() => expect(mocks.success).toHaveBeenCalled());
    expect(mocks.open).not.toHaveBeenCalled();
  });
  it("server failures leave a retryable CTA and never report paid success", async () => {
    mocks.checkout.mockRejectedValue(new Error("Payments not configured"));
    requestBillingCheckout("monthly");
    render(<BillingCheckoutController />);
    await waitFor(() =>
      expect(mocks.error).toHaveBeenCalledWith(
        "Payments not configured",
        expect.anything(),
      ),
    );
    expect(mocks.success).not.toHaveBeenCalled();
    expect(mocks.open).not.toHaveBeenCalled();
  });
  it("verification failure never trusts the frontend success callback", async () => {
    mocks.verify.mockRejectedValue(new Error("Invalid payment signature"));
    requestBillingCheckout("annual");
    render(<BillingCheckoutController />);
    await waitFor(() => expect(mocks.error).toHaveBeenCalled());
    expect(mocks.success).not.toHaveBeenCalled();
    expect(mocks.dispatch).not.toHaveBeenCalled();
  });
});
