import { Text, Input, Button } from "@/design-system";

import { Download, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import { T } from "@/constants/theme";
import { abortableDelay } from "@/lib/abortable-delay";
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
  const pending = useRef<AbortController | null>(null);
  useEffect(() => () => { pending.current?.abort(); }, []);
  const [exporting, setExporting] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  const startExport = async () => {
    if (pending.current) return;
    const controller = new AbortController();
    pending.current = controller;
    setExporting(true);
    try {
      const job = await api.account.requestExport(controller.signal);
      controller.signal.throwIfAborted();
      toast.info("Preparing your Readines export.");
      for (let attempt = 0; attempt < 20; attempt += 1) {
        const latest = await api.account.exportStatus(job.id, controller.signal);
        controller.signal.throwIfAborted();
        if (latest.status === "READY") {
          const { blob, fileName } = await api.account.downloadExport(job.id, controller.signal);
          controller.signal.throwIfAborted();
          downloadBlobFile(blob, fileName);
          toast.success("Export ready");
          return;
        }
        if (latest.status === "FAILED") throw new Error(latest.errorMessage || "Export failed.");
        await abortableDelay(1500, controller.signal);
      }
      toast.info("Export is still preparing. Try again in a moment.");
    } catch (error) {
      if (controller.signal.aborted) return;
      toast.error(error instanceof Error ? error.message : "Export could not be prepared.");
    } finally {
      pending.current = null;
      if (!controller.signal.aborted) {
        setExporting(false);
        setExportOpen(false);
      }
    }
  };

  return (
    <Section label="Account data">
      <Row
        icon={Download}
        label={exporting ? "Preparing export..." : "Export all data"}
        sub="Download a copy of your Readines data, including your documents, records, and analytics."
        onClick={() => setExportOpen(true)}
        first
      />
      {exportOpen ? (
        <Overlay title="Export all data" onClose={() => setExportOpen(false)}>
          <Text as="p" size="md" style={{ color: T.text, margin: 0 }}>
            Readines will prepare a ZIP with your user-owned data and uploaded files. The export may take a little while to assemble.
          </Text>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-s10)", marginTop: "var(--space-s18)" }}>
            <Button variant="secondary" type="button" onClick={() => setExportOpen(false)} >Cancel</Button>
            <Button variant="primary" type="button" disabled={exporting} onClick={() => void startExport()} >Prepare ZIP</Button>
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
          <Text as="p" size="md" style={copyStyle}>Your account will be scheduled for permanent deletion in 30 days.</Text>
          <Text as="p" size="md" style={copyStyle}>If you sign in again during those 30 days, the deletion request will be cancelled and you can continue using Readines.</Text>
          <Text as="p" size="md" style={copyStyle}>If you don't return, your account and all associated data will be hard deleted permanently after 30 days.</Text>
          <Text as="p" size="md" style={copyStyle}>This includes your documents, Health and Wealth records, family information, analytics, preferences, uploaded files, and other Readines data.</Text>
          <Text as="p" size="md" style={copyStyle}>There will be no application backup, recovery copy, or way to restore your account or data after deletion.</Text>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-s10)", marginTop: "var(--space-s18)" }}>
            <Button variant="secondary" type="button" onClick={() => setStep(null)} >Cancel</Button>
            <Button tone="danger" variant="primary" type="button" onClick={() => setStep("confirm")} >Continue</Button>
          </div>
        </Overlay>
      ) : null}
      {step === "confirm" ? (
        <Overlay title="Schedule account deletion" onClose={() => setStep(null)}>
          <Text as="label" size="md" weight="medium" style={{ color: T.text }}>
            Type `delete my account` to confirm
            <Input
              autoComplete="off"
              value={phrase}
              onPaste={(event) => event.preventDefault()}
              onDrop={(event) => event.preventDefault()}
              onChange={(event) => setPhrase(event.target.value)}
              style={{ width: "100%", marginTop: "var(--space-s8)" }}
            />
          </Text>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-s10)", marginTop: "var(--space-s18)" }}>
            <Button variant="secondary" type="button" onClick={() => setStep(null)} >Cancel</Button>
            <Button tone="danger" variant="primary" type="button" disabled={!valid || submitting} onClick={() => void scheduleDeletion()} >Schedule account deletion</Button>
          </div>
        </Overlay>
      ) : null}
    </Section>
  );
}

const copyStyle = { color: T.text, margin: "0 0 var(--space-s10)" };
