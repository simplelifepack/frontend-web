import { Text, ModalBackdrop, ModalPanel, Checkbox, Button } from "@/design-system";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Loader2, ShieldCheck, Siren, X } from "lucide-react";

import { api, type WealthHandoffRecipient, type WealthHandoffSummary } from "@/lib/api";

const css = { panel: "var(--lp-panel)", raised: "var(--lp-raised)", border: "var(--lp-border)", text: "var(--lp-text)", muted: "var(--lp-muted)", heading: "var(--lp-heading)", coral: "var(--lp-coral)", mint: "var(--lp-mint)", info: "var(--lp-info)" };

export default function WealthHandoffDialog({ onClose }: { onClose: () => void }) {
  const [summary, setSummary] = useState<WealthHandoffSummary | null>(null);
  const [chosen, setChosen] = useState<Set<string>>(new Set());
  const [ack, setAck] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<Awaited<ReturnType<typeof api.wealth.sendHandoff>> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    api.wealth.handoffSummary().then((data) => {
      if (!active) return;
      setSummary(data);
      setChosen(new Set([...data.recipients.family, ...data.recipients.emergency].filter((item) => item.canReceiveHandoff).map((item) => item.id)));
    }).catch((err) => active && setError(err instanceof Error ? err.message : "Unable to load SOS handoff."));
    return () => { active = false; };
  }, []);

  const recipients = useMemo(() => summary ? [...summary.recipients.family, ...summary.recipients.emergency, ...(summary.recipients.other ?? [])] : [], [summary]);
  const docs = useMemo(() => summary?.handoffTypes.reduce((sum, item) => sum + item.counts.documents + item.counts.images, 0) ?? 0, [summary]);
  const selectedFamily = summary?.recipients.family.filter((item) => chosen.has(item.id)).map((item) => item.id) ?? [];
  const selectedEmergency = summary?.recipients.emergency.filter((item) => chosen.has(item.id)).map((item) => item.id) ?? [];
  const canSend = chosen.size > 0 && ack && !busy;

  function toggle(id: string) {
    setChosen((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else if (recipients.find((recipient) => recipient.id === id)?.canReceiveHandoff) next.add(id);
      return next;
    });
  }

  async function release() {
    if (!canSend) return;
    setBusy(true);
    setError(null);
    try {
      setDone(await api.wealth.sendHandoff({ familyRecipientIds: selectedFamily, emergencyRecipientIds: selectedEmergency }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to release SOS handoff.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ModalBackdrop  onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: "var(--layer-overlay)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <ModalPanel onDismiss={onClose} className="lp-wealth-ref-modal" onClick={(event) => event.stopPropagation()} style={{ width: "min(480px,100%)", maxHeight: "92vh", overflowY: "auto" }} role="dialog" aria-modal="true">
        <div className="lp-sheet-grab lp-grabonly" />
        <Head onClose={onClose} />
        {error ? <Text as="div" size="md" className="lp-sos-error">{error}</Text> : null}
        {!summary ? <Text as="div" size="md" className="lp-sos-loading"><Loader2 aria-hidden="true" focusable="false" size="var(--icon-regular)" /> Loading emergency handoff</Text> : done ? <Done result={done} /> : (
          <>
            <Text as="p" size="md" tone="muted" style={{ color: css.muted, margin: "0 0 var(--space-s14)" }}>For a real emergency. Releases {docs} wealth documents and every access instruction to the people below, so nothing is locked away when it matters.</Text>
            <SectionTitle>Who steps in</SectionTitle>
            {recipients.length ? recipients.map((recipient) => <RecipientRow key={recipient.id} recipient={recipient} checked={chosen.has(recipient.id)} onToggle={() => toggle(recipient.id)} />) : <EmptyTrust />}
            <div style={{ marginTop: "var(--space-s14)", borderRadius: 11, border: `1px solid ${css.border}`, background: css.raised, padding: "11px 13px", fontSize: "var(--text-md)", lineHeight: "var(--line-body)" }}>
              <Text as="div" size="md" weight="semibold" style={{ color: css.text, marginBottom: "var(--space-s4)" }}>They receive</Text>
              <Text as="div" size="md" tone="success" style={{ color: css.mint }}>✓ {docs} wealth documents (deeds, policies, statements)</Text>
              <Text as="div" size="md" tone="success" style={{ color: css.mint }}>✓ Access instructions per holding</Text>
              <Text as="div" size="md" tone="muted" style={{ color: css.muted, marginTop: "var(--space-s4)" }}>✗ Health records · ✗ personal notes · ✗ anything outside Wealth</Text>
            </div>
            <Text as="label" size="md" tone="muted" style={{ display: "flex", alignItems: "flex-start", gap: 9, marginTop: "var(--space-s12)", color: css.muted, cursor: "pointer" }}>
              <Checkbox type="checkbox" checked={ack} onChange={(event) => setAck(event.target.checked)} style={{ marginTop: 2 }} />
              I understand this shares my financial documents with the selected people now, and that I can cancel and revoke access at any time.
            </Text>
            <Button variant="primary" type="button" disabled={!canSend} onClick={release} style={{ marginTop: "var(--space-s16)" }}><Siren aria-hidden="true" focusable="false" size={15} /> {busy ? "Releasing..." : `Release handoff to ${chosen.size} ${chosen.size === 1 ? "person" : "people"}`}</Button>
          </>
        )}
      </ModalPanel>
    </ModalBackdrop>
  );
}

function Head({ onClose }: { onClose: () => void }) {
  return <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-s4)" }}><Text as="b" size="lg" weight="semibold" style={{ color: css.heading, display: "inline-flex", alignItems: "center", gap: 9 }}><Siren aria-hidden="true" focusable="false" size="var(--icon-regular)" color={css.coral} /> SOS handoff</Text><Button size="sm" iconOnly variant="tertiary" type="button" aria-label="Close handoff" onClick={onClose} ><X aria-hidden="true" focusable="false" size="var(--icon-small)" /></Button></div>;
}

function SectionTitle({ children, spaced }: { children: string; spaced?: boolean }) {
  return <Text as="div" size="sm" weight="semibold" tone="muted" style={{ letterSpacing: 0.5, textTransform: "uppercase", color: css.muted, fontVariantNumeric: "tabular-nums", margin: spaced ? "16px 0 6px" : "0 0 6px" }}>{children}</Text>;
}

function RecipientRow({ recipient, checked, onToggle }: { recipient: WealthHandoffRecipient; checked: boolean; onToggle: () => void }) {
  const tone = recipient.type === "family" ? css.mint : css.info;
  return <Text as="label" size="md" className="lp-wealth-sos-recipient" style={{ display: "flex", alignItems: "center", gap: 11, padding: "9px 0", borderTop: `1px solid ${css.border}`, cursor: recipient.canReceiveHandoff ? "pointer" : "not-allowed", opacity: recipient.canReceiveHandoff ? 1 : 0.58 }}><Checkbox type="checkbox" disabled={!recipient.canReceiveHandoff} checked={checked} onChange={onToggle} /><span style={{ display: "grid", placeItems: "center", width: 30, height: 30, borderRadius: "var(--radius-compact)", background: `color-mix(in srgb, ${tone} 18%, transparent)`, color: tone, fontWeight: "var(--weight-bold)", fontSize: "var(--text-md)" }}>{recipient.name[0]}</span><span className="lp-wealth-sos-person" style={{ flex: 1, fontSize: "var(--text-md)", color: css.text }}>{recipient.name}<span style={{ color: css.muted }}> · {recipient.relationship} · {recipient.accessTypeLabel}</span><small style={{ display: "block", color: css.muted, marginTop: 2 }}>{recipient.email}{recipient.canReceiveHandoff ? "" : " · not enabled for SOS handoff"}</small></span><span style={{ border: `1px solid color-mix(in srgb, ${tone} 38%, transparent)`, borderRadius: "var(--radius-pill)", padding: "var(--space-s4) var(--space-s8)", color: tone, fontSize: "var(--text-sm)", fontWeight: "var(--weight-bold)" }}>{recipient.type}</span></Text>;
}

function EmptyTrust() {
  return <div><Text as="p" size="md" tone="muted" style={{ color: css.muted, margin: "0 0 var(--space-s12)" }}>Nobody can step in yet. Give someone Emergency or Wealth download access and they will appear here.</Text><Button variant="secondary" type="button" ><ShieldCheck aria-hidden="true" focusable="false" size={15} /> Manage trusted people</Button></div>;
}

function Done({ result }: { result: Awaited<ReturnType<typeof api.wealth.sendHandoff>> }) {
  const sent = result.results.filter((item) => item.sent).length;
  const failed = result.results.length - sent;
  return <div   className="lp-sos-progress done"><CheckCircle2 aria-hidden="true" focusable="false" size={28} /><Text as="b" size="md" weight="semibold">SOS handoff released</Text><Text size="md">{sent} sent, {failed} failed.</Text>{result.results.map((item) => <Text as="p" size="sm" key={`${item.handoffType}-${item.email}`}>{item.email}: {item.sent ? "sent" : item.reason ?? "failed"}</Text>)}</div>;
}
