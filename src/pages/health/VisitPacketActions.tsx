import { useEffect, useState, type FormEvent } from "react";
import { Button, Heading, Input, Row, Stack, Text } from "@/design-system";
import { api } from "@/lib/api";
import type { HealthVisitPacket } from "@/lib/api.types";
import { formatDate } from "./healthUtils";

function PacketFields({ initial, saving, onSubmit, onClose }: {
  initial: { doctor?: string | null; clinic?: string | null; visitDate?: string | null };
  saving: boolean;
  onSubmit: (details: { doctor: string | null; clinic: string | null; visitDate: string | null }) => Promise<void>;
  onClose: () => void;
}) {
  const [doctor, setDoctor] = useState(initial.doctor ?? "");
  const [clinic, setClinic] = useState(initial.clinic ?? "");
  const [date, setDate] = useState(initial.visitDate ?? "");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!saving) void onSubmit({ doctor: doctor.trim() || null, clinic: clinic.trim() || null, visitDate: date || null });
  }
  return <form onSubmit={submit} className="lp-health-form">
    <Text as="label" size="sm" weight="medium">Doctor (optional)<Input value={doctor} onChange={event => setDoctor(event.target.value)} /></Text>
    <Text as="label" size="sm" weight="medium">Clinic (optional)<Input value={clinic} onChange={event => setClinic(event.target.value)} /></Text>
    <Text as="label" size="sm" weight="medium">Visit date (optional)<Input type="date" value={date} onChange={event => setDate(event.target.value)} /></Text>
    <Row $gap="s8">
      <Button type="button" variant="tertiary" disabled={saving} onClick={onClose}>Cancel</Button>
      <Button type="submit" variant="primary" loading={saving}>{"id" in initial ? "Save changes" : "Save packet"}</Button>
    </Row>
  </form>;
}

export default function VisitPacketActions({ memberId, selectedIds, doctor, clinic, canSave }: {
  memberId: string;
  selectedIds: string[];
  doctor?: string;
  clinic?: string;
  canSave: boolean;
}) {
  const [packets, setPackets] = useState<HealthVisitPacket[] | null>(null);
  const [showPackets, setShowPackets] = useState(false);
  const [editing, setEditing] = useState<HealthVisitPacket | "new" | null>(null);
  const [saving, setSaving] = useState(false);
  const [busyDownload, setBusyDownload] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    if (!showPackets || packets) return;
    let active = true;
    void api.health.visitPackets(memberId).then(items => {
      if (active) setPackets(items);
    }).catch(reason => {
      if (active) {
        setShowPackets(false);
        setError(reason instanceof Error ? reason.message : "Saved packets could not be loaded.");
      }
    });
    return () => { active = false; };
  }, [memberId, packets, showPackets]);

  async function save(details: { doctor: string | null; clinic: string | null; visitDate: string | null }) {
    if (!editing) return;
    setSaving(true);
    setError("");
    try {
      const packet = editing === "new"
        ? await api.health.saveVisitPacket({ memberId, recordIds: selectedIds, ...details })
        : await api.health.updateVisitPacket(editing.id, details);
      setPackets(previous => previous ? [packet, ...previous.filter(item => item.id !== packet.id)] : null);
      setShowPackets(true);
      setEditing(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Visit packet could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  async function download(packet: HealthVisitPacket) {
    setError("");
    setBusyDownload(packet.id);
    try {
      const { blob, fileName } = await api.documents.download(packet.fileDocumentId);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = fileName || "Visit-packet.zip";
      anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Visit packet could not be downloaded.");
    } finally {
      setBusyDownload("");
    }
  }

  return <Stack $gap="s12">
    <Row $gap="s8">
      {canSave && <Button type="button" variant="secondary" disabled={!selectedIds.length || saving} onClick={() => { setError(""); setEditing("new"); }}>Save in Health</Button>}
      <Button type="button" variant="tertiary" aria-expanded={showPackets} onClick={() => { setError(""); setShowPackets(value => !value); }}>Saved visit packets</Button>
    </Row>
    {editing && <PacketFields key={editing === "new" ? editing : editing.id}
      initial={editing === "new" ? { doctor, clinic } : editing} saving={saving} onSubmit={save} onClose={() => setEditing(null)} />}
    {showPackets && <Stack $gap="s8">
      <Heading level={3} size="sm">Saved visit packets</Heading>
      {!packets ? <Text size="sm" role="status">Loading saved packets…</Text> :
        packets.length === 0 ? <Text size="sm">No saved visit packets.</Text> :
        packets.map(packet => <Row key={packet.id} $justify="space-between">
          <Stack $gap="s4">
            <Text weight="semibold">{[packet.doctor, packet.clinic].filter(Boolean).join(" · ") || "Visit packet"}</Text>
            <Text size="sm">{packet.visitDate ? formatDate(packet.visitDate) + " · " : ""}{packet.recordIds.length} records</Text>
          </Stack>
          <Row $gap="s8">
            <Button variant="tertiary" size="sm" onClick={() => { setError(""); setEditing(packet); }}>Edit</Button>
            <Button variant="tertiary" size="sm" loading={busyDownload === packet.id} disabled={Boolean(busyDownload)} onClick={() => void download(packet)}>Download</Button>
          </Row>
        </Row>)}
    </Stack>}
    {error && <Text role="alert" tone="danger" size="sm">{error}</Text>}
  </Stack>;
}
