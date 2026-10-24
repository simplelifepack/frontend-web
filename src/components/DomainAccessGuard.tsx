import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { hasFullApplicationAccess } from "@/lib/domain-access";

export default function DomainAccessGuard({ children, landing, hostname = window.location.hostname }: { children: ReactNode; landing: ReactNode; hostname?: string }) {
  if (hasFullApplicationAccess(hostname)) return children;
  return <Routes>
    <Route path="/" element={landing} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>;
}
