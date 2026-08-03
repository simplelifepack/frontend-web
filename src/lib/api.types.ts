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
  lastScannedAt: string | null;
  lastSuccessfulSync: string | null;
  scanning: boolean;
  phase: string | null;
  processed: number;
  total: number;
  indexedCount: number;
  error: string | null;
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
  category: string;
  description: string;
  aliases: string[];
  keywords: string[];
  version: number;
  requirements: PackageRequirement[];
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

export type BootstrapResponse = {
  user: AuthUser;
  familyMembers: FamilyMember[];
  documents: DocumentRecord[];
  packages: PackSummary[];
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
