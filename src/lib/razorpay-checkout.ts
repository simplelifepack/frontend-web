import type { CheckoutResponse, CheckoutVerification } from "./billing-api";

type Options = {
  key: string;
  subscription_id: string;
  name: string;
  description: string;
  image: string;
  prefill: { name: string; email: string };
  handler: (response: CheckoutVerification) => void;
  modal: { ondismiss: () => void };
};
type Razorpay = {
  open: () => void;
  on: (event: "payment.failed", handler: () => void) => void;
};
declare global {
  interface Window {
    Razorpay?: new (options: Options) => Razorpay;
  }
}
let scriptLoading: Promise<void> | null = null;
export function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve();
  scriptLoading ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    const timeout = window.setTimeout(() => fail(), 15000);
    const fail = () => {
      window.clearTimeout(timeout);
      script.remove();
      scriptLoading = null;
      reject(
        new Error(
          "Checkout could not load. Please check your connection and retry.",
        ),
      );
    };
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onerror = fail;
    script.onload = () => {
      window.clearTimeout(timeout);
      if (window.Razorpay) resolve();
      else fail();
    };
    document.head.appendChild(script);
  });
  return scriptLoading;
}
export async function openRazorpay(
  checkout: Extract<CheckoutResponse, { alreadyPaid: false }>,
  user: { name: string; email: string },
  onFailure: () => void,
) {
  await loadRazorpay();
  return new Promise<CheckoutVerification | null>((resolve, reject) => {
    try {
      const instance = new window.Razorpay!({
        key: checkout.keyId,
        subscription_id: checkout.subscriptionId,
        name: "Readines",
        description: `${checkout.plan.name} · ₹${(checkout.plan.amountPaise / 100).toLocaleString("en-IN")}/${checkout.plan.id === "annual" ? "year" : "month"}`,
        image: `${window.location.origin}/icons/favicon.svg`,
        prefill: { name: user.name, email: user.email },
        handler: resolve,
        modal: { ondismiss: () => resolve(null) },
      });
      instance.on("payment.failed", onFailure);
      instance.open();
    } catch {
      reject(new Error("Checkout could not open. Please retry."));
    }
  });
}
