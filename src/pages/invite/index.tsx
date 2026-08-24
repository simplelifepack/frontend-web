import { useEffect, useState } from "react";
import { Check, ShieldCheck, X } from "lucide-react";
import { useParams } from "react-router-dom";

import Card from "@/components/Card";
import { api, type TrustInvitation } from "@/lib/api";
import { btnGhost, btnGold, T } from "@/constants/theme";

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
    if (!window.confirm("Reject this ReadiNes invitation?")) return;
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
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <ShieldCheck color={T.gold} size={20} />
        <h1 style={{ color: T.white, fontSize: 24, margin: 0 }}>ReadiNes Invitation</h1>
      </div>

      {done ? <p style={{ color: T.mint, margin: 0 }}>{done}</p> : null}
      {error ? <p role="alert" style={{ color: T.coral, margin: done ? "12px 0 0" : "0 0 14px" }}>{error}</p> : null}

      {invitation ? (
        <>
          <p style={{ color: T.text, fontSize: 15, lineHeight: 1.6, margin: "0 0 16px" }}>
            {invitation.ownerName} invited you to join their ReadiNes.
          </p>
          <div style={{ display: "grid", gap: 10, marginBottom: 18 }}>
            <Info label="Invited person" value={invitation.memberName} />
            <Info label="Relationship" value={invitation.relationLabel} />
            <Info label="Access" value={invitation.accessType.name} />
            <Info label="Expires" value={new Date(invitation.expiresAt).toLocaleString()} />
          </div>

          {accepting ? (
            <label style={{ display: "block", color: T.muted, fontSize: 12, fontWeight: 800, textTransform: "uppercase" }}>
              Enter the 6-digit PIN provided by {invitation.ownerName}
              <input
                inputMode="numeric"
                maxLength={6}
                value={pin}
                onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 6))}
                style={{ width: "100%", marginTop: 7, background: T.raised, border: `1px solid ${T.border}`, borderRadius: 9, padding: "10px 12px", color: T.text, fontSize: 16 }}
              />
            </label>
          ) : null}

          <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
            <button
              type="button"
              disabled={working || (accepting && pin.length !== 6)}
              onClick={() => accepting ? void accept() : setAccepting(true)}
              style={{ ...btnGold, justifyContent: "center", flex: 1 }}
            >
              <Check size={16} /> Accept
            </button>
            <button type="button" disabled={working} onClick={() => void reject()} style={{ ...btnGhost, color: T.coral, borderColor: `${T.coral}55`, justifyContent: "center", flex: 1 }}>
              <X size={16} /> Reject
            </button>
          </div>
        </>
      ) : null}
    </Card>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: T.raised, border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px 12px" }}>
      <div style={{ color: T.muted, fontSize: 11, fontWeight: 800, textTransform: "uppercase" }}>{label}</div>
      <div style={{ color: T.white, fontSize: 14, fontWeight: 700, marginTop: 4 }}>{value}</div>
    </div>
  );
}
