import { type TrustMemberPayload, type TrustPermission } from "@/lib/api";


export const relations = [
  "SPOUSE",
  "PARENT",
  "CHILD",
  "SIBLING",
  "GUARDIAN",
  "RELATIVE",
  "FRIEND",
  "OTHER",
] as const;

export const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"] as const;

export const modules: TrustPermission["module"][] = ["DOCUMENTS", "HEALTH", "WEALTH"];

export const accessTypes: TrustMemberPayload["accessTypeCode"][] = [
  "VIEW_ONLY",
  "FAMILY_MEMBER",
  "EMERGENCY_ACCESS",
];

export const accessLabels = {
  VIEW_ONLY: "View only",
  FAMILY_MEMBER: "Full member",
  EMERGENCY_ACCESS: "Emergency access",
};

export const accessCopy = {
  VIEW_ONLY:
    "Can view explicitly shared content. No editing or member management.",
  FAMILY_MEMBER: "Ongoing access to owner-approved content.",
  EMERGENCY_ACCESS: "Restricted access designed for urgent situations.",
};


export const emptyDraft: TrustMemberPayload = {
  name: "",
  email: "",
  relation: "PARENT",
  dateOfBirth: "",
  bloodGroup: "O+",
  accessTypeCode: "VIEW_ONLY",
  pin: "",
  permissions: [{ module: "DOCUMENTS", canView: true, canDownload: false }],
};
