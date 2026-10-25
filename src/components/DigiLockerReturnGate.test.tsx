// @vitest-environment jsdom
import { StrictMode } from "react";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, expect, it, vi } from "vitest";
import DigiLockerReturnGate, { digiLockerCallbackTarget } from "./DigiLockerReturnGate";
import { API_URL } from "@/lib/http-client";
afterEach(cleanup);
it("forwards web consent returns before auth restoration, only once under StrictMode", async () => {
  const redirect = vi.fn();
  render(<StrictMode><MemoryRouter initialEntries={["/documents?code=provider-code&state=provider-state&redirectUrl=https://untrusted.example&error_description=private"]}>
    <DigiLockerReturnGate redirect={redirect}><div>Authentication and navigation</div></DigiLockerReturnGate>
  </MemoryRouter></StrictMode>);
  await waitFor(() => expect(redirect).toHaveBeenCalledTimes(1));
  const target = new URL(redirect.mock.calls[0][0]);
  expect(target.origin).toBe(new URL(API_URL).origin);
  expect(target.pathname).toBe("/api/integrations/digilocker/callback");
  expect([...target.searchParams.keys()]).toEqual(["state", "code"]);
  expect(target.searchParams.get("code")).toBe("provider-code");
  expect(screen.queryByText("Authentication and navigation")).toBeNull();
});
it("returns provider denial to the same backend state validator", () => {
  const target = new URL(digiLockerCallbackTarget("/documents", "?state=state&error=access_denied")!);
  expect(target.searchParams.get("error")).toBe("access_denied");
});
it.each([['/documents',''],['/documents','?search=passport'],['/documents','?code=unbound'],['/home','?code=code&state=state'],['/documents','#digilocker=finished']])("preserves normal navigation for %s %s", (path, query) => {
  expect(digiLockerCallbackTarget(path, query)).toBeNull();
});
it("leaves the completed callback fragment and normal auth flow untouched", () => {
  const redirect = vi.fn();
  render(<MemoryRouter initialEntries={["/documents#digilocker=session-a&result=AUTHENTICATED"]}>
    <DigiLockerReturnGate redirect={redirect}><div>Normal Documents navigation</div></DigiLockerReturnGate>
  </MemoryRouter>);
  expect(screen.getByText("Normal Documents navigation")).toBeTruthy();
  expect(redirect).not.toHaveBeenCalled();
});
