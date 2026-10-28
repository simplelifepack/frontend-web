import { useEffect, useState } from "react";
import { api, type TrustCenterResponse, type TrustMember, type TrustPermission } from "@/lib/api";
import { modules } from "./index.relations";


export function defaultPermissions(
  enabledModules: TrustPermission["module"][],
  permissions: TrustPermission[],
) {
  return enabledModules.map(
    (module) =>
      permissions.find((permission) => permission.module === module) ?? {
        module,
        canView: module === "DOCUMENTS",
        canDownload: false,
      },
  );
}


export function isTrustMember(value: unknown): value is TrustMember {
  return Boolean(
    value &&
    typeof value === "object" &&
    "id" in value &&
    "accessType" in value,
  );
}


export function invitationNotice(member: TrustMember) {
  const delivery = member.invitationDelivery;
  if (!delivery) return null;
  if (delivery.sent) return `Invitation email sent to ${member.email}.`;
  if (delivery.reason === "email_disabled")
    return "Invitation saved, but email is disabled because SMTP configuration is incomplete.";
  if (delivery.reason === "invalid_recipient")
    return "Invitation saved, but the email address is not valid.";
  return `Invitation saved, but email delivery failed${delivery.errorCode ? ` (${delivery.errorCode})` : ""}.`;
}


export function labelize(value: string) {
  return value
    .toLowerCase()
    .replace(
      /(^|_)([a-z])/g,
      (_match, prefix: string, letter: string) =>
        `${prefix ? " " : ""}${letter.toUpperCase()}`,
    );
}


export function useTrustPageLogic() {

  const [data, setData] = useState<TrustCenterResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<TrustMember | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [leavingId, setLeavingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await api.trust.get());
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load Trust Center.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const enabledModules = modules;

  const refreshAfter = async (action: Promise<unknown>) => {
    const result = await action;
    if (isTrustMember(result)) setNotice(invitationNotice(result));
    await load();
  };

  const removeMember = async (member: TrustMember) => {
    if (!window.confirm(`Remove ${member.name} from your family list?`)) return;
    setRemovingId(member.id);
    setNotice(null);
    try {
      await api.trust.revokeMember(member.id);
      await load();
      setNotice(`${member.name} was removed from your family list.`);
    } catch (removeError) {
      setError(
        removeError instanceof Error
          ? removeError.message
          : "Unable to remove member.",
      );
    } finally {
      setRemovingId(null);
    }
  };

  const resetPin = async (member: TrustMember) => {
    const pin = window.prompt(
      `Set a new 6-digit PIN for ${member.name}. Share it separately.`,
    );
    if (pin === null) return;
    if (!/^\d{6}$/.test(pin.trim())) {
      setNotice("PIN must be exactly 6 digits.");
      return;
    }
    await refreshAfter(api.trust.resetInvitationPin(member.id, pin.trim()));
    setNotice(`PIN reset for ${member.name}. Share it separately from email.`);
  };

  const leaveConnection = async (connectionId: string, ownerName: string) => {
    if (
      !window.confirm(
        `Leave ${ownerName}'s Readines? Your access will be removed immediately.`,
      )
    )
      return;
    setLeavingId(connectionId);
    setNotice(null);
    try {
      await api.trust.leaveConnection(connectionId);
      await load();
      setNotice(`You left ${ownerName}'s Readines.`);
    } catch (leaveError) {
      setError(
        leaveError instanceof Error
          ? leaveError.message
          : "Unable to leave Readines.",
      );
    } finally {
      setLeavingId(null);
    }
  };
return { data, setData, loading, setLoading, error, setError, notice, setNotice, addOpen, setAddOpen, editing, setEditing, removingId, setRemovingId, leavingId, setLeavingId, load, enabledModules, refreshAfter, removeMember, resetPin, leaveConnection };
}
