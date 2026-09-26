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
    <div className="lp-modalwrap" onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 72, background: "var(--lpv-scrim)", display: "flex", alignItems: "center", justifyContent: "center", padding: 18 }}>
      <div className="lp-modalbox lp-wealth-ref-modal" onClick={(event) => event.stopPropagation()} style={{ background: css.panel, border: `1px solid color-mix(in srgb, var(--lp-coral) 45%, transparent)`, borderRadius: 16, width: "min(480px,100%)", maxHeight: "92vh", overflowY: "auto", padding: 22 }} role="dialog" aria-modal="true">
        <div className="lp-sheet-grab lp-grabonly" />
        <Head onClose={onClose} />
        {error ? <div className="lp-sos-error">{error}</div> : null}
        {!summary ? <div className="lp-sos-loading"><Loader2 size={18} /> Loading emergency handoff</div> : done ? <Done result={done} /> : (
          <>
            <p style={{ fontSize: 13, color: css.muted, margin: "0 0 14px", lineHeight: 1.55 }}>For a real emergency. Releases the estate summary, {docs} wealth documents, and every access instruction to the people below, so nothing is locked away when it matters.</p>
            <SectionTitle>Who steps in</SectionTitle>
            {recipients.length ? recipients.map((recipient) => <RecipientRow key={recipient.id} recipient={recipient} checked={chosen.has(recipient.id)} onToggle={() => toggle(recipient.id)} />) : <EmptyTrust />}
            <div style={{ marginTop: 14, borderRadius: 11, border: `1px solid ${css.border}`, background: css.raised, padding: "11px 13px", fontSize: 12.5, lineHeight: 1.7 }}>
              <div style={{ color: css.text, fontWeight: 700, marginBottom: 4 }}>They receive</div>
              <div style={{ color: css.mint }}>✓ Family summary with first steps</div>
              <div style={{ color: css.mint }}>✓ {docs} wealth documents (deeds, policies, statements)</div>
              <div style={{ color: css.mint }}>✓ Access instructions per holding</div>
              <div style={{ color: css.muted, marginTop: 4 }}>✗ Health records · ✗ personal notes · ✗ anything outside Wealth</div>
            </div>
            <label style={{ display: "flex", alignItems: "flex-start", gap: 9, marginTop: 12, fontSize: 12.5, color: css.muted, cursor: "pointer", lineHeight: 1.5 }}>
              <input type="checkbox" checked={ack} onChange={(event) => setAck(event.target.checked)} style={{ accentColor: css.coral, marginTop: 2 }} />
              I understand this shares my financial documents with the selected people now, and that I can cancel and revoke access at any time.
            </label>
            <button disabled={!canSend} onClick={release} style={{ width: "100%", justifyContent: "center", marginTop: 16, minHeight: 44, border: "none", borderRadius: 10, background: css.coral, color: "var(--lp-action-text)", fontWeight: 800, opacity: canSend ? 1 : 0.4 }}><Siren size={15} /> {busy ? "Releasing..." : `Release handoff to ${chosen.size} ${chosen.size === 1 ? "person" : "people"}`}</button>
          </>
        )}
      </div>
    </div>
  );
}

function Head({ onClose }: { onClose: () => void }) {
  return <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}><b style={{ color: css.heading, fontSize: 18, display: "inline-flex", alignItems: "center", gap: 9 }}><Siren size={18} color={css.coral} /> SOS handoff</b><button onClick={onClose} style={{ background: css.raised, border: `1px solid ${css.border}`, borderRadius: 10, color: css.text, padding: 8 }}><X size={16} /></button></div>;
}

function SectionTitle({ children, spaced }: { children: string; spaced?: boolean }) {
  return <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: css.muted, fontVariantNumeric: "tabular-nums", margin: spaced ? "16px 0 6px" : "0 0 6px" }}>{children}</div>;
}

function RecipientRow({ recipient, checked, onToggle }: { recipient: WealthHandoffRecipient; checked: boolean; onToggle: () => void }) {
  const tone = recipient.type === "family" ? css.mint : css.info;
  return <label className="lp-wealth-sos-recipient" style={{ display: "flex", alignItems: "center", gap: 11, padding: "9px 0", borderTop: `1px solid ${css.border}`, cursor: recipient.canReceiveHandoff ? "pointer" : "not-allowed", opacity: recipient.canReceiveHandoff ? 1 : 0.58 }}><input type="checkbox" disabled={!recipient.canReceiveHandoff} checked={checked} onChange={onToggle} style={{ accentColor: css.coral }} /><span style={{ display: "grid", placeItems: "center", width: 30, height: 30, borderRadius: 8, background: `color-mix(in srgb, ${tone} 18%, transparent)`, color: tone, fontWeight: 800, fontSize: 13 }}>{recipient.name[0]}</span><span className="lp-wealth-sos-person" style={{ flex: 1, fontSize: 13.5, color: css.text }}>{recipient.name}<span style={{ color: css.muted }}> · {recipient.relationship} · {recipient.accessTypeLabel}</span><small style={{ display: "block", color: css.muted, marginTop: 2 }}>{recipient.email}{recipient.canReceiveHandoff ? "" : " · not enabled for SOS handoff"}</small></span><span style={{ border: `1px solid color-mix(in srgb, ${tone} 38%, transparent)`, borderRadius: 999, padding: "4px 8px", color: tone, fontSize: 11, fontWeight: 800 }}>{recipient.type}</span></label>;
}

function EmptyTrust() {
  return <div><p style={{ fontSize: 13, color: css.muted, lineHeight: 1.6, margin: "0 0 12px" }}>Nobody can step in yet. Give someone Emergency or Wealth download access and they will appear here.</p><button type="button" style={{ display: "inline-flex", alignItems: "center", gap: 8, minHeight: 44, borderRadius: 10, border: `1px solid ${css.border}`, background: css.raised, color: css.text, padding: "10px 14px", fontWeight: 700 }}><ShieldCheck size={15} /> Manage trusted people</button></div>;
}

function Done({ result }: { result: Awaited<ReturnType<typeof api.wealth.sendHandoff>> }) {
  const sent = result.results.filter((item) => item.sent).length;
  const failed = result.results.length - sent;
  return <div className="lp-sos-progress done"><CheckCircle2 size={28} /><b>SOS handoff released</b><span>{sent} sent, {failed} failed.</span>{result.results.map((item) => <p key={`${item.handoffType}-${item.email}`}>{item.email}: {item.sent ? "sent" : item.reason ?? "failed"}</p>)}</div>;
}
