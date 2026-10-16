import { Text, Button } from "@/design-system";

import type { ReactNode } from "react";
import { lazy, Suspense, useEffect, useState } from "react";
import { ChevronsLeft, ChevronsRight, FileText, Settings } from "lucide-react";
import { NavLink, Outlet, useLocation } from "react-router-dom";

import { T } from "@/constants/theme";
import { useAppSelector } from "@/store/hooks";
import AccountMenu from "./AccountMenu";
import { BrandWordmark } from "./BrandLogo";
import GlobalSearch from "./GlobalSearch";
import { ADMIN_NAV, ROUTE_PATHS, SHELL_NAV, routeFromPath } from "./appShellNav";

const UploadDocumentModal = lazy(() => import("@/components/UploadDocumentModal"));

type AppShellProps = {
  children?: ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  const location = useLocation();
  const user = useAppSelector((state) => state.auth.user);
  const currentRoute = routeFromPath(location.pathname);
  const isPackagesAdmin = user?.email?.toLowerCase() === "admin@readines.com";
  const [uploadOpen, setUploadOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(() =>
    typeof window === "undefined" ? true : window.innerWidth > 760,
  );

  useEffect(() => {
    const openUpload = (event: Event) => {
      void event;
      setUploadOpen(true);
    };
    window.addEventListener("readiness:open-upload", openUpload);
    return () => window.removeEventListener("readiness:open-upload", openUpload);
  }, []);

  return (
    <div
      style={{ display: "flex", height: "100dvh", minHeight: 0, overflow: "hidden", background: T.navy, color: T.text }}
    >
      <aside
        className="lp-sidebar"
        style={{
          width: navOpen ? 232 : 68,
          height: "100dvh",
          overflowY: "auto",
          overscrollBehavior: "contain",
          borderRight: `1px solid ${T.border}`,
          padding: navOpen ? 16 : "16px 10px",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          transition: "width .18s ease, padding .18s ease",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 11,
            padding: navOpen ? "6px 8px 18px" : "6px 0 18px",
            justifyContent: navOpen ? "flex-start" : "center",
          }}
        >
          <div   className="lp-shell-brand">
            <span><FileText aria-hidden="true" focusable="false" size={21} strokeWidth={2.3} /></span>
            {navOpen && (
              <div>
                <BrandWordmark size={16} color="var(--lp-heading)" gold="var(--lp-readiness)" />
                <Text as="small" size="sm">READY FOR LIFE</Text>
              </div>
            )}
          </div>
        </div>

        <nav aria-label="Sidebar" style={{ display: "grid", gap: 3 }}>
          {SHELL_NAV.map((n) => {
            const Icon = n.icon;
            const active = currentRoute === n.key;
            const navStyle = { width: "100%", display: "flex", alignItems: "center", justifyContent: navOpen ? "flex-start" : "center", gap: navOpen ? 12 : 0, background: active ? T.raised : "transparent", color: active ? T.white : T.muted, border: `1px solid ${active ? T.border : "transparent"}`, borderRadius: "var(--radius-s10)", padding: navOpen ? "10px 12px" : "10px 0", cursor: "pointer", textAlign: "left" as const, textDecoration: "none", whiteSpace: "nowrap" as const };
            return (
              <Text as={NavLink} size="md"
                key={n.key}
                to={ROUTE_PATHS[n.key]}
                aria-label={n.label}
                title={n.label}
                style={navStyle}
              >
                <Icon aria-hidden="true" focusable="false" size="var(--icon-regular)" color={active ? T.action : T.muted} style={{ flexShrink: 0 }} />
                {navOpen ? n.label : ""}
              </Text>
            );
          })}
          {isPackagesAdmin && ADMIN_NAV.map((n) => {
            const Icon = n.icon;
            const active = location.pathname === n.path;
            return (
              <Text as={NavLink} size="md" weight="semibold" tone="muted"
                key={n.key}
                to={n.path}
                aria-label={n.label}
                title={n.label}
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: navOpen ? "flex-start" : "center", gap: navOpen ? 12 : 0, background: active ? T.raised : "transparent", color: active ? T.white : T.muted, border: `1px solid ${active ? T.border : "transparent"}`, borderRadius: "var(--radius-s10)", padding: navOpen ? "10px 12px" : "10px 0", cursor: "pointer", textAlign: "left" as const, textDecoration: "none", whiteSpace: "nowrap" as const }}
              >
                <Icon aria-hidden="true" focusable="false" size="var(--icon-regular)" color={active ? T.action : T.muted} style={{ flexShrink: 0 }} />
                {navOpen ? n.label : ""}
              </Text>
            );
          })}
          <Text as={NavLink} size="md" weight="semibold" to="/settings" aria-label="Settings" title="Settings" className="lp-shell-settings"><Settings aria-hidden="true" focusable="false" size="var(--icon-regular)" />{navOpen && "Settings"}</Text>
        </nav>

        <Button variant="tertiary" size="sm" iconOnly
          type="button"
          onClick={() => setNavOpen((value) => !value)}
          aria-label={navOpen ? "Collapse menu" : "Expand menu"}
          title={navOpen ? "Collapse menu" : "Expand menu"}
          style={{ marginTop: "auto" }}
        >
          {navOpen ? <ChevronsLeft aria-hidden="true" focusable="false" size="var(--icon-small)" /> : <ChevronsRight aria-hidden="true" focusable="false" size="var(--icon-small)" />}
        </Button>
      </aside>
      <main
        className="lp-main"
        style={{
          flex: 1,
          minWidth: 0,
          height: "100dvh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          overscrollBehavior: "contain",
        }}
      >
        <div className="lp-shell-inner lp-shell-header">
          <div className="lp-topbar">
            <GlobalSearch />
            <AccountMenu user={user} />
          </div>
        </div>
        <div className="lp-page-scroll">
          <Text as="div" size="md" className="lp-shell-inner">
            {children ?? <Outlet />}
          </Text>
        </div>
        {uploadOpen ? (
          <Suspense fallback={null}>
            <UploadDocumentModal
              open={uploadOpen}
              onClose={() => setUploadOpen(false)}
            />
          </Suspense>
        ) : null}
      </main>
      <nav className="lp-tabbar" aria-label="Primary">
        {SHELL_NAV.slice(0, 5).map((n) => {
          const Icon = n.icon;
          const active = currentRoute === n.key;
          return (
            <Text as={NavLink} size="sm" weight="semibold"
              key={n.key}
              to={ROUTE_PATHS[n.key]}
              className="lp-tab"
              style={{ color: active ? "var(--lpv-baractive)" : "var(--lpv-bartext)", background: active ? "var(--lpv-barpill)" : "none" }}
            >
              <Icon aria-hidden="true" focusable="false" size="var(--icon-medium)" color={active ? "var(--lpv-baractive)" : "var(--lpv-bartext)"} />
              {n.label}
            </Text>
          );
        })}
      </nav>
    </div>
  );
}
