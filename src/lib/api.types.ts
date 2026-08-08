/* eslint-disable max-lines */
export type AuthUser = {
  id?: string;
  name: string;
  email: string;
};

export type AuthResponse = {
  token: string;
  accessToken?: string;
  refreshToken: string;
  user: AuthUser;
};

export type ForgotPasswordResponse = {
  message: string;
};

export type ResetPasswordResponse = {
  message: string;
};

export type DocumentRecord = {
  id: string;
  title?: string | null;
  displayName?: string | null;
  ownerProfileId?: string | null;
  uniqueIdentifier?: string | null;
  extractedKeyFields?: unknown;
  rawText?: string | null;
  originalName: string;
  storedName?: string;
  mimeType: string;
  size: number;
  path?: string;
  documentType: string;
  normalizedType?: string | null;
  category: string;
  analysisSource: string;
  confidence: number;
  classificationStatus: "pending" | "detected" | "verified" | "rejected";
  classificationConfidence: number;
  ownershipStatus: "pending" | "verified" | "mismatch" | "unknown";
  readinessEligible: boolean;
  fields: unknown;
  createdAt: string;
  updatedAt: string;
  source: "MANUAL_UPLOAD" | "GMAIL" | "GOOGLE_DRIVE";
  sourceProvider?: string | null;
  driveFileId?: string | null;
  openUrl?: string | null;
  lastAnalyzed?: string | null;
};

export type DriveStatus = {
  connected: boolean;
  account: string | null;
  scanStatus: "idle" | "scanning" | "completed" | "failed";
  lastScannedAt: string | null;
  lastSuccessfulSync: string | null;
  scanning: boolean;
  phase: string | null;
  processed: number;
  total: number;
  indexedCount: number;
  error: string | null;
};

export type DriveScanResult = {
  discovered: number;
  processed: number;
  imported: number;
  skipped: number;
  failed: number;
  indexed: number;
  updated: number;
  unchanged: number;
  ignored: number;
  duplicate: number;
  duplicate_kept: number;
  indexedCount: number;
  lastSuccessfulSync: string;
  message: string;
};

export type Evidence = {
  label: string;
  text: string;
  points: number;
};

export type ReviewField = {
  id?: string;
  key: string;
  label: string;
  value: string;
  confidence?: number;
  source: "template" | "rule" | "generic" | "ocr" | "user";
  editable: boolean;
  important?: boolean;
  pageNumber?: number;
};

export type DocumentFieldValidation = {
  key: string;
  label: string;
  value: string;
  confidence: number;
  required: boolean;
  valid: boolean;
  status: "accepted" | "needs_review" | "missing" | "invalid";
  message?: string;
};

export type DocumentValidationResult = {
  normalizedType: string;
  displayName: string;
  category: string;
  uniqueIdentifierField: string;
  uniqueIdentifier: string | null;
  documentFingerprint: string;
  capabilities: string[];
  validatedFields: Record<string, DocumentFieldValidation>;
  reviewFields: ReviewField[];
  missingRequiredFields: string[];
  invalidFields: string[];
  lowConfidenceFields: string[];
  canSave: boolean;
  requiresUserConfirmation: boolean;
  warnings: Array<{ code: string; message: string }>;
};

export type DocumentAnalysis = {
  analysisSource: "rules" | "manual" | "ai";
  documentType: string;
  category: string;
  confidence: number;
  fields: Record<string, string | number | boolean | string[] | undefined>;
  evidence: Evidence[];
  sourceEvidence: string[];
  reason: string;
};

export type DocumentAIResult = {
  category:
    | "Identity"
    | "Employment"
    | "Finance"
    | "Insurance"
    | "Property"
    | "Medical"
    | "Education"
    | "Travel"
    | "Vehicle"
    | "Legal"
    | "Photo"
    | "Other";
  documentType: string;
  uniqueNumber: string | null;
  nameOnDocument: string | null;
};

export type AnalyzeDocumentResponse = {
  success?: boolean;
  documentType?: string;
  normalizedType?: string;
  confidence?: number;
  suggestedCategory?: string;
  extractedFields?: DocumentAnalysis["fields"];
  reviewFields: ReviewField[];
  validation?: DocumentValidationResult;
  title: string;
  extractedText: string;
  preview: string | null;
  warnings?: Array<{ code: string; message: string }>;
  extraction?: unknown;
  tempFileId: string;
  file: {
    originalName: string;
    mimeType: string;
    size: number;
  };
  analysis: DocumentAIResult;
  warning?: string;
  extractedTextPreview: string | null;
  analysisSource?: "rules" | "manual" | "ai";
};

export type { GmailCandidate, GmailImportResult, GmailStatus } from "./gmail.types";

export type UploadDocumentResponse = AnalyzeDocumentResponse & {
  document?: DocumentRecord;
};

export type SaveDocumentPayload = {
  tempFileId: string;
  originalName: string;
  mimeType: string;
  size: number;
  title: string;
  category: string;
  documentType: string;
  confidence: number;
  fields: Record<string, string | number | boolean | string[] | undefined>;
  reviewFields: ReviewField[];
  rawExtractedText: string;
  warnings?: unknown[];
  extraction?: unknown;
  evidence: Evidence[];
  analysisSource: "rules" | "manual" | "ai";
  duplicateAction?: "fail" | "replace" | "keep_both";
  userConfirmedUnknown?: boolean;
  owner?: "self" | "spouse" | "father" | "mother" | "child" | "seller" | "buyer" | "employer" | "bank" | "hospital" | "government" | "other" | "unknown";
  subType?: string | null;
  expiry?: string | null;
  verified?: boolean;
};

export type PackSummary = {
  id: string;
  slug: string;
  title: string;
  subtitle?: string | null;
  category: string;
  description: string;
  aliases: string[];
  keywords: string[];
  sourceType?: string;
  sourceName?: string | null;
  sourceTitle?: string | null;
  sourceUrl?: string | null;
  lastCheckedAt?: string | null;
  verificationSources?: VerificationSource[];
  lastVerifiedAt?: string | null;
  verificationStatus?: "verified" | "needs_review";
  createdAt?: string;
  createdBy?: string;
  version: number;
  requirements: PackageRequirement[];
};

export type VerificationSource = {
  title: string;
  organization: string;
  url: string;
  type: "government" | "official" | "bank" | "university" | "insurance" | "authority";
  retrievedAt: string;
};

export type PackageListItem = {
  id: string;
  slug: string;
  name: string;
  title: string;
  subtitle: string | null;
  category: string;
  provider: string | null;
  location: string | null;
  description: string;
  shortDescription: string;
  icon: string | null;
  sourceType: string;
  sourceName: string | null;
  sourceTitle: string | null;
  sourceUrl: string | null;
  lastCheckedAt: string | null;
  verificationSources: VerificationSource[];
  lastVerifiedAt: string | null;
  verificationStatus: "verified" | "needs_review";
  createdAt: string;
  requiredDocumentCount: number;
  readyDocumentCount: number;
  source: string;
  generationSource: string;
  version: number;
};

export type PackageListResponse = {
  query: string;
  items: PackageListItem[];
  matches: Array<{
    id: string;
    name: string;
    slug: string;
    matchType: string;
    confidence: number;
    matchedTokens: string[];
    missingTokens: string[];
  }>;
  hasConfidentMatch: boolean;
  canGenerate: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasNextPage: boolean;
  };
};

export type PackageListQuery = {
  category?: string;
  limit?: number;
  location?: string;
  page?: number;
  provider?: string;
  search?: string;
  sort?: "category" | "newest" | "relevance" | "title";
};

export type PackageRequirement = {
  id: string;
  title: string;
  description: string;
  required: boolean;
  group: string;
  documentType: string;
  owner: string;
  metadata?: Record<string, string | number | boolean | null> | null;
  acceptedDocumentTypes: string[];
  alternativeLabels: string[];
  sortOrder: number;
};

export type FamilyMember = {
  id: string;
  name: string;
  relationship?: string;
};

export type PlanCode = "FREEMIUM" | "FAMILY" | "PLUS";

export type PlanEntitlements = {
  plan: { id: string; code: PlanCode; name: string };
  rules: {
    memberLimit: number;
    storageBytes: number;
    unknownPackSearchLimit: number;
    modules: {
      home: boolean;
      packages: boolean;
      documents: boolean;
      health: boolean;
      wealth: boolean;
      trustCenter: boolean;
    };
    emergencyAccess: boolean;
  };
  usage: {
    period: string;
    unknownPackSearches: number;
    storageBytesUsed: number;
    aiSearchesRemaining: number;
    resetAt: string;
  };
};

export type TrustAccessType = {
  id: string;
  code: "VIEW_ONLY" | "FAMILY_MEMBER" | "EMERGENCY_ACCESS" | "OWNER";
  name: string;
  description: string;
  rules?: unknown;
};

export type TrustPermission = {
  module: "DOCUMENTS" | "HEALTH" | "WEALTH";
  canView: boolean;
  canDownload: boolean;
};

export type TrustMember = {
  id: string;
  name: string;
  email: string;
  relation: string;
  customRelation?: string | null;
  relationLabel: string;
  dateOfBirth: string;
  bloodGroup: string;
  accessType: TrustAccessType;
  status: "INVITED" | "ACTIVE" | "REVOKED" | "REJECTED";
  invitationStatus: "PENDING" | "EXPIRED" | "ACCEPTED" | "REJECTED" | "NONE";
  invitedAt: string;
  inviteExpiresAt?: string | null;
  acceptedAt?: string | null;
  rejectedAt?: string | null;
  revokedAt?: string | null;
  permissions: TrustPermission[];
  invitationDelivery?: {
    sent: boolean;
    messageId?: string | null;
    reason?: "email_disabled" | "invalid_recipient" | "delivery_failed";
    errorCode?: string;
  };
};

export type TrustMemberPayload = {
  name: string;
  email: string;
  relation: "SPOUSE" | "PARENT" | "CHILD" | "SIBLING" | "GUARDIAN" | "RELATIVE" | "FRIEND" | "OTHER";
  customRelation?: string;
  dateOfBirth: string;
  bloodGroup: "A+" | "A-" | "B+" | "B-" | "O+" | "O-" | "AB+" | "AB-";
  accessTypeCode: "VIEW_ONLY" | "FAMILY_MEMBER" | "EMERGENCY_ACCESS";
  pin: string;
  permissions: TrustPermission[];
};

export type TrustConnection = {
  id: string;
  owner: { id: string; name: string; email: string };
  relation: string;
  relationLabel: string;
  accessType: TrustAccessType;
  status: "ACTIVE";
  acceptedAt?: string | null;
};

export type TrustInvitation = {
  id: string;
  ownerName: string;
  memberName: string;
  relationLabel: string;
  accessType: TrustAccessType;
  expiresAt: string;
};

export type TrustCenterResponse = {
  role: "OWNER" | "BOTH";
  owner: { id: string; name: string; email: string; accessType: "OWNER"; note: string };
  plan: PlanEntitlements["plan"];
  entitlements: PlanEntitlements;
  memberLimit: number;
  memberCount: number;
  remainingSlots: number;
  members: TrustMember[];
  connections: TrustConnection[];
  accessTypes: TrustAccessType[];
  modules: PlanEntitlements["rules"]["modules"];
};

export type WealthHandoffRecipient = {
  id: string;
  name: string;
  email: string;
  relationship: string;
  verificationStatus: "verified";
  type: "family" | "emergency" | "other";
};

export type WealthRecordType = "ASSET" | "LOAN_TAKEN" | "LOAN_GIVEN" | "INSURANCE" | "PAYMENT_PROOF";

export type WealthRecordPayload = {
  type: WealthRecordType;
  title: string;
  details: Record<string, string | number | boolean | null>;
  notes?: string;
  followUpDate?: string | null;
  followUpNote?: string;
  attachmentDocumentIds: string[];
};

export type WealthRecord = WealthRecordPayload & {
  id: string;
  createdAt: string;
  updatedAt: string;
  attachments: Array<{
    id: string;
    documentId: string;
    originalName: string;
    title?: string | null;
    mimeType: string;
    size: number;
  }>;
  loanBreakdown?: {
    principal: number;
    interest: number;
    payments: number;
    outstanding: number;
    monthsElapsed: number;
    calculationType: string;
  } | null;
};

export type DynamicFormOption = string | { label: string; value: string };

export type DynamicFormCategory = {
  code: string;
  label: string;
  description?: string | null;
};

export type DynamicFormSubtype = DynamicFormCategory;

export type DynamicFormField = {
  id: string;
  label: string;
  inputType: "text" | "number" | "date" | "select" | "textarea" | "file" | string;
  required: boolean;
  placeholder?: string | null;
  defaultValue?: string | number | boolean | null;
  options?: DynamicFormOption[] | null;
  validation?: unknown;
  group?: string | null;
  visibility?: unknown;
  order: number;
};

export type DynamicFormSchema = {
  category: DynamicFormCategory;
  subtype: DynamicFormSubtype;
  fields: DynamicFormField[];
};

export type WealthDynamicFormSubmitPayload = {
  categoryCode: string;
  subtypeCode: string;
  values: Record<string, string | number | boolean | null | string[]>;
};

export type WealthHandoffCounts = {
  assets: number;
  insurance: number;
  loans: number;
  financialRecords: number;
  documents: number;
  images: number;
};

export type WealthHandoffSummary = {
  generatedAt: string;
  recipients: {
    family: WealthHandoffRecipient[];
    emergency: WealthHandoffRecipient[];
  };
  handoffTypes: Array<{
    type: "family" | "emergency";
    label: string;
    contents: string[];
    excluded: string[];
    counts: WealthHandoffCounts;
  }>;
};

export type WealthHandoffSendResponse = {
  message: string;
  results: Array<{
    recipientId: string;
    email: string;
    handoffType: "family" | "emergency";
    sent: boolean;
    messageId?: string | null;
    reason?: "email_disabled" | "invalid_recipient" | "delivery_failed";
    errorCode?: string;
  }>;
};

export type BootstrapResponse = {
  user: AuthUser;
  entitlements: PlanEntitlements;
  familyMembers: FamilyMember[];
  documents: DocumentRecord[];
  savedPackages: string[];
  version: string;
};

export type ReadinessRequirementStatus = "ready" | "partial" | "missing";

export type ReadinessMatchedDocument = {
  id: string;
  originalName: string;
  displayName?: string | null;
  uniqueIdentifier?: string | null;
  normalizedType: string;
  owner?: string;
  confidence?: number;
};

export type ReadinessRequirement = {
  id: string;
  key: string;
  label: string;
  title: string;
  description: string;
  required: boolean;
  documentType: string;
  owner: string;
  status: ReadinessRequirementStatus;
  reason: string | null;
  matchedDocument: ReadinessMatchedDocument | null;
  matchedDocuments: ReadinessMatchedDocument[];
  alternatives: ReadinessMatchedDocument[];
  acceptedDocumentTypes: string[];
  alternativeLabels: string[];
};

export type ReadinessResult = {
  query: string;
  matchedPack: {
    id: string;
    slug: string;
    title: string;
    category: string;
    description: string;
    requiredSlots: ReadinessRequirement[];
    optionalSlots: ReadinessRequirement[];
  } | null;
  readiness: {
    totalRequired: number;
    satisfiedRequired: number;
    missingRequired: number;
    percentage: number;
  };
  groups: Array<{
    group: string;
    requirements: ReadinessRequirement[];
  }>;
  missing: ReadinessRequirement[];
  suggestions: Array<{
    id: string;
    title: string;
    slug: string;
    category: string;
    description: string;
  }>;
};

export type PackageLookup = ReadinessResult["suggestions"][number];

export type PackageSearchOrGenerateResponse = {
  source: "existing" | "official_source";
  confidence: number | null;
  matchReason: string | null;
  package: PackSummary;
  readiness: ReadinessResult;
};
