import { Text } from "@/design-system";
import { useEffect, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  FolderOpen,
  LogOut,
  Settings,
  Users,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import { api, type AuthUser } from "@/lib/api";
import { useAppDispatch } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";

export default function AccountMenu({ user }: { user: AuthUser | null }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const name = user?.name?.trim() || "Account";
  const initial = name.charAt(0).toUpperCase();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const go = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  const signOut = async () => {
    setOpen(false);
    await api.auth.logout().catch(() => undefined);
    dispatch(logout());
    navigate("/", { replace: true });
  };

  const menuItems = () =>
    Array.from(
      rootRef.current?.querySelectorAll<HTMLButtonElement>(
        '[role="menuitem"]',
      ) ?? [],
    );
  const focusItem = (index: number) =>
    requestAnimationFrame(() => {
      const items = menuItems();
      items[(index + items.length) % items.length]?.focus();
    });
  return (
    <div
      className="lp-account-menu"
      ref={rootRef}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          setOpen(false);
          rootRef.current
            ?.querySelector<HTMLButtonElement>(".lp-user-menu")
            ?.focus();
        }
        if (!open) return;
        const items = menuItems();
        const current = items.indexOf(
          document.activeElement as HTMLButtonElement,
        );
        if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
          event.preventDefault();
          focusItem(
            event.key === "Home"
              ? 0
              : event.key === "End"
                ? items.length - 1
                : current + (event.key === "ArrowDown" ? 1 : -1),
          );
        }
        if (event.key === "Tab") {
          setOpen(false);
          rootRef.current?.querySelector<HTMLButtonElement>(".lp-user-menu")?.focus();
        }
      }}
    >
      <button
        type="button"
        className="lp-user-menu"
        onClick={() => {
          setOpen((value) => !value);
          if (!open) focusItem(0);
        }}
        aria-haspopup="menu"
        onKeyDown={(event) => {
          if (!open && ["ArrowDown", "ArrowUp"].includes(event.key)) {
            event.preventDefault();
            setOpen(true);
            focusItem(event.key === "ArrowUp" ? -1 : 0);
          }
        }}
        aria-label="Open account menu"
        aria-expanded={open}
        aria-controls="lp-account-dropdown"
      >
        <b>{initial}</b>
        <span>{name}</span>
        <ChevronDown aria-hidden="true" focusable="false" size={15} />
      </button>
      {open ? (
        <div
          id="lp-account-dropdown"
          className="lp-account-dropdown"
          role="menu"
          aria-label="Account"
        >
          <div className="lp-account-identity">
            <Text as="b" size="md" weight="semibold">
              {initial}
            </Text>
            <span>
              <Text as="strong" size="md" weight="semibold">
                {name}
              </Text>
              <Text as="small" size="sm">
                {user ? "Signed in" : "Not signed in"}
              </Text>
            </span>
          </div>
          <div className="lp-account-section">
            <Text as="small" size="sm">
              INSTANCE
            </Text>
            <button
              type="button"
              className="lp-account-instance"
              role="menuitem"
              onClick={() => go("/documents")}
            >
              <FolderOpen aria-hidden="true" focusable="false" size={19} />
              <span>
                <strong>My archive</strong>
                <small>Your real documents</small>
              </span>
              <Check
                aria-hidden="true"
                focusable="false"
                size="var(--icon-small)"
                className="lp-account-selected"
              />
            </button>
          </div>
          <div className="lp-account-actions">
            <button
              type="button"
              role="menuitem"
              onClick={() => go("/settings")}
            >
              <Settings
                aria-hidden="true"
                focusable="false"
                size="var(--icon-regular)"
              />{" "}
              Profile and settings
            </button>
            <button type="button" role="menuitem" onClick={() => go("/family")}>
              <Users
                aria-hidden="true"
                focusable="false"
                size="var(--icon-regular)"
              />{" "}
              Family
            </button>
            <button
              type="button"
              role="menuitem"
              className="lp-account-signout"
              onClick={() => void signOut()}
            >
              <LogOut
                aria-hidden="true"
                focusable="false"
                size="var(--icon-regular)"
              />{" "}
              Sign out
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
