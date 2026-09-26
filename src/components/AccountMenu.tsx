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

  return (
    <div className="lp-account-menu" ref={rootRef}>
      <button
        type="button"
        className="lp-user-menu"
        onClick={() => setOpen((value) => !value)}
        aria-label="Open account menu"
        aria-expanded={open}
        aria-controls="lp-account-dropdown"
      >
        <b>{initial}</b>
        <span>{name}</span>
        <ChevronDown size={15} />
      </button>
      {open ? (
        <div
          id="lp-account-dropdown"
          className="lp-account-dropdown"
          role="menu"
          aria-label="Account"
        >
          <div className="lp-account-identity">
            <b>{initial}</b>
            <span>
              <strong>{name}</strong>
              <small>{user ? "Signed in" : "Not signed in"}</small>
            </span>
          </div>
          <div className="lp-account-section">
            <small>INSTANCE</small>
            <button
              type="button"
              className="lp-account-instance"
              role="menuitem"
              onClick={() => go("/documents")}
            >
              <FolderOpen size={19} />
              <span>
                <strong>My archive</strong>
                <small>Your real documents</small>
              </span>
              <Check size={16} className="lp-account-selected" />
            </button>
          </div>
          <div className="lp-account-actions">
            <button
              type="button"
              role="menuitem"
              onClick={() => go("/settings")}
            >
              <Settings size={18} /> Profile and settings
            </button>
            <button type="button" role="menuitem" onClick={() => go("/family")}>
              <Users size={18} /> Family
            </button>
            <button
              type="button"
              role="menuitem"
              className="lp-account-signout"
              onClick={() => void signOut()}
            >
              <LogOut size={18} /> Sign out
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
