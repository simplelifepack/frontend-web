/* eslint-disable max-lines */
export type AuthUser = {
  accountTier?: "free" | "paid";
  id?: string;
  name: string;
  email: string;
};

export type AuthResponse = {
  token: string;
  accessToken?: string;
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
  owner?: string;
  expiryDate?: string | null;
  documentDate?: string | null;
  capabilities?: string[];
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
  expiryDate: string | null;
};

export type AnalyzeDocumentResponse = {
  success: true;
  document: DocumentAIResult & { title: string; ownership: "mine" | "other" | "unknown" };
  files: Array<{ tempFileId: string;
    originalName: string;
    mimeType: string;
    size: number;
  }>;
  warnings: Array<{ code: string; message: string }>;
};

export type { GmailCandidate, GmailImportResult, GmailStatus } from "./gmail.types";

export type UploadDocumentResponse = AnalyzeDocumentResponse & {
  document?: DocumentRecord;
};

export type SaveDocumentPayload = {
  tempFileIds: string[];
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
  category: string;
  description: string;
  source?: {
    name?: string;
    title?: string;
    url?: string;
    lastCheckedAt?: string;
  };
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
  title: string;
  category: string;
  description: string;
  source?: PackSummary["source"];
  requirements: PackageRequirement[];
};

export type PackageSearchMetadata = {
  intent?: string;
  searchPhrases: string[];
  jurisdiction?: string;
  destination?: string;
  purpose?: string;
  subject?: string;
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
  description?: string;
  required: boolean;
  group?: string;
  owner?: string;
  metadata?: Record<string, string | number | boolean | null> | null;
  acceptedDocumentTypes: string[];
};

export type FamilyMember = {
  id: string;
  name: string;
  relationship?: string;
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
  memberCount: number;
  members: TrustMember[];
  connections: TrustConnection[];
  accessTypes: TrustAccessType[];
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

export type BootstrapResponse = Partial<AccountUsage> & {
  user: AuthUser;
  familyMembers: FamilyMember[];
  documents: DocumentRecord[];
  savedPackages: string[];
  version: string;
};

export type ReadinessMatchedDocument = {
  id: string;
  originalName: string;
  displayName?: string | null;
  uniqueIdentifier?: string | null;
  normalizedType: string;
  owner?: string;
  confidence?: number;
};

export type PackageLookup = Pick<PackSummary, "id" | "title" | "slug" | "category" | "description">;

export type PackageSearchOrGenerateResponse = {
  source: "existing" | "official_source";
  confidence: number | null;
  matchReason: string | null;
  package: PackSummary;
};

export type AccountUsage = {
  accountTier: "free" | "paid";
  storage: { usedBytes: number; limitBytes: number | null; unlimited: boolean };
  aiUsage: { used: number | null; limit: number | null; remaining: number | null; unlimited: boolean; period: string };
};
