import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Plus, Search } from "lucide-react";
import { useLocation } from "react-router-dom";

import SectionHead from "@/components/SectionHead";
import { api, type WealthRecord } from "@/lib/api";
import { getStoredHomeCurrency } from "@/lib/preferences-storage";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchDocuments } from "@/store/slices/documentsSlice";
import CaptureProofDialog, { HoldingModal } from "./capture-proof-dialog";
import RecordActionsDialog from "./record-actions-dialog";
import WealthHandoffDialog from "./sos-handoff-dialog";
import { WealthActionSheet, WealthDesktopActions } from "./wealth-actions";
import { type WealthCategory } from "./wealth-categories";
import { EmptyWealth, Readiness, ReadinessMath } from "./wealth-summary";
import { NeedsAttention } from "./wealth-attention";
import { WealthSections } from "./wealth-page-sections";
import {
  classifyWealthRecord,
  dashboardStats,
  payloadFromRecord,
  recordSubtitle,
  typeLabels,
} from "./wealth-view";

export default function WealthPage() {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const docsLoaded = useAppSelector((state) => state.documents.loaded);
  const user = useAppSelector((state) => state.auth.user);
  const [records, setRecords] = useState<WealthRecord[]>([]);
  const [captureOpen, setCaptureOpen] = useState<"asset" | "proof" | "money" | null>(null);
  const [actionSheetOpen, setActionSheetOpen] = useState(false);
  const [handoffOpen, setHandoffOpen] = useState(false);
  const [editingHolding, setEditingHolding] = useState<WealthRecord | null>(null);
  const [action, setAction] = useState<{ mode: "edit" | "note" | "attach" | "delete"; record: WealthRecord } | null>(null);
  const [query, setQuery] = useState("");
  const [showMath, setShowMath] = useState(false);
  const [category, setCategory] = useState<WealthCategory>("all");
  const [homeCurrency, setHomeCurrency] = useState(getStoredHomeCurrency);
  const handledDeepLink = useRef("");
  const stats = useMemo(() => dashboardStats(records, homeCurrency), [homeCurrency, records]);
  const shownRecords = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return records;
    return records.filter((record) =>
      [
        record.title,
        recordSubtitle(record),
        typeLabels[record.type],
        ...Object.values(record.details).map(String),
      ]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }, [query, records]);
  const shownStats = useMemo(
    () => dashboardStats(shownRecords, homeCurrency),
    [homeCurrency, shownRecords],
  );

  useEffect(() => {
    void api.wealth.records().then(setRecords);
  }, []);
  useEffect(() => {
    if (!docsLoaded) void dispatch(fetchDocuments());
  }, [dispatch, docsLoaded]);
  useEffect(() => {
    const refreshPreferences = () => setHomeCurrency(getStoredHomeCurrency());
    window.addEventListener("readiness-preferences-changed", refreshPreferences);
    return () => window.removeEventListener("readiness-preferences-changed", refreshPreferences);
  }, []);

  const saved = useCallback((record: WealthRecord) => setRecords((current) => [record, ...current.filter((item) => item.id !== record.id)]), []);
  const fullRecord = useCallback(async (record: WealthRecord) => {
    const full = await api.wealth.record(record.id);
    saved(full);
    return full;
  }, [saved]);
  const openAction = useCallback(async (mode: "edit" | "note" | "attach" | "delete", record: WealthRecord) => {
    setAction({ mode, record: await fullRecord(record) });
  }, [fullRecord]);
  const openRecord = useCallback(async (record: WealthRecord) => {
    const full = await fullRecord(record);
    if (classifyWealthRecord(full) === "lentBorrowed") {
      setAction({ mode: "edit", record: full });
      return;
    }
    setEditingHolding(full);
  }, [fullRecord]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const recordId = params.get("record");
    const key = `${recordId ?? ""}:${params.get("action") ?? ""}`;
    if (!recordId || handledDeepLink.current === key) return;
    const record = records.find((item) => item.id === recordId);
    if (!record) return;
    handledDeepLink.current = key;
    const mode = params.get("action");
    if (mode === "attach" || mode === "note") void openAction(mode, record);
    else void openRecord(record);
  }, [location.search, openAction, openRecord, records]);

  const deleted = (id: string) =>
    setRecords((current) => current.filter((item) => item.id !== id));
  const toggleSettled = async (record: WealthRecord, settled: boolean) => {
    const full = await fullRecord(record);
    const updated = await api.wealth.updateRecord(
      full.id,
      payloadFromRecord(full, {
        details: { ...full.details, followUpDone: settled },
        followUpDate: settled ? null : full.followUpDate,
      }),
    );
    saved(updated);
    if (editingHolding?.id === full.id) setEditingHolding(updated);
  };
  const goLent = () => {
    if (category !== "all" && category !== "Lent and borrowed") setCategory("Lent and borrowed");
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.getElementById("lp-lentborrowed")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  };

  return (
    <div className="lp-route lp-wealth-route">
      <div className="lp-mobile-module-head">
        <h1>Wealth</h1>
        <div>
          <button
            type="button"
            onClick={() => setActionSheetOpen(true)}
            aria-label="Wealth actions"
          >
            <Plus size={18} />
          </button>
          <button type="button" aria-label="Search Wealth">
            <Search size={17} />
          </button>
          <span>{user?.name?.charAt(0).toUpperCase() || "A"}</span>
        </div>
      </div>
      <SectionHead
        title="Wealth"
        sub="Not a balance sheet: whether your family could access all of it if something happened to you."
        action={null}
      />
      <WealthDesktopActions onHolding={() => setCaptureOpen("asset")} onProof={() => setCaptureOpen("proof")} onMoney={() => setCaptureOpen("money")} onSos={() => setHandoffOpen(true)} />
      {actionSheetOpen ? (
        <WealthActionSheet
          onClose={() => setActionSheetOpen(false)}
          onDocument={() => {
            setActionSheetOpen(false);
            setCaptureOpen("proof");
          }}
          onHolding={() => {
            setActionSheetOpen(false);
            setCaptureOpen("asset");
          }}
          onMoney={() => {
            setActionSheetOpen(false);
            setCaptureOpen("money");
          }}
        />
      ) : null}
      <Readiness
        stats={stats}
        records={records}
        showMath={showMath}
        onMath={() => setShowMath((value) => !value)}
        onSos={() => setHandoffOpen(true)}
        onLent={goLent}
      />
      {showMath ? <ReadinessMath records={records} /> : null}
      <NeedsAttention
        records={shownRecords}
        onSelect={(record) => void openRecord(record)}
        onAction={(mode, record) => void openAction(mode, record)}
      />
      {!shownRecords.length ? (
        <EmptyWealth query={query} onCapture={() => setCaptureOpen("asset")} />
      ) : null}
      <WealthSections category={category} stats={shownStats} onCategory={setCategory} onRecord={() => setCaptureOpen("money")} onSelect={(record) => void openRecord(record)} onSettle={toggleSettled} />
      {captureOpen ? (
        <CaptureProofDialog
          mode={captureOpen}
          initialCategoryCode={
            captureOpen === "asset" ? "asset" : "payment_proof"
          }
          title={
            captureOpen === "asset"
              ? "Add holding"
              : captureOpen === "money"
                ? "Record money lent or borrowed"
                : "Capture proof"
          }
          onClose={() => setCaptureOpen(null)}
          onSaved={(record) => {
            saved(record);
            setCaptureOpen(null);
          }}
        />
      ) : null}
      {editingHolding ? (
        <HoldingModal
          record={editingHolding}
          onClose={() => setEditingHolding(null)}
          onSaved={(record) => {
            saved(record);
            setEditingHolding(null);
          }}
          onDeleted={(id) => {
            deleted(id);
            setEditingHolding(null);
          }}
        />
      ) : null}
      {action ? (
        <RecordActionsDialog
          mode={action.mode}
          record={action.record}
          onClose={() => setAction(null)}
          onDeleted={(id) => {
            deleted(id);
            setEditingHolding(null);
          }}
          onSaved={(record) => {
            saved(record);
            setAction(null);
          }}
        />
      ) : null}
      {handoffOpen ? (
        <WealthHandoffDialog onClose={() => setHandoffOpen(false)} />
      ) : null}
    </div>
  );
}
