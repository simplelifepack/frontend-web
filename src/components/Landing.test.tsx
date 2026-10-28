import {
  cleanup,
  fireEvent,
  waitFor,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import Landing from "./Landing";

beforeAll(() => {
  vi.stubGlobal("IntersectionObserver", class {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() { return []; }
  });
});

vi.mock("@/lib/billing-api", () => ({
  billingApi: { plans: () => Promise.resolve({ available: true, plans: { annual: { amountPaise: 199900 }, monthly: { amountPaise: 24900 } }, annualMonthlyEquivalent: 167, annualSavingsPaise: 98900 }) },
  billingPrice: (paise: number) => (paise / 100).toLocaleString("en-IN"),
  selectedBillingPlan: () => "annual",
  selectBillingPlan: vi.fn(), requestBillingCheckout: vi.fn(), clearBillingIntent: vi.fn(),
}));
vi.mock("@/store/hooks", () => ({ useAppDispatch: () => vi.fn() }));
vi.mock("./GoogleSignInButton", () => ({
  default: () => <button>Google sign in</button>,
}));
const requestSignupOtp = vi.fn().mockResolvedValue({ message: "Code sent" });
const forgotPasswordOtp = vi.fn().mockResolvedValue({ message: "Code sent" });
const resetPasswordOtp = vi
  .fn()
  .mockResolvedValue({ message: "Password updated" });
vi.mock("@/lib/api", () => ({
  api: {
    auth: {
      forgotPasswordOtp: (...args: unknown[]) => forgotPasswordOtp(...args),
      resetPasswordOtp: (...args: unknown[]) => resetPasswordOtp(...args),
      requestSignupOtp: (...args: unknown[]) => requestSignupOtp(...args),
    },
  },
}));
afterEach(() => {
  cleanup();
  sessionStorage.clear();
  vi.clearAllMocks();
});

describe("public landing audit flows", () => {
  it("introduces the workflow and privacy before the four core modules", () => {
    render(<Landing onAuthed={vi.fn()} />);
    const sections = [...document.querySelectorAll("main section[id]")].map(
      (section) => section.id,
    );
    expect(sections).toEqual(["how", "privacy", "features", "pricing"]);
    const features = document.getElementById("features")!;
    for (const name of ["Packages", "Documents", "Health", "Wealth"])
      expect(within(features).getByText(name, {})).toBeTruthy();
    expect(within(features).queryByText("Search", {})).toBeNull();
    expect(
      screen.getByLabelText("Travel paperwork").getAttribute("value"),
    ).toBe("100");
    expect(screen.queryByText(/end-to-end encrypted/i)).toBeNull();
    expect(
      within(screen.getByRole("navigation")).queryByRole("button", {
        name: "Get started",
      }),
    ).toBeNull();
  });

  it("uses server pricing for annual and monthly billing without the retired offer", async () => {
    render(<Landing onAuthed={vi.fn()} />);
    await waitFor(() => expect(screen.getByRole("heading", { name: "₹1,999" })).toBeTruthy());
    expect(screen.queryByRole("button", { name: /Early member offer/ })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Monthly" }));
    expect(screen.getByRole("heading", { name: "₹249" })).toBeTruthy();
    expect(screen.getByText(/annual saves ₹989/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Annual" }));
    expect(screen.getByRole("heading", { name: "₹1,999" })).toBeTruthy();
  });

  it("retains sign-in validation and restores focus on dismissal", () => {
    render(<Landing onAuthed={vi.fn()} />);
    const trigger = screen.getByRole("button", {
      name: "Sign in",
    });
    trigger.focus();
    fireEvent.click(trigger);
    const dialog = screen.getByRole("dialog", { name: "Account access" });
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Continue with email" }),
    );
    fireEvent.click(within(dialog).getByRole("button", { name: "Sign in" }));
    expect(
      within(dialog).getByText("Enter your email and password."),
    ).toBeTruthy();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it("opens signup from the Free CTA and requests the existing signup OTP contract", async () => {
    render(<Landing onAuthed={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Start free" }));
    expect(sessionStorage.getItem("lp-fresh")).toBe("1");
    const dialog = screen.getByRole("dialog", { name: "Account access" });
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Continue with email" }),
    );
    for (const [label, value] of [
      ["Your name", "Audit"],
      ["Email", "audit@example.invalid"],
      ["Password", "AuditPassword1!"],
      ["Repeat password", "AuditPassword1!"],
    ]) {
      fireEvent.change(within(dialog).getByLabelText(label, {}), {
        target: { value },
      });
    }
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Create my Readines" }),
    );
    expect(await within(dialog).findByLabelText("6-digit code")).toBeTruthy();
    expect(requestSignupOtp).toHaveBeenCalledWith({
      name: "Audit",
      email: "audit@example.invalid",
      password: "AuditPassword1!",
    });
  });
});

describe("authentication recovery and visibility", () => {
  it("keeps validation, OTP, password confirmation and the reset API contract", async () => {
    render(<Landing initialAuthMode="signin" onAuthed={vi.fn()} />);
    const dialog = screen.getByRole("dialog");
    const ui = within(dialog);
    fireEvent.click(ui.getByRole("button", { name: "Forgot password?" }));
    fireEvent.click(ui.getByRole("button", { name: "Send OTP" }));
    expect(ui.getByRole("alert").textContent).toBe("Enter your account email.");
    fireEvent.change(ui.getByLabelText("Email"), {
      target: { value: "audit@example.invalid" },
    });
    fireEvent.click(ui.getByRole("button", { name: "Send OTP" }));
    const code = await ui.findByLabelText("Reset code");
    expect(
      (ui.getByRole("button", { name: "Continue" }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
    fireEvent.change(code, { target: { value: "123456" } });
    fireEvent.click(ui.getByRole("button", { name: "Continue" }));
    const password = ui.getByLabelText("New password") as HTMLInputElement;
    fireEvent.change(password, { target: { value: "weak" } });
    fireEvent.click(ui.getByRole("button", { name: "Show new password" }));
    expect(password.type).toBe("text");
    fireEvent.click(ui.getByRole("button", { name: "Update password" }));
    expect(ui.getByRole("alert").textContent).toContain(
      "at least 8 characters",
    );
    fireEvent.change(password, { target: { value: "AuditPassword1!" } });
    fireEvent.change(ui.getByLabelText("Confirm new password"), {
      target: { value: "DifferentPassword1!" },
    });
    fireEvent.click(ui.getByRole("button", { name: "Update password" }));
    expect(ui.getByRole("alert").textContent).toBe("Passwords do not match.");
    fireEvent.change(ui.getByLabelText("Confirm new password"), {
      target: { value: "AuditPassword1!" },
    });
    fireEvent.click(ui.getByRole("button", { name: "Update password" }));
    await ui.findByLabelText("Password");
    expect(resetPasswordOtp).toHaveBeenCalledWith({
      email: "audit@example.invalid",
      otp: "123456",
      password: "AuditPassword1!",
    });
  });
});

vi.mock("@/lib/waitlist-api", () => ({
  waitlistApi: {
    challenge: () => Promise.resolve({ token: "signed-challenge", difficulty: 12 }),
    register: () => Promise.resolve({ message: "You’re registered for early access. Thank you!" }),
  },
  solveChallenge: () => Promise.resolve("123"),
}));
describe("authentication landing", () => {
  it("always offers sign-in and account creation instead of early-access registration", () => {
    render(<Landing onAuthed={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Sign in" })).toBeTruthy();
    expect(screen.getAllByRole("button", { name: "Get started" }).length).toBeGreaterThan(0);
    expect(screen.queryByRole("button", { name: "Register for Early Access" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Start free" }));
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(within(screen.getByRole("dialog")).getByText("Create your account")).toBeTruthy();
  });
});
