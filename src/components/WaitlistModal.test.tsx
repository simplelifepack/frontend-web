import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import WaitlistModal from "./WaitlistModal";
const { challenge, register, unsubscribe } = vi.hoisted(() => ({
  challenge: vi.fn().mockResolvedValue({ token: "signed", difficulty: 12 }),
  register: vi.fn().mockResolvedValue({ message: "Registered" }),
  unsubscribe: vi.fn().mockResolvedValue({ message: "Unsubscribed" }),
}));
vi.mock("@/lib/waitlist-api", () => ({ waitlistApi: { challenge, register, unsubscribe }, solveChallenge: () => Promise.resolve("123") }));
afterEach(() => { cleanup(); vi.clearAllMocks(); });
describe("waitlist modal", () => {
  it("handles failure, obtains fresh proof, and allows a successful retry", async () => {
    register.mockRejectedValueOnce(new Error("Registration expired. Please try again."));
    render(<WaitlistModal onClose={vi.fn()} />);
    fireEvent.change(screen.getByRole("textbox", { name: "Email address" }), { target: { value: "person@example.com" } });
    const submit = screen.getByRole("button", { name: "Register for Early Access" }) as HTMLButtonElement;
    await waitFor(() => expect(submit.disabled).toBe(false));
    fireEvent.click(submit);
    expect((await screen.findByRole("alert")).textContent).toContain("Registration expired");
    await waitFor(() => expect(challenge).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(submit.disabled).toBe(false));
    fireEvent.click(submit);
    expect((await screen.findByRole("status")).textContent).toBe("Registered");
    expect(register).toHaveBeenLastCalledWith({ email: "person@example.com", website: "", challenge: "signed", solution: "123" });
  });
  it("never unsubscribes on mount and confirms with an explicit action", async () => {
    render(<WaitlistModal unsubscribeToken="opaque-token" onClose={vi.fn()} />);
    expect(unsubscribe).not.toHaveBeenCalled();
    expect(challenge).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Unsubscribe" }));
    expect((await screen.findByRole("status")).textContent).toBe("Unsubscribed");
    expect(unsubscribe).toHaveBeenCalledWith("opaque-token");
  });
});
