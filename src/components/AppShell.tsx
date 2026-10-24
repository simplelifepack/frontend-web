import {
  Button,
  spacing,
  breakpoints,
  AppFrame,
  AppSidebar,
  AppBrand,
  AppNavigation,
  AppNavigationLink,
  AppMain,
  AppHeader,
  AppHeaderContent,
  AppScroll,
  AppContent,
  AppTabbar,
  AppTab,
} from "@/design-system";

import type { ReactNode } from "react";
import { lazy, Suspense, useEffect, useState } from "react";
import { ChevronsLeft, ChevronsRight, Settings } from "lucide-react";
import { NavLink, Outlet, useLocation } from "react-router-dom";

import { useAppSelector } from "@/store/hooks";
import AccountMenu from "./AccountMenu";
import BrandLogo, { BrandMark } from "./BrandLogo";
import GlobalSearch from "./GlobalSearch";
import {
  ADMIN_NAV,
  ROUTE_PATHS,
  SHELL_NAV,
  routeFromPath,
} from "./appShellNav";

const UploadDocumentModal = lazy(
  () => import("@/components/UploadDocumentModal"),
);

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
    typeof window === "undefined"
      ? true
      : window.innerWidth > breakpoints.navigation,
  );

  useEffect(() => {
    const openUpload = (event: Event) => {
      void event;
      setUploadOpen(true);
    };
    window.addEventListener("readiness:open-upload", openUpload);
    return () =>
      window.removeEventListener("readiness:open-upload", openUpload);
  }, []);

  return (
    <AppFrame>
      <AppSidebar $expanded={navOpen}>
        <AppBrand>
          {navOpen ? (
            <BrandLogo height={Number.parseInt(spacing.s40)} />
          ) : (
            <BrandMark size={Number.parseInt(spacing.s32)} />
          )}
        </AppBrand>
        <AppNavigation aria-label="Sidebar">
          {SHELL_NAV.map((n) => {
            const Icon = n.icon;
            return (
              <AppNavigationLink
                as={NavLink}
                key={n.key}
                to={ROUTE_PATHS[n.key]}
                aria-label={n.label}
                title={n.label}
                $expanded={navOpen}
              >
                <Icon aria-hidden="true" />
                {navOpen ? n.label : ""}
              </AppNavigationLink>
            );
          })}
          {isPackagesAdmin &&
            ADMIN_NAV.map((n) => {
              const Icon = n.icon;
              return (
                <AppNavigationLink
                  as={NavLink}
                  key={n.key}
                  to={n.path}
                  aria-label={n.label}
                  title={n.label}
                  $expanded={navOpen}
                >
                  <Icon aria-hidden="true" />
                  {navOpen ? n.label : ""}
                </AppNavigationLink>
              );
            })}
          <AppNavigationLink
            as={NavLink}
            to="/settings"
            aria-label="Settings"
            title="Settings"
            $expanded={navOpen}
          >
            <Settings aria-hidden="true" />
            {navOpen ? "Settings" : ""}
          </AppNavigationLink>
        </AppNavigation>
        <Button
          variant="tertiary"
          size="sm"
          iconOnly
          onClick={() => setNavOpen((value) => !value)}
          aria-label={navOpen ? "Collapse menu" : "Expand menu"}
          title={navOpen ? "Collapse menu" : "Expand menu"}
        >
          {navOpen ? (
            <ChevronsLeft aria-hidden="true" />
          ) : (
            <ChevronsRight aria-hidden="true" />
          )}
        </Button>
      </AppSidebar>
      <AppMain>
        <AppHeader>
          <AppHeaderContent>
            <AppBrand>
              <BrandLogo height={Number.parseInt(spacing.s40)} />
            </AppBrand>
            <GlobalSearch />
            <AccountMenu user={user} />
          </AppHeaderContent>
        </AppHeader>
        <AppScroll>
          <AppContent>{children ?? <Outlet />}</AppContent>
        </AppScroll>
        {uploadOpen ? (
          <Suspense fallback={null}>
            <UploadDocumentModal
              open={uploadOpen}
              onClose={() => setUploadOpen(false)}
            />
          </Suspense>
        ) : null}
      </AppMain>
      <AppTabbar aria-label="Primary">
        {SHELL_NAV.slice(0, 5).map((n) => {
          const Icon = n.icon;
          return (
            <AppTab
              as={NavLink}
              key={n.key}
              to={ROUTE_PATHS[n.key]}
              aria-label={n.label}
            >
              <Icon aria-hidden="true" />
              {n.label}
            </AppTab>
          );
        })}
      </AppTabbar>
    </AppFrame>
  );
}
