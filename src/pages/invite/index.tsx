import {
  Heading,
  Text,
  Input,
  Button,
  Card,
  Stack,
  Row,
  Field,
  ModalDetailRow,
} from "@/design-system";

import { useEffect, useState } from "react";
import { Check, ShieldCheck, X } from "lucide-react";
import { useParams } from "react-router-dom";

import { api, type TrustInvitation } from "@/lib/api";

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
    api.trust
      .getInvitation(token)
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
      setError(
        acceptError instanceof Error
          ? acceptError.message
          : "Invitation could not be verified.",
      );
    } finally {
      setWorking(false);
    }
  };

  const reject = async () => {
    if (!window.confirm("Reject this Readines invitation?")) return;
    setWorking(true);
    setError(null);
    try {
      await api.trust.rejectInvitation(token);
      setDone("Invitation rejected.");
      setInvitation(null);
    } catch (rejectError) {
      setError(
        rejectError instanceof Error
          ? rejectError.message
          : "Invitation expired or invalid.",
      );
    } finally {
      setWorking(false);
    }
  };

  if (loading)
    return (
      <Card>
        <Text role="status">Loading invitation...</Text>
      </Card>
    );
  return (
    <Card>
      <Stack $gap="s16">
        <Row>
          <ShieldCheck aria-hidden="true" />
          <Heading level={1} size="md">
            Readines Invitation
          </Heading>
        </Row>
        {done ? (
          <Text tone="success" role="status">
            {done}
          </Text>
        ) : null}
        {error ? (
          <Text tone="danger" role="alert">
            {error}
          </Text>
        ) : null}
        {invitation ? (
          <>
            <Text>
              {invitation.ownerName} invited you to join their Readines.
            </Text>
            <Stack $gap="s8">
              <Info label="Invited person" value={invitation.memberName} />
              <Info label="Relationship" value={invitation.relationLabel} />
              <Info label="Access" value={invitation.accessType.name} />
              <Info
                label="Expires"
                value={new Date(invitation.expiresAt).toLocaleString()}
              />
            </Stack>
            {accepting ? (
              <Field
                label={`Enter the 6-digit PIN provided by ${invitation.ownerName}`}
              >
                <Input
                  inputMode="numeric"
                  maxLength={6}
                  value={pin}
                  onChange={(event) =>
                    setPin(event.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                />
              </Field>
            ) : null}
            <Row>
              <Button
                variant="primary"
                type="button"
                disabled={working || (accepting && pin.length !== 6)}
                onClick={() => (accepting ? void accept() : setAccepting(true))}
              >
                <Check aria-hidden="true" />
                Accept
              </Button>
              <Button
                tone="danger"
                variant="secondary"
                type="button"
                disabled={working}
                onClick={() => void reject()}
              >
                <X aria-hidden="true" />
                Reject
              </Button>
            </Row>
          </>
        ) : null}
      </Stack>
    </Card>
  );
}
function Info({ label, value }: { label: string; value: string }) {
  return (
    <ModalDetailRow>
      <Text size="sm" tone="muted">
        {label}
      </Text>
      <Text weight="semibold">{value}</Text>
    </ModalDetailRow>
  );
}
