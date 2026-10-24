import { useEffect, useState } from "react";
import { Button, Field, Heading, Input, ModalActions, ModalBackdrop, ModalContent, ModalForm, ModalHeader, ModalPanel, Stack, Text } from "@/design-system";
import { solveChallenge, waitlistApi } from "@/lib/waitlist-api";

export default function WaitlistModal({ onClose, unsubscribeToken }: { onClose: () => void; unsubscribeToken?: string }) {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [proof, setProof] = useState<{ challenge: string; solution: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (unsubscribeToken) return;
    const controller = new AbortController();
    void waitlistApi.challenge(controller.signal).then(async challenge => {
      const solution = await solveChallenge(challenge, controller.signal);
      if (!controller.signal.aborted) setProof({ challenge: challenge.token, solution });
    }).catch(() => { if (!controller.signal.aborted) setError("Could not prepare registration. Please try again."); });
    return () => controller.abort();
  }, [attempt, unsubscribeToken]);
  return <ModalBackdrop onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <ModalPanel size="compact" onDismiss={onClose} aria-labelledby="waitlist-title">
      <ModalContent>
        <Stack $gap="s24">
          <ModalHeader><Heading id="waitlist-title" level={2} size="md">{unsubscribeToken ? "Unsubscribe from early access" : "Register for Early Access"}</Heading></ModalHeader>
          {success ? <Text role="status">{success}</Text> : <ModalForm as="form" onSubmit={async event => {
            event.preventDefault();
            if (busy || (!unsubscribeToken && !proof)) return;
            if (!unsubscribeToken && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError("Enter a valid email address."); return; }
            setBusy(true); setError("");
            try {
              const result = unsubscribeToken ? await waitlistApi.unsubscribe(unsubscribeToken) : await waitlistApi.register({ email, website, ...proof! });
              setSuccess(result.message);
            } catch (failure) {
              setError(failure instanceof Error ? failure.message : "Please try again later.");
              setProof(null); setAttempt(value => value + 1);
            } finally { setBusy(false); }
          }}>
            {unsubscribeToken ? <Text>Confirm to stop receiving early access emails.</Text> : <>
              <Field label="Email address"><Input type="email" autoComplete="email" required maxLength={254} value={email} onChange={event => setEmail(event.target.value)} /></Field>
              <input hidden tabIndex={-1} aria-hidden="true" autoComplete="off" name="website" value={website} onChange={event => setWebsite(event.target.value)} />
              <Text size="sm" tone="muted">We’ll email you about early access. You can unsubscribe at any time.</Text>
            </>}
            {error && <Text role="alert" tone="danger">{error}</Text>}
            <ModalActions>
              <Button type="submit" disabled={busy || (!unsubscribeToken && !proof)}>{busy ? "Please wait…" : unsubscribeToken ? "Unsubscribe" : "Register for Early Access"}</Button>
              {!unsubscribeToken && !proof && error && <Button type="button" variant="secondary" onClick={() => { setError(""); setAttempt(value => value + 1); }}>Try again</Button>}
            </ModalActions>
          </ModalForm>}
          <Button type="button" variant="tertiary" onClick={onClose}>Close</Button>
        </Stack>
      </ModalContent>
    </ModalPanel>
  </ModalBackdrop>;
}
