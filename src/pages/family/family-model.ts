import type {
  TrustMember,
  TrustMemberPayload,
  TrustPermission,
} from "@/lib/api";
export type AccessCode = TrustMemberPayload["accessTypeCode"];

export type Draft = {
  name: string;
  email: string;
  relationKey: string;
  accessTypeCode: AccessCode;
  dateOfBirth: string;
  bloodGroup: TrustMemberPayload["bloodGroup"];
};

export const accessLabels: Record<AccessCode, string> = {
  FAMILY_MEMBER: "Full member",
  EMERGENCY_ACCESS: "Emergency access",
  VIEW_ONLY: "View only",
};

export const avatarColors = ["purple", "teal", "pink", "readiness"] as const;

export const bloodGroups = [
  "A+",
  "A-",
  "B+",
  "B-",
  "O+",
  "O-",
  "AB+",
  "AB-",
] as const;

export const relationOptions = [
  ["SPOUSE", "Spouse"],
  ["PARENT", "Father"],
  ["PARENT", "Mother"],
  ["CHILD", "Son"],
  ["CHILD", "Daughter"],
  ["SIBLING", "Sibling"],
  ["PARENT", "Parent"],
  ["OTHER", "Other"],
] as const;

export function permissions(accessTypeCode: AccessCode): TrustPermission[] {
  const full = accessTypeCode === "FAMILY_MEMBER";
  const emergency = accessTypeCode === "EMERGENCY_ACCESS";
  return [
    { module: "DOCUMENTS", canView: true, canDownload: full },
    { module: "HEALTH", canView: full, canDownload: false },
    {
      module: "WEALTH",
      canView: full || emergency,
      canDownload: full || emergency,
    },
  ];
}

export function draftFromMember(member?: TrustMember): Draft {
  return {
    name: member?.name ?? "",
    email: member?.email ?? "",
    relationKey: `${member?.relation ?? "SPOUSE"}:${member?.customRelation ?? member?.relationLabel ?? "Spouse"}`,
    accessTypeCode: (member?.accessType.id ?? "FAMILY_MEMBER") as AccessCode,
    dateOfBirth: member?.dateOfBirth ?? "",
    bloodGroup: (member?.bloodGroup ??
      "O+") as TrustMemberPayload["bloodGroup"],
  };
}
