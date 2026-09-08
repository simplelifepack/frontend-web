import { useCallback, useEffect, useState } from "react";
import { Check, Cloud, X } from "lucide-react";

import { btnGhost, btnGold, T } from "@/constants/theme";
import { api, type DriveStatus } from "@/lib/api";
import { useGoogleOAuthPopup, type OAuthPopupMessage } from "@/lib/oauth-popup";

type Props = { open: boolean; onClose: () => void; onStatusChange: (status: DriveStatus) => void; onDocumentsChanged: () => void };

const emptyStatus: DriveStatus = {
  connected: false, account: null, scanStatus: "idle", lastScannedAt: null, lastSuccessfulSync: null,
  scanning: false, phase: null, processed: 0, total: 0, indexedCount: 0, error: null,
};
const DRIVE_STATUS_POLL_MS = 5_000;

function oauthErrorMessage(payload: OAuthPopupMessage) {
  if (payload.description) return payload.description;
  return ({
    invalid_state: "The Google Drive connection expired. Please start again.",
    access_denied: "Google Drive authorization was denied.",
    token_exchange_failed: "Google could not complete the Google Drive connection. Please try again.",
    account_lookup_failed: "Readiness could not read the selected Google account. Please try another account.",
    missing_refresh_token: "Google did not return offline access. Remove Readiness from Google Account connections, then reconnect.",
    missing_scope: "Google Drive read-only permission was not granted. Please reconnect and allow it.",
    database_error: "Readiness could not save the Google Drive connection. Please try again.",
    token_storage_failed: "Readiness could not securely store the Google Drive connection. Please try again.",
  }[payload.reason ?? ""] ?? "Google Drive connection was not completed. Please try again.");
}

export default function DriveDialog({ open, onClose, onStatusChange, onDocumentsChanged }: Props) {
  const [status, setStatus] = useState<DriveStatus>(emptyStatus);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [duplicateAction, setDuplicateAction] = useState<"replace" | "keep_both" | "ignore">("ignore");
  const updateStatus = useCallback((next: DriveStatus) => {
    setStatus(next);
    onStatusChange(next);
  }, [onStatusChange]);
  const refresh = useCallback(async () => {
    const next = await api.drive.status();
    updateStatus(next);
    return next;
  }, [updateStatus]);
  const scan = useCallback(async (full = false, currentStatus = status) => {
    setBusy("scan");
    setMessage("");
    updateStatus({
      ...currentStatus,
      scanStatus: "scanning",
      scanning: true,
      phase: "Loading...",
      processed: 0,
      total: 0,
      error: null,
    });
    try {
      const result = await api.drive.scan(full, duplicateAction);
      const next = await refresh();
      setBusy("");
      onDocumentsChanged();
      setMessage(next.error || `${result.message} Imported ${result.imported}, skipped ${result.skipped}, failed ${result.failed}.`);
    } catch (error) {
      setBusy("");
      updateStatus({ ...currentStatus, scanStatus: "failed", scanning: false, phase: null });
      setMessage(error instanceof Error ? error.message : "Google Drive scan could not start. Reconnect if access was revoked.");
    }
  }, [duplicateAction, onDocumentsChanged, refresh, status, updateStatus]);

  useEffect(() => { if (open) void refresh().catch(() => setMessage("Unable to load Google Drive connection.")); }, [open, refresh]);
  useEffect(() => {
    if (!open || !status.scanning) return;
    let cancelled = false;
    let timer: number | undefined;
    const poll = () => {
      void refresh().then((next) => {
        if (cancelled) return;
        if (!next.scanning) {
          setBusy("");
          onDocumentsChanged();
          setMessage(next.error || "Google Drive scan complete.");
          return;
        }
        timer = window.setTimeout(poll, DRIVE_STATUS_POLL_MS);
      }).catch(() => {
        if (cancelled) return;
        setMessage("Unable to refresh scan progress.");
        timer = window.setTimeout(poll, DRIVE_STATUS_POLL_MS);
      });
    };
    timer = window.setTimeout(poll, DRIVE_STATUS_POLL_MS);
    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [open, onDocumentsChanged, refresh, status.scanning]);
  const handleOAuthResult = useCallback((payload: OAuthPopupMessage) => {
    if (payload.status === "connected") {
      void refresh().then((next) => scan(false, next));
    } else {
      setBusy("");
      setMessage(oauthErrorMessage(payload));
    }
  }, [refresh, scan]);
  const driveOAuth = useGoogleOAuthPopup({
    provider: "drive",
    popupName: "readiness-drive-oauth",
    onResult: handleOAuthResult,
    onCancel: () => { setBusy(""); setMessage("Google Drive connection was cancelled."); },
  });

  if (!open) return null;

  const connect = async () => {
    if (!driveOAuth.openPopup("about:blank")) {
      setMessage("Allow popups to connect Google Drive.");
      return;
    }
    setBusy("connect");
    setMessage("");
    try {
      const { authorizationUrl } = await api.drive.authorize();
      if (!driveOAuth.navigatePopup(authorizationUrl)) {
        setBusy("");
        setMessage("Google Drive connection was cancelled.");
      }
    } catch (error) {
      driveOAuth.closePopup();
      setBusy("");
      setMessage(error instanceof Error ? error.message : "Unable to start Google Drive authorization.");
    }
  };
  const disconnect = async () => {
    if (!confirm("Disconnect Google Drive? Indexed metadata will remain in Readiness.")) return;
    setBusy("disconnect");
    try { await api.drive.disconnect(); updateStatus(emptyStatus); setMessage("Google Drive disconnected."); }
    catch { setMessage("Unable to disconnect Google Drive."); }
    finally { setBusy(""); }
  };

  return (
    <div className="lp-modal-backdrop" style={{ zIndex: 100, padding: 14 }} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="lp-modal-panel" role="dialog" aria-modal="true" aria-labelledby="drive-title" style={{ width: "min(650px,calc(100vw - 28px))" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <div><h2 id="drive-title" style={{ margin: 0, color: T.white }}>Google Drive</h2><p style={{ color: T.muted, fontSize: 13 }}>Read-only PDF discovery and indexing</p></div>
          <button aria-label="Close Google Drive" style={btnGhost} onClick={onClose}><X size={15} /></button>
        </div>
        {!status.connected ? (
          <div style={{ padding: 16, background: T.raised, borderRadius: 12 }}>
            <div style={{ display: "flex", gap: 12 }}><Cloud color={T.gold} /><div><b style={{ color: T.white }}>Google Drive is not connected</b><p style={{ color: T.text, fontSize: 13, lineHeight: 1.6 }}>Readiness requests only Drive read-only access, searches only for PDFs, and stores metadata—not PDF copies.</p></div></div>
            <button style={{ ...btnGold, marginTop: 14 }} disabled={Boolean(busy)} onClick={() => void connect()}>{busy === "connect" ? "Opening Google…" : "Connect Google Drive"}</button>
          </div>
        ) : (
          <div style={{ padding: 16, background: T.raised, borderRadius: 12 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}><Check color={T.mint} /><div><b style={{ color: T.white }}>Connected</b><div style={{ color: T.muted, fontSize: 12 }}>{status.account}</div></div></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 16 }}>
              <div style={{ color: T.muted, fontSize: 12 }}>Last Scan<br /><b style={{ color: T.white }}>{status.lastScannedAt ? new Date(status.lastScannedAt).toLocaleString() : "Never"}</b></div>
              <div style={{ color: T.muted, fontSize: 12 }}>PDFs Indexed<br /><b style={{ color: T.white }}>{status.indexedCount}</b></div>
            </div>
            {status.scanning ? <div style={{ marginTop: 18 }}><div style={{ color: T.gold, fontWeight: 700 }}>{status.phase || "Loading..."}</div><div style={{ color: T.white, marginTop: 6 }}>{status.processed} / {status.total} PDFs</div><progress max={Math.max(status.total, 1)} value={status.processed} style={{ width: "100%", marginTop: 8 }} /></div> : null}
            <div style={{ display: "flex", gap: 9, flexWrap: "wrap", marginTop: 18 }}>
              <button style={btnGold} disabled={Boolean(busy) || status.scanning} onClick={() => void scan(false)}>Scan Now</button>
              <button style={btnGhost} disabled={Boolean(busy) || status.scanning} onClick={() => void scan(true)}>Full Rescan</button>
              <button style={btnGhost} disabled={Boolean(busy) || status.scanning} onClick={() => void disconnect()}>Disconnect</button>
            </div>
            <label style={{ display: "grid", gap: 5, marginTop: 14, color: T.muted, fontSize: 12 }}>
              When unique number or checksum matches
              <select value={duplicateAction} disabled={status.scanning} onChange={(event) => setDuplicateAction(event.target.value as typeof duplicateAction)} style={{ padding: "9px 10px", borderRadius: 9, border: `1px solid ${T.border}`, background: T.panel, color: T.white }}>
                <option value="ignore">Ignore</option>
                <option value="replace">Replace</option>
                <option value="keep_both">Keep Both</option>
              </select>
            </label>
          </div>
        )}
        {message || status.error ? <div style={{ color: status.error ? T.coral : T.muted, fontSize: 12, marginTop: 12 }}>{message || status.error}</div> : null}
      </div>
    </div>
  );
}
