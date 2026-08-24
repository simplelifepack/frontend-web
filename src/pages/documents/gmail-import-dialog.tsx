import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Mail, X } from "lucide-react";

import { btnGhost, btnGold, T } from "@/constants/theme";
import { api, type GmailCandidate, type GmailStatus } from "@/lib/api";
import { useGoogleOAuthPopup, type OAuthPopupMessage } from "@/lib/oauth-popup";
import { useAppDispatch } from "@/store/hooks";
import { setImportedAnalyses } from "@/store/slices/documentsSlice";

type Props = {
  open: boolean;
  onClose: () => void;
  onStatusChange: (status: GmailStatus) => void;
};
const labels: Record<string, string> = {
  finance: "Banking & Finance",
  insurance: "Insurance",
  medical: "Health",
  identity: "Identity",
  employment: "Employment",
  education: "Education",
  property: "Property",
  other: "Other",
};
const formatSize = (size: number) =>
  size
    ? `${(size / 1024 / 1024).toFixed(size > 1024 * 1024 ? 1 : 2)} MB`
    : "Email content";
const oauthErrorMessage = (reason?: string, description?: string) =>
  description ||
  ({
    invalid_state: "The Gmail connection expired. Please start again.",
    access_denied:
      "Gmail permission was cancelled. Please allow read-only access to continue.",
    token_exchange_failed:
      "Google could not complete the Gmail connection. Please try again.",
    account_lookup_failed:
      "ReadiNes could not read the selected Gmail account. Please try another account.",
    missing_refresh_token:
      "Google did not return offline access. Remove ReadiNes from Google Account connections, then reconnect.",
    missing_scope:
      "Gmail read-only permission was not granted. Please reconnect and allow it.",
    database_error:
      "ReadiNes could not save the Gmail connection. Please try again.",
    token_storage_failed:
      "ReadiNes could not securely store the Gmail connection. Please try again.",
  }[reason ?? ""] ??
    "Gmail connection was not completed. Please try again.");

export default function GmailImportDialog({
  open,
  onClose,
  onStatusChange,
}: Props) {
  const dispatch = useAppDispatch();
  const [status, setStatus] = useState<GmailStatus | null>(null);
  const [candidates, setCandidates] = useState<GmailCandidate[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showConsent, setShowConsent] = useState(false);
  const [kind, setKind] = useState("all");
  const [category, setCategory] = useState("all");
  const [days, setDays] = useState("all");
  const [showIgnored, setShowIgnored] = useState(false);
  const [busy, setBusy] = useState<
    "" | "connect" | "scan" | "import" | "disconnect"
  >("");
  const [message, setMessage] = useState("");

  const refresh = useCallback(
    async (forceStatus = false) => {
      const next = await api.gmail.status(forceStatus);
      setStatus(next);
      onStatusChange(next);
      if (next.connected)
        setCandidates((await api.gmail.candidates()).candidates);
    },
    [onStatusChange],
  );

  useEffect(() => {
    if (open)
      void refresh().catch(() =>
        setMessage("Unable to load Gmail connection."),
      );
  }, [open, refresh]);
  const handleOAuthResult = useCallback(
    (payload: OAuthPopupMessage) => {
      setBusy("");
      if (payload.status === "connected") {
        setBusy("scan");
        setMessage("Connected. Searching Gmail for likely personal documents…");
        void refresh(true)
          .then(() => api.gmail.scan(false))
          .then((result) =>
            refresh(true).then(() => {
              setMessage(
                `Scan complete: ${result.relevant} relevant, ${result.needsReview} need review, ${result.ignored} ignored.`,
              );
            }),
          )
          .catch(() =>
            setMessage(
              "Gmail connected, but the first scan failed. Use Scan Gmail to try again.",
            ),
          )
          .finally(() => setBusy(""));
      } else {
        setMessage(oauthErrorMessage(payload.reason, payload.description));
      }
    },
    [refresh],
  );
  const gmailOAuth = useGoogleOAuthPopup({
    provider: "gmail",
    popupName: "ReadiNes-gmail-oauth",
    onResult: handleOAuthResult,
    onCancel: () => {
      setBusy("");
      setMessage("Gmail connection was cancelled.");
    },
  });

  const visible = useMemo(
    () =>
      candidates.filter((item) => {
        if (!showIgnored && ["ignored", "dismissed"].includes(item.status))
          return false;
        if (kind === "attachments" && !item.externalAttachmentId) return false;
        if (kind === "email" && item.externalAttachmentId) return false;
        if (category !== "all" && item.suggestedCategory !== category)
          return false;
        if (
          days !== "all" &&
          Date.now() - new Date(item.receivedAt).getTime() >
            Number(days) * 86400000
        )
          return false;
        return true;
      }),
    [candidates, kind, category, days, showIgnored],
  );
  const counts = useMemo(
    () => ({
      relevant: candidates.filter((item) => item.status === "candidate").length,
      review: candidates.filter((item) => item.status === "needs_review")
        .length,
      ignored: candidates.filter((item) =>
        ["ignored", "dismissed"].includes(item.status),
      ).length,
    }),
    [candidates],
  );
  const groups = Object.entries(
    visible.reduce<Record<string, GmailCandidate[]>>((all, item) => {
      (all[item.suggestedCategory] ??= []).push(item);
      return all;
    }, {}),
  );

  if (!open) return null;
  const connect = async () => {
    setBusy("connect");
    setMessage("");
    try {
      const { authorizationUrl } = await api.gmail.authorize();
      if (!gmailOAuth.openPopup(authorizationUrl)) {
        setBusy("");
        setMessage("Allow popups to connect Gmail.");
      }
    } catch {
      setBusy("");
      setMessage("Unable to start Gmail authorization.");
    }
  };
  const scan = async (full = false) => {
    setBusy("scan");
    setMessage("Searching Gmail for likely personal documents…");
    try {
      const result = await api.gmail.scan(full);
      await refresh(true);
      setMessage(
        `Scan complete: ${result.relevant} relevant, ${result.needsReview} need review, ${result.ignored} ignored.`,
      );
    } catch {
      setMessage("Gmail scan failed. Reconnect if access was revoked.");
    } finally {
      setBusy("");
    }
  };
  const importSelected = async () => {
    setBusy("import");
    setMessage("Preparing selected documents for local analysis…");
    try {
      const { results } = await api.gmail.import([...selected]);
      const analyses = results.flatMap((result) =>
        result.analysis ? [result.analysis] : [],
      );
      const already = results.filter(
        (result) => result.status === "already_imported",
      ).length;
      const failed = results.filter(
        (result) => result.status === "failed",
      ).length;
      if (analyses.length) {
        dispatch(setImportedAnalyses(analyses));
        window.dispatchEvent(
          new CustomEvent("ReadiNes:open-upload", {
            detail: { stayOnSave: true },
          }),
        );
        onClose();
      } else if (already || failed)
        setMessage(
          [
            already ? `${already} already in ReadiNes` : "",
            failed ? `${failed} could not be imported` : "",
          ]
            .filter(Boolean)
            .join(". "),
        );
      else setMessage("No documents were ready to review.");
      setSelected(new Set());
      await refresh();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to import selected documents.",
      );
    } finally {
      setBusy("");
    }
  };
  const disconnect = async () => {
    if (
      !confirm(
        "Disconnect Gmail? Imported ReadiNes documents will remain. Unimported candidates will be removed.",
      )
    )
      return;
    setBusy("disconnect");
    try {
      await api.gmail.disconnect();
      setCandidates([]);
      setStatus({
        connected: false,
        account: null,
        lastScannedAt: null,
        scanning: false,
      });
      onStatusChange({
        connected: false,
        account: null,
        lastScannedAt: null,
        scanning: false,
      });
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="lp-modal-backdrop" style={{ zIndex: 70 }}>
      <div
        className="lp-modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="gmail-import-title"
        style={{
          width: "min(920px,calc(100vw - 28px))",
          maxHeight: "90vh",
          overflow: "auto",
        }}
      >
        <div
          style={{ display: "flex", justifyContent: "space-between", gap: 12 }}
        >
          <div>
            <h2 id="gmail-import-title" style={{ margin: 0, color: T.white }}>
              Import from Gmail
            </h2>
            <p style={{ color: T.muted, fontSize: 13 }}>
              Candidate-first, read-only document discovery
            </p>
          </div>
          <button
            aria-label="Close Gmail import"
            style={btnGhost}
            onClick={onClose}
          >
            <X size={15} />
          </button>
        </div>
        {!status?.connected ? (
          <div
            style={{
              marginTop: 20,
              padding: 18,
              background: T.raised,
              borderRadius: 12,
            }}
          >
            <div style={{ display: "flex", gap: 12 }}>
              <Mail color={T.gold} />
              <div>
                <b style={{ color: T.white }}>Gmail is not connected</b>
                <p style={{ color: T.text, fontSize: 13, lineHeight: 1.6 }}>
                  ReadiNes will search your Gmail for likely personal
                  documents. It will not send, modify or delete email. Nothing
                  is saved until you select it.
                </p>
              </div>
            </div>
            {!showConsent ? (
              <button
                style={{ ...btnGold, marginTop: 14 }}
                onClick={() => setShowConsent(true)}
              >
                Connect Gmail
              </button>
            ) : (
              <div style={{ marginTop: 14 }}>
                <p style={{ color: T.muted, fontSize: 12 }}>
                  Google will ask for Gmail read-only access and offline access
                  so future scans work without reconnecting.
                </p>
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    style={btnGold}
                    disabled={Boolean(busy)}
                    onClick={() => void connect()}
                  >
                    {busy === "connect"
                      ? "Opening Google…"
                      : "Continue to Google"}
                  </button>
                  <button
                    style={btnGhost}
                    onClick={() => setShowConsent(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <div
              style={{
                display: "flex",
                gap: 12,
                alignItems: "center",
                flexWrap: "wrap",
                marginTop: 16,
                padding: 14,
                background: T.raised,
                borderRadius: 12,
              }}
            >
              <Check color={T.mint} />
              <div style={{ flex: 1 }}>
                <b style={{ color: T.white }}>{status.account}</b>
                <div style={{ color: T.faint, fontSize: 12 }}>
                  Last scanned:{" "}
                  {status.lastScannedAt
                    ? new Date(status.lastScannedAt).toLocaleString()
                    : "Never"}
                </div>
              </div>
              <button
                style={btnGold}
                disabled={Boolean(busy)}
                onClick={() => void scan(false)}
              >
                {busy === "scan" ? "Scanning Gmail…" : "Scan Gmail"}
              </button>
              <button
                style={btnGhost}
                disabled={Boolean(busy)}
                onClick={() => void scan(true)}
              >
                Full rescan
              </button>
              <button
                style={btnGhost}
                disabled={Boolean(busy)}
                onClick={() => void disconnect()}
              >
                Disconnect
              </button>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,minmax(0,1fr))",
                gap: 8,
                marginTop: 12,
              }}
            >
              {[
                ["Relevant documents", counts.relevant, T.mint],
                ["Needs review", counts.review, T.gold],
                ["Dismissed / ignored", counts.ignored, T.muted],
              ].map(([label, count, color]) => (
                <div
                  key={label as string}
                  style={{ padding: 10, background: T.raised, borderRadius: 9 }}
                >
                  <b style={{ color: color as string }}>{count}</b>
                  <div style={{ color: T.faint, fontSize: 11 }}>{label}</div>
                </div>
              ))}
            </div>
            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                alignItems: "center",
                margin: "16px 0",
              }}
            >
              {[
                [
                  kind,
                  setKind,
                  [
                    ["all", "All"],
                    ["attachments", "Attachments"],
                    ["email", "Email content"],
                  ],
                ],
                [
                  category,
                  setCategory,
                  [["all", "All categories"], ...Object.entries(labels)],
                ],
                [
                  days,
                  setDays,
                  [
                    ["all", "Any date"],
                    ["30", "Last 30 days"],
                    ["90", "Last 90 days"],
                  ],
                ],
              ].map(([value, setter, options], index) => (
                <select
                  aria-label={
                    ["Candidate type", "Candidate category", "Received date"][
                      index
                    ]
                  }
                  key={index}
                  value={value as string}
                  onChange={(e) =>
                    (setter as (v: string) => void)(e.target.value)
                  }
                  style={{
                    background: T.raised,
                    color: T.text,
                    border: `1px solid ${T.border}`,
                    borderRadius: 8,
                    padding: 8,
                  }}
                >
                  {(options as string[][]).map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
              ))}
              <label style={{ color: T.muted, fontSize: 12 }}>
                <input
                  type="checkbox"
                  checked={showIgnored}
                  onChange={(event) => setShowIgnored(event.target.checked)}
                />{" "}
                Show ignored results
              </label>
            </div>
            {visible.length ? (
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  marginBottom: 12,
                  flexWrap: "wrap",
                }}
              >
                <button
                  style={btnGhost}
                  onClick={() =>
                    setSelected(
                      new Set(
                        visible
                          .filter((i) =>
                            [
                              "candidate",
                              "needs_review",
                              "pending_review",
                            ].includes(i.status),
                          )
                          .map((i) => i.id),
                      ),
                    )
                  }
                >
                  Select all visible
                </button>
                <button style={btnGhost} onClick={() => setSelected(new Set())}>
                  Clear selection
                </button>
                {selected.size ? (
                  <button
                    style={btnGold}
                    disabled={Boolean(busy)}
                    onClick={() => void importSelected()}
                  >
                    {busy === "import"
                      ? "Preparing..."
                      : `Import selected (${selected.size})`}
                  </button>
                ) : null}
              </div>
            ) : null}
            {groups.map(([group, items]) => (
              <section key={group}>
                <h3 style={{ color: T.gold, fontSize: 13 }}>
                  {labels[group] ?? "Other"}
                </h3>
                {items.map((item) => {
                  const selectable = [
                    "candidate",
                    "needs_review",
                    "pending_review",
                  ].includes(item.status);
                  const failed = item.status === "import_failed";
                  return (
                    <div
                      key={item.id}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "auto 1fr auto",
                        gap: 12,
                        padding: 12,
                        marginBottom: 8,
                        border: `1px solid ${T.border}`,
                        borderRadius: 10,
                      }}
                    >
                      <input
                        aria-label={`Select ${item.filename || item.subject}`}
                        type="checkbox"
                        disabled={!selectable}
                        checked={selected.has(item.id)}
                        onChange={() =>
                          setSelected((current) => {
                            const next = new Set(current);
                            if (next.has(item.id)) next.delete(item.id);
                            else next.add(item.id);
                            return next;
                          })
                        }
                      />
                      <div>
                        <b style={{ color: T.white, fontSize: 13 }}>
                          {item.filename}
                        </b>
                        <div
                          style={{ color: T.muted, fontSize: 11, marginTop: 4 }}
                        >
                          {item.sender} ·{" "}
                          {new Date(item.receivedAt).toLocaleDateString()} ·{" "}
                          {item.mimeType} · {formatSize(item.size)}
                        </div>
                        <div
                          style={{ color: T.faint, fontSize: 11, marginTop: 4 }}
                        >
                          {labels[item.suggestedCategory] ?? "Other"} ·{" "}
                          {item.suggestedDocumentType} · score{" "}
                          {item.relevanceScore}
                        </div>
                        <div
                          style={{
                            color:
                              item.status === "ignored" || failed
                                ? T.coral
                                : T.text,
                            fontSize: 11,
                            marginTop: 4,
                          }}
                        >
                          {item.ignoredReason ?? item.relevanceReason}
                        </div>
                        <div
                          style={{ color: T.faint, fontSize: 10, marginTop: 3 }}
                        >
                          {item.legitimacyReason}
                        </div>
                      </div>
                      <div>
                        {item.status === "imported" ? (
                          <span style={{ color: T.mint, fontSize: 11 }}>
                            Already in ReadiNes
                          </span>
                        ) : failed ? (
                          <span style={{ color: T.coral, fontSize: 11 }}>
                            Import failed
                          </span>
                        ) : selectable ? (
                          <button
                            style={btnGhost}
                            onClick={() =>
                              void api.gmail
                                .dismiss(item.id)
                                .then(() =>
                                  setCandidates((c) =>
                                    c.map((x) =>
                                      x.id === item.id
                                        ? {
                                            ...x,
                                            status: "dismissed",
                                            ignoredReason: "Dismissed by user",
                                          }
                                        : x,
                                    ),
                                  ),
                                )
                            }
                          >
                            Dismiss
                          </button>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </section>
            ))}
            {!visible.length && busy !== "scan" ? (
              <div style={{ color: T.muted, padding: 24, textAlign: "center" }}>
                No relevant Gmail documents found. Try scanning again later.
              </div>
            ) : null}
            {selected.size ? (
              <div
                style={{
                  position: "sticky",
                  bottom: 0,
                  background: T.panel,
                  paddingTop: 12,
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  style={btnGold}
                  disabled={Boolean(busy)}
                  onClick={() => void importSelected()}
                >
                  {busy === "import"
                    ? "Preparing..."
                    : `Import selected (${selected.size})`}
                </button>
              </div>
            ) : null}
          </>
        )}
        {message ? (
          <p
            style={{
              color:
                message.includes("failed") || message.includes("Unable")
                  ? T.coral
                  : T.muted,
              fontSize: 13,
            }}
          >
            {message}
          </p>
        ) : null}
      </div>
    </div>
  );
}
