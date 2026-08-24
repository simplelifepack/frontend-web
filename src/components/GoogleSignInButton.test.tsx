import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import GoogleSignInButton from "./GoogleSignInButton";

vi.mock("@react-oauth/google", () => ({
  GoogleLogin: ({
    onSuccess,
    onError,
  }: {
    onSuccess: (value: { credential?: string }) => void;
    onError: () => void;
  }) => (
    <div>
      <button
        type="button"
        onClick={() => onSuccess({ credential: "mock-credential" })}
      >
        Google success
      </button>
      <button type="button" onClick={onError}>
        Google failure
      </button>
    </div>
  ),
}));

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
});

describe("GoogleSignInButton", () => {
  it("passes the returned credential to the auth flow", () => {
    vi.stubEnv("VITE_GOOGLE_CLIENT_ID", "test-client-id");
    const onCredential = vi.fn();
    render(
      <GoogleSignInButton
        disabled={false}
        onCredential={onCredential}
        onError={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Google success" }));
    expect(onCredential).toHaveBeenCalledWith("mock-credential");
  });

  it("returns a friendly message when Google fails", () => {
    vi.stubEnv("VITE_GOOGLE_CLIENT_ID", "test-client-id");
    const onError = vi.fn();
    render(
      <GoogleSignInButton
        disabled={false}
        onCredential={vi.fn()}
        onError={onError}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Google failure" }));
    expect(onError).toHaveBeenCalledWith(
      "Google sign-in was cancelled or could not be completed.",
    );
  });

  it("shows guidance when Google's script cannot load", async () => {
    vi.stubEnv("VITE_GOOGLE_CLIENT_ID", "test-client-id");
    const onError = vi.fn();
    render(
      <GoogleSignInButton
        disabled={false}
        onCredential={vi.fn()}
        onError={onError}
      />,
    );
    window.dispatchEvent(
      new CustomEvent("ReadiNes:google-script-error", { detail: true }),
    );
    await expect(
      screen.findByText(/Google sign-in could not load/),
    ).resolves.toBeInTheDocument();
    expect(onError).toHaveBeenCalledWith(
      "Google sign-in could not load. Open ReadiNes at http://localhost:5173 and disable any blocker for accounts.google.com.",
    );
  });

  it("shows and locks the loading state", () => {
    vi.stubEnv("VITE_GOOGLE_CLIENT_ID", "test-client-id");
    render(
      <GoogleSignInButton disabled onCredential={vi.fn()} onError={vi.fn()} />,
    );
    expect(screen.getByText("Signing in securely…")).toBeInTheDocument();
    expect(
      screen.getByText("Signing in securely…").parentElement,
    ).toHaveAttribute("aria-busy", "true");
  });
});
