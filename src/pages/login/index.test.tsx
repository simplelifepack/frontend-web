import { configureStore } from "@reduxjs/toolkit";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, expect, it, vi } from "vitest";
import { api, type AuthResponse } from "@/lib/api";
import authReducer from "@/store/slices/authSlice";
import LoginPage from "./index";

vi.mock("@/lib/api", () => ({
  api: { auth: { login: vi.fn(), loginWithPin: vi.fn() } },
}));
vi.mock("@/components/GoogleSignInButton", () => ({ default: () => null }));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

it.each(["password", "pin"] as const)(
  "dispatches and unwraps the %s sign-in before returning to the requested route",
  async (mode) => {
    const result: AuthResponse = {
      token: "test-access",
      user: { name: "Test", email: "member@example.com" },
    };
    vi.mocked(api.auth.login).mockResolvedValue(result);
    vi.mocked(api.auth.loginWithPin).mockResolvedValue(result);
    const app = configureStore({ reducer: { auth: authReducer } });
    render(
      <Provider store={app}>
        <MemoryRouter
          initialEntries={[
            { pathname: "/login", state: { from: { pathname: "/documents" } } },
          ]}
        >
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/documents" element={<div>Requested archive</div>} />
            <Route path="/" element={<div>Default destination</div>} />
          </Routes>
        </MemoryRouter>
      </Provider>,
    );
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "member@example.com" },
    });
    if (mode === "pin") {
      fireEvent.click(
        screen.getByRole("button", { name: "Sign in with R-pin" }),
      );
      fireEvent.change(screen.getByLabelText("R-pin"), {
        target: { value: "123456" },
      });
      fireEvent.click(
        within(screen.getByLabelText("R-pin").closest("form")!).getByRole(
          "button",
          { name: "Sign in with R-pin" },
        ),
      );
      expect(api.auth.loginWithPin).toHaveBeenCalledExactlyOnceWith({
        email: "member@example.com",
        pin: "123456",
      });
      expect(api.auth.login).not.toHaveBeenCalled();
    } else {
      fireEvent.change(screen.getByLabelText("Password"), {
        target: { value: "test-password" },
      });
      fireEvent.click(screen.getByRole("button", { name: "Login" }));
      expect(api.auth.login).toHaveBeenCalledExactlyOnceWith({
        email: "member@example.com",
        password: "test-password",
      });
      expect(api.auth.loginWithPin).not.toHaveBeenCalled();
    }
    await waitFor(() =>
      expect(screen.getByText("Requested archive")).toBeTruthy(),
    );
    expect(app.getState().auth.token).toBe(result.token);
  },
);
