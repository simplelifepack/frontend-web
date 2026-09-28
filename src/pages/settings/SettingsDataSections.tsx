import { Download, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import { T } from "@/constants/theme";
import { api } from "@/lib/api";
import { useAppDispatch } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";
import { Overlay, Row, Section } from "./settings-ui";

function downloadBlobFile(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

export function AccountDataSection() {
  const [exporting, setExporting] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  const startExport = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const job = await api.account.requestExport();
      toast.info("Preparing your Readiness export.");
      for (let attempt = 0; attempt < 20; attempt += 1) {
        const latest = await api.account.exportStatus(job.id);
        if (latest.status === "READY") {
          const { blob, fileName } = await api.account.downloadExport(job.id);
          downloadBlobFile(blob, fileName);
          toast.success("Export ready");
          return;
        }
        if (latest.status === "FAILED") throw new Error(latest.errorMessage || "Export failed.");
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
      toast.info("Export is still preparing. Try again in a moment.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Export could not be prepared.");
    } finally {
      setExporting(false);
      setExportOpen(false);
    }
  };

  return (
    <Section label="Account data">
      <Row
        icon={Download}
        label={exporting ? "Preparing export..." : "Export all data"}
        sub="Download a copy of your Readiness data, including your documents, records, and analytics."
        onClick={() => setExportOpen(true)}
        first
      />
      {exportOpen ? (
        <Overlay title="Export all data" onClose={() => setExportOpen(false)}>
          <p style={{ color: T.text, fontSize: 13.5, lineHeight: 1.7, margin: 0 }}>
            Readiness will prepare a ZIP with your user-owned data and uploaded files. The export may take a little while to assemble.
          </p>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
            <button type="button" onClick={() => setExportOpen(false)} style={secondaryButton}>Cancel</button>
            <button type="button" disabled={exporting} onClick={() => void startExport()} style={primaryButton}>Prepare ZIP</button>
          </div>
        </Overlay>
      ) : null}
    </Section>
  );
}

export function DeleteAccountSection() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [step, setStep] = useState<"warning" | "confirm" | null>(null);
  const [phrase, setPhrase] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const valid = phrase === "delete my account";

  const scheduleDeletion = async () => {
    if (!valid || submitting) return;
    setSubmitting(true);
    try {
      const result = await api.account.scheduleDeletion(phrase);
      toast.success(`Account deletion scheduled for ${new Date(result.scheduledDeletionAt).toLocaleDateString()}.`);
      await api.auth.logout().catch(() => undefined);
      dispatch(logout());
      navigate("/", { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Account deletion could not be scheduled.");
      setSubmitting(false);
    }
  };

  return (
    <Section label="Delete account" danger>
      <Row icon={Trash2} label="Delete account" sub="Schedule permanent account deletion after 30 days" onClick={() => setStep("warning")} danger first />
      {step === "warning" ? (
        <Overlay title="Delete your account?" onClose={() => setStep(null)}>
          <p style={copyStyle}>Your account will be scheduled for permanent deletion in 30 days.</p>
          <p style={copyStyle}>If you sign in again during those 30 days, the deletion request will be cancelled and you can continue using Readiness.</p>
          <p style={copyStyle}>If you don't return, your account and all associated data will be hard deleted permanently after 30 days.</p>
          <p style={copyStyle}>This includes your documents, Health and Wealth records, family information, analytics, preferences, uploaded files, and other Readiness data.</p>
          <p style={copyStyle}>There will be no application backup, recovery copy, or way to restore your account or data after deletion.</p>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
            <button type="button" onClick={() => setStep(null)} style={secondaryButton}>Cancel</button>
            <button type="button" onClick={() => setStep("confirm")} style={dangerButton}>Continue</button>
          </div>
        </Overlay>
      ) : null}
      {step === "confirm" ? (
        <Overlay title="Schedule account deletion" onClose={() => setStep(null)}>
          <label style={{ color: T.text, fontSize: 13, fontWeight: 700 }}>
            Type `delete my account` to confirm
            <input
              autoComplete="off"
              value={phrase}
              onPaste={(event) => event.preventDefault()}
              onDrop={(event) => event.preventDefault()}
              onChange={(event) => setPhrase(event.target.value)}
              style={{ width: "100%", marginTop: 8, padding: 10, borderRadius: 9, border: `1px solid ${T.border}`, background: T.raised, color: T.text }}
            />
          </label>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
            <button type="button" onClick={() => setStep(null)} style={secondaryButton}>Cancel</button>
            <button type="button" disabled={!valid || submitting} onClick={() => void scheduleDeletion()} style={{ ...dangerButton, opacity: valid && !submitting ? 1 : 0.55 }}>Schedule account deletion</button>
          </div>
        </Overlay>
      ) : null}
    </Section>
  );
}

const copyStyle = { color: T.text, fontSize: 13.5, lineHeight: 1.65, margin: "0 0 10px" };
const secondaryButton = { border: `1px solid ${T.border}`, background: T.raised, color: T.text, borderRadius: 9, padding: "9px 13px", fontWeight: 700 };
const primaryButton = { border: 0, background: T.action, color: T.actionText, borderRadius: 9, padding: "9px 13px", fontWeight: 800 };
const dangerButton = { border: 0, background: T.coral, color: T.actionText, borderRadius: 9, padding: "9px 13px", fontWeight: 800 };
