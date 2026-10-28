import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import EarlyAccessLanding from "./EarlyAccessLanding";
import { EarlyAccessHero } from "./EarlyAccessHero";
import { applyTheme } from "@/lib/theme";

const { challenge, register, solveChallenge } = vi.hoisted(() => ({
  challenge: vi.fn(),
  register: vi.fn(),
  solveChallenge: vi.fn(),
}));
vi.mock("@/lib/waitlist-api", () => ({
  waitlistApi: { challenge, register },
  solveChallenge,
}));
vi.mock("@/lib/api", () => ({ api: { auth: {} } }));
vi.mock("@/lib/billing-api", () => ({ clearBillingIntent: vi.fn() }));
vi.mock("@/store/hooks", () => ({ useAppDispatch: () => vi.fn() }));
vi.mock("./GoogleSignInButton", () => ({ default: () => null }));

beforeEach(() => {
  challenge.mockResolvedValue({ token: "signed-challenge", difficulty: 12 });
  solveChallenge.mockResolvedValue("123");
  register.mockResolvedValue({
    message: "You’re registered for early access. Thank you!",
  });
});
afterEach(() => {
  cleanup();
  vi.resetAllMocks();
  localStorage.clear();
  document.documentElement.classList.remove("dark");
});
function submit(email = "audit@example.invalid") {
  fireEvent.change(screen.getByLabelText("Email address"), {
    target: { value: email },
  });
  fireEvent.submit(screen.getByRole("form", { name: "Join early access" }));
}

describe("separate early-access landing", () => {
  it("omits Sign In and retains explicit authentication navigation", () => {
    const { rerender } = render(<EarlyAccessLanding onAuthed={vi.fn()} />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      "Your life,better prepared.",
    );
    expect(screen.queryByRole("heading", { name: "Features" })).toBeNull();
    expect(screen.queryByRole("heading", { name: "Pricing" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Sign in" })).toBeNull();
    rerender(
      <EarlyAccessLanding initialAuthMode="signin" onAuthed={vi.fn()} />,
    );
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
  });
  it("validates email without requesting proof or registering", () => {
    render(<EarlyAccessLanding onAuthed={vi.fn()} />);
    submit("invalid");
    expect(screen.getByRole("alert").textContent).toBe(
      "Enter a valid email address.",
    );
    expect(register).not.toHaveBeenCalled();
    expect(challenge).not.toHaveBeenCalled();
  });
  it("submits the existing proof and honeypot contract once and announces success", async () => {
    let complete!: (value: { message: string }) => void;
    register.mockReturnValue(
      new Promise((resolve) => {
        complete = resolve;
      }),
    );
    render(<EarlyAccessLanding onAuthed={vi.fn()} />);
    submit();
    submit();
    await waitFor(() => expect(register).toHaveBeenCalledTimes(1));
    expect(register).toHaveBeenCalledWith({
      email: "audit@example.invalid",
      website: "",
      challenge: "signed-challenge",
      solution: "123",
    });
    expect(
      (screen.getByRole("button", { name: "Joining…" }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
    complete({ message: "You’re registered for early access. Thank you!" });
    await waitFor(() =>
      expect(screen.getByRole("status").textContent).toContain(
        "You’re registered",
      ),
    );
    expect(
      (screen.getByLabelText("Email address") as HTMLInputElement).disabled,
    ).toBe(true);
  });
  it("announces the server duplicate-email response as a completed registration", async () => {
    register.mockResolvedValue({
      message:
        "You’re already registered for early access. Thanks for your interest!",
    });
    render(<EarlyAccessLanding onAuthed={vi.fn()} />);
    submit();
    await waitFor(() =>
      expect(screen.getByRole("status").textContent).toContain(
        "already registered",
      ),
    );
    expect(screen.queryByRole("alert")).toBeNull();
  });
  it("shows server errors and requests fresh proof on retry", async () => {
    register.mockRejectedValueOnce(new Error("Please try again later."));
    render(<EarlyAccessLanding onAuthed={vi.fn()} />);
    submit();
    expect((await screen.findByRole("alert")).textContent).toBe(
      "Please try again later.",
    );
    submit();
    await waitFor(() =>
      expect(screen.getByRole("status").textContent).toContain(
        "You’re registered",
      ),
    );
    expect(challenge).toHaveBeenCalledTimes(2);
  });
  it("recovers from challenge failures without calling registration", async () => {
    challenge.mockRejectedValueOnce(
      new Error("Could not prepare registration."),
    );
    render(<EarlyAccessLanding onAuthed={vi.fn()} />);
    submit();
    await screen.findByRole("alert");
    expect(register).not.toHaveBeenCalled();
    submit();
    await waitFor(() => expect(register).toHaveBeenCalledTimes(1));
  });
  it("aborts pending challenge work on unmount", () => {
    challenge.mockReturnValue(new Promise(() => {}));
    const { unmount } = render(<EarlyAccessHero />);
    submit();
    const signal = challenge.mock.calls[0][0] as AbortSignal;
    unmount();
    expect(signal.aborted).toBe(true);
  });
  it("uses the existing appearance subscription and persists both themes", () => {
    applyTheme("light");
    render(<EarlyAccessLanding onAuthed={vi.fn()} />);
    fireEvent.click(
      screen.getByRole("button", { name: "Switch to dark theme" }),
    );
    expect(localStorage.getItem("readiness-theme")).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    fireEvent.click(
      screen.getByRole("button", { name: "Switch to light theme" }),
    );
    expect(localStorage.getItem("readiness-theme")).toBe("light");
  });
});
