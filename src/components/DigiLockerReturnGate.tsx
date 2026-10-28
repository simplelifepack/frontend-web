import { useEffect, useRef, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { Text } from "@/design-system";
import { API_URL } from "@/lib/http-client";

// The registered redirect can be the existing web Documents URL. Forward only
// OAuth response fields to our fixed backend; tokens are exchanged server-side.
export function digiLockerCallbackTarget(pathname: string, search: string) {
  if (pathname !== "/documents") return null;
  const query = new URLSearchParams(search);
  if (!query.has("state") || (!query.has("code") && !query.has("error"))) return null;
  const target = new URL("/api/integrations/digilocker/callback", API_URL);
  for (const key of ["state", "code", "error"]) {
    for (const value of query.getAll(key)) target.searchParams.append(key, value);
  }
  return target.toString();
}
const navigateToBackend = (target: string) => {
  window.history.replaceState(null, "", window.location.pathname);
  window.location.replace(target);
};
export default function DigiLockerReturnGate({ children, redirect = navigateToBackend }: {
  children: ReactNode; redirect?: (target: string) => void;
}) {
  const location = useLocation();
  const target = digiLockerCallbackTarget(location.pathname, location.search);
  const forwarded = useRef(false);
  useEffect(() => {
    if (!target || forwarded.current) return;
    forwarded.current = true;
    redirect(target);
  }, [target, redirect]);
  if (target) return <Text role="status">Completing DigiLocker authorization…</Text>;
  return children;
}
