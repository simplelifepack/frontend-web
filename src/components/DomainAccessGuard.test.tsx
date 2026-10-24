import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, useLocation } from "react-router-dom";
import DomainAccessGuard from "./DomainAccessGuard";
import { hasFullApplicationAccess } from "@/lib/domain-access";
afterEach(cleanup);
function Location() { const location = useLocation(); return <span>{location.pathname}</span>; }
describe("hostname routing boundary", () => {
  for (const host of ["readines.com", "www.readines.com", "unknown.example", "malicious.vercel.app"]) {
    for (const path of ["/", "/login", "/dashboard", "/packages", "/documents/a", "/checkout", "/forgot-password"]) {
      it(`${host}${path} mounts only the public landing at /`, () => {
        const mount = vi.fn();
        function PrivateApp() { mount(); return <div>Private application</div>; }
        render(<MemoryRouter initialEntries={[path]}><DomainAccessGuard hostname={host} landing={<div>Public landing</div>}><PrivateApp /></DomainAccessGuard><Location /></MemoryRouter>);
        expect(screen.getByText("Public landing")).toBeTruthy();
        expect(screen.getByText("/")).toBeTruthy();
        expect(mount).not.toHaveBeenCalled();
      });
    }
  }
  for (const host of ["localhost", "127.0.0.1", "frontend-web-nine-amber.vercel.app"]) {
    for (const path of ["/login", "/dashboard", "/packages", "/documents", "/checkout"]) {
      it(`${host}${path} preserves the application and URL`, () => {
        render(<MemoryRouter initialEntries={[path]}><DomainAccessGuard hostname={host} landing={<div>Public landing</div>}><div>Private application</div></DomainAccessGuard><Location /></MemoryRouter>);
        expect(screen.getByText("Private application")).toBeTruthy();
        expect(screen.getByText(path)).toBeTruthy();
      });
    }
  }
  it("accepts exact configured preview hosts without allowing suffix lookalikes or production overrides", () => {
    const configured = "staging.example.com,project-abc-team.vercel.app,readines.com";
    expect(hasFullApplicationAccess("project-abc-team.vercel.app", configured)).toBe(true);
    expect(hasFullApplicationAccess("staging.example.com", configured)).toBe(true);
    expect(hasFullApplicationAccess("staging.example.com.evil.com", configured)).toBe(false);
    expect(hasFullApplicationAccess("readines.com", configured)).toBe(false);
  });
});
