import { useRef, useState } from "react";
import { api } from "@/lib/api";
import { clearPackageCatalogueCache } from "@/packages/packageCatalogueCache";
import { useAppDispatch } from "@/store/hooks";
import { invalidatePackagePages, updateRefreshedPackage } from "@/store/slices/packagesSlice";
import { refreshUsage } from "@/store/slices/usageSlice";
import { invalidateRequests } from "@/lib/request-deduper";

export function usePackageRefresh(slug: string) {
  const dispatch = useAppDispatch();
  const pending = useRef(new Set<string>());
  const [busySlug, setBusySlug] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ slug: string; message: string; error: boolean } | null>(null);
  const refresh = async () => {
    if (pending.current.has(slug)) return;
    pending.current.add(slug);
    setBusySlug(slug);
    setFeedback(null);
    try {
      const result = await api.packages.refresh(slug);
      invalidateRequests("GET:/api/packages");
      await clearPackageCatalogueCache().catch(() => undefined);
      dispatch(invalidatePackagePages());
      dispatch(updateRefreshedPackage(result.package));
      setFeedback({ slug, message: result.message, error: false });
    } catch (error) {
      setFeedback({ slug, message: error instanceof Error ? error.message : "Unable to check this package. Please try again.", error: true });
    } finally {
      pending.current.delete(slug);
      setBusySlug(current => current === slug ? null : current);
      void dispatch(refreshUsage(true));
    }
  };
  return { refresh, refreshing: busySlug === slug, feedback: feedback?.slug === slug ? feedback : null };
}
