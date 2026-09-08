import BrandLogo from "./BrandLogo";
import type { ReactNode } from "react";
import { lazy, Suspense, useEffect, useState } from "react";
import {
  ChevronsLeft,
  ChevronsRight,
  Search,
  X,
} from "lucide-react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

import { T } from "@/constants/theme";
import { api } from "@/lib/api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";
import RecoveryGate from "./RecoveryGate";
import { ROUTE_PATHS, SHELL_NAV, routeFromPath } from "./appShellNav";

const UploadDocumentModal = lazy(() => import("@/components/UploadDocumentModal"));

type AppShellProps = {
  children?: ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAppSelector((state) => state.auth.user);
  const currentRoute = routeFromPath(location.pathname);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [stayAfterUpload, setStayAfterUpload] = useState(false);
  const [query, setQuery] = useState("");
  const [navOpen, setNavOpen] = useState(() =>
    typeof window === "undefined" ? true : window.innerWidth > 760,
  );

  useEffect(() => {
    const openUpload = (event: Event) => {
      const detail = (event as CustomEvent<{ stayOnSave?: boolean }>).detail;
      setStayAfterUpload(Boolean(detail?.stayOnSave));
      setUploadOpen(true);
    };
    window.addEventListener("readiness:open-upload", openUpload);
    return () => window.removeEventListener("readiness:open-upload", openUpload);
  }, []);

  const handleLogout = async () => {
    await api.auth.logout().catch(() => undefined);
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100dvh",
        minHeight: 0,
        overflow: "hidden",
        background: T.navy,
        fontFamily: "Inter, system-ui, sans-serif",
        color: T.text,
      }}
    >
      <aside
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
          <BrandLogo height={navOpen ? 48 : 32} />
        </div>

        <nav style={{ display: "grid", gap: 3 }}>
          {SHELL_NAV.map((n) => {
            const Icon = n.icon;
            const active = currentRoute === n.key;
            const navStyle = {
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: navOpen ? "flex-start" : "center",
              gap: navOpen ? 12 : 0,
              background: active ? T.raised : "transparent",
              color: active ? T.white : T.muted,
              border: `1px solid ${active ? T.border : "transparent"}`,
              borderRadius: 10,
              padding: navOpen ? "10px 12px" : "10px 0",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              textAlign: "left" as const,
              textDecoration: "none",
              whiteSpace: "nowrap" as const,
            };
            return (
              <NavLink
                key={n.key}
                to={ROUTE_PATHS[n.key]}
                title={n.label}
                style={navStyle}
              >
                <Icon size={18} color={active ? T.gold : T.muted} style={{ flexShrink: 0 }} />
                {navOpen ? n.label : ""}
              </NavLink>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={() => setNavOpen((value) => !value)}
          title={navOpen ? "Collapse menu" : "Expand menu"}
          style={{
            marginTop: "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "9px 0",
            borderRadius: 10,
            border: `1px solid ${T.border}`,
            background: T.panel,
            color: T.muted,
            cursor: "pointer",
            fontSize: 12.5,
            fontWeight: 600,
          }}
        >
          {navOpen ? <><ChevronsLeft size={16} /> Collapse</> : <ChevronsRight size={16} />}
        </button>
      </aside>
      <main
        className="lp-main"
        style={{
          flex: 1,
          minWidth: 0,
          height: "100dvh",
          overflowY: "auto",
          overflowX: "hidden",
          overscrollBehavior: "contain",
        }}
      >
        <div style={{ maxWidth: 1160, margin: "0 auto", width: "100%" }}>
          <div className="lp-topbar">
            <label className="lp-global-search">
              <Search size={15} color={T.muted} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && query.trim()) {
                    navigate(`/documents?search=${encodeURIComponent(query.trim())}`);
                    setQuery("");
                  }
                }}
                placeholder="Search…"
                aria-label="Search Readiness"
              />
              {query ? (
                <button type="button" onClick={() => setQuery("")} aria-label="Clear search">
                  <X size={15} />
                </button>
              ) : null}
            </label>
            <div className="lp-user-menu">
              <span>{user?.name}</span>
              <button type="button" onClick={() => navigate("/settings")}>Settings & usage</button>
              <button type="button" onClick={handleLogout}>Logout</button>
            </div>
          </div>
          <RecoveryGate key={user?.id}>{children ?? <Outlet />}</RecoveryGate>
        </div>
        {uploadOpen ? (
          <Suspense fallback={null}>
            <UploadDocumentModal
              open={uploadOpen}
              stayOnSave={stayAfterUpload}
              onClose={() => setUploadOpen(false)}
            />
          </Suspense>
        ) : null}
        
      </main>
    </div>
  );
}
