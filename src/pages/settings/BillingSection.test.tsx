import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import type { BillingStatus } from "@/lib/billing-api";
import BillingSection from "./BillingSection";
const { status, plans, dispatch } = vi.hoisted(() => ({ status: vi.fn(), plans: vi.fn(), dispatch: vi.fn() }));
vi.mock("@/lib/billing-api", () => ({ billingApi: { status, plans }, billingPrice: vi.fn(), requestBillingCheckout: vi.fn(), selectedBillingPlan: () => "annual", selectBillingPlan: vi.fn() }));
vi.mock("@/store/hooks", () => ({ useAppDispatch: () => dispatch }));
vi.mock("@/store/slices/usageSlice", () => ({ refreshUsage: vi.fn() }));
afterEach(() => { cleanup(); vi.clearAllMocks(); });
function deferred<T>() { let resolve!: (value: T) => void; const promise = new Promise<T>(done => { resolve = done; }); return { promise, resolve }; }
it("aborts superseded billing reads and ignores their late results", async () => {
  const old = deferred<BillingStatus>(); const latest = deferred<BillingStatus>();
  status.mockReturnValueOnce(old.promise).mockReturnValueOnce(latest.promise); plans.mockResolvedValue(null);
  render(<BillingSection />);
  const oldSignal = status.mock.calls[0][0] as AbortSignal;
  await act(async () => { window.dispatchEvent(new Event("readines-billing-updated")); });
  expect(oldSignal.aborted).toBe(true);
  await act(async () => { latest.resolve({ accountTier: "paid", subscription: null }); });
  expect(screen.getByText("Full plan")).toBeTruthy();
  await act(async () => { old.resolve({ accountTier: "free", subscription: null }); });
  expect(screen.getByText("Full plan")).toBeTruthy(); expect(dispatch).toHaveBeenCalledTimes(1);
});
it("aborts billing reads on unmount", () => {
  status.mockReturnValue(new Promise(() => {})); plans.mockReturnValue(new Promise(() => {}));
  const view = render(<BillingSection />); const signal = status.mock.calls[0][0] as AbortSignal;
  view.unmount(); expect(signal.aborted).toBe(true);
});
