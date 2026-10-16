import { Heading, Text, Input, Button, Card } from "@/design-system";

import { useEffect, useState } from "react";
import { Check, ShieldCheck, X } from "lucide-react";
import { useParams } from "react-router-dom";

import { api, type TrustInvitation } from "@/lib/api";
import { T } from "@/constants/theme";

export default function InvitePage() {
  const { token = "" } = useParams();
  const [invitation, setInvitation] = useState<TrustInvitation | null>(null);
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    let mounted = true;
    api.trust.getInvitation(token)
      .then((result) => {
        if (mounted) setInvitation(result);
      })
      .catch(() => {
        if (mounted) setError("Invitation expired or invalid.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [token]);

  const accept = async () => {
    if (!/^\d{6}$/.test(pin)) {
      setError("Enter your 6-digit PIN.");
      return;
    }
    setWorking(true);
    setError(null);
    try {
      await api.trust.acceptInvitation(token, pin);
      setDone("Invitation accepted. Your access is active.");
      setInvitation(null);
    } catch (acceptError) {
      setError(acceptError instanceof Error ? acceptError.message : "Invitation could not be verified.");
    } finally {
      setWorking(false);
    }
  };

  const reject = async () => {
    if (!window.confirm("Reject this Readiness invitation?")) return;
    setWorking(true);
    setError(null);
    try {
      await api.trust.rejectInvitation(token);
      setDone("Invitation rejected.");
      setInvitation(null);
    } catch (rejectError) {
      setError(rejectError instanceof Error ? rejectError.message : "Invitation expired or invalid.");
    } finally {
      setWorking(false);
    }
  };

  if (loading) return <Card style={{ maxWidth: 520, margin: "72px auto" }}>Loading invitation...</Card>;

  return (
    <Card style={{ maxWidth: 520, margin: "72px auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-s10)", marginBottom: "var(--space-s14)" }}>
        <ShieldCheck aria-hidden="true" focusable="false" color={T.action} size="var(--icon-medium)" />
        <Heading level={1} size="md" style={{ color: T.white, margin: 0 }}>Readiness Invitation</Heading>
      </div>

      {done ? <Text as="p" size="md" tone="success" style={{ color: T.mint, margin: 0 }}>{done}</Text> : null}
      {error ? <Text as="p" size="md" tone="danger" role="alert" style={{ color: T.coral, margin: done ? "12px 0 0" : "0 0 14px" }}>{error}</Text> : null}

      {invitation ? (
        <>
          <Text as="p" size="md" style={{ color: T.text, margin: "0 0 var(--space-s16)" }}>
            {invitation.ownerName} invited you to join their Readiness.
          </Text>
          <div style={{ display: "grid", gap: "var(--space-s10)", marginBottom: "var(--space-s18)" }}>
            <Info label="Invited person" value={invitation.memberName} />
            <Info label="Relationship" value={invitation.relationLabel} />
            <Info label="Access" value={invitation.accessType.name} />
            <Info label="Expires" value={new Date(invitation.expiresAt).toLocaleString()} />
          </div>

          {accepting ? (
            <Text as="label" size="sm" weight="semibold" tone="muted" style={{ display: "block", color: T.muted, textTransform: "uppercase" }}>
              Enter the 6-digit PIN provided by {invitation.ownerName}
              <Input
                inputMode="numeric"
                maxLength={6}
                value={pin}
                onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 6))}
                style={{ width: "100%", marginTop: 7 }}
              />
            </Text>
          ) : null}

          <div style={{ display: "flex", gap: "var(--space-s10)", marginTop: "var(--space-s18)" }}>
            <Button variant="primary"
              type="button"
              disabled={working || (accepting && pin.length !== 6)}
              onClick={() => accepting ? void accept() : setAccepting(true)}
              style={{ flex: 1 }}
            >
              <Check aria-hidden="true" focusable="false" size="var(--icon-small)" /> Accept
            </Button>
            <Button tone="danger" variant="secondary" type="button" disabled={working} onClick={() => void reject()} style={{ flex: 1 }}>
              <X aria-hidden="true" focusable="false" size="var(--icon-small)" /> Reject
            </Button>
          </div>
        </>
      ) : null}
    </Card>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: T.raised, border: `1px solid ${T.border}`, borderRadius: "var(--radius-compact)", padding: "var(--space-s10) var(--space-s12)" }}>
      <Text as="div" size="sm" weight="semibold" tone="muted" style={{ color: T.muted, textTransform: "uppercase" }}>{label}</Text>
      <Text as="div" size="md" weight="semibold" style={{ color: T.white, marginTop: "var(--space-s4)" }}>{value}</Text>
    </div>
  );
}
