export type PackageIdentifier = string;

export type SearchDebugInfo = {
  keywordMatch: boolean;
  aiCalled: boolean;
  backendLookup: boolean;
  executionTimeMs: number;
  reason?: string;
};

export type PackageKeywordEntry = {
  slug: PackageIdentifier;
  title: string;
  aliases: string[];
  keywords: Record<string, number>;
};

export type LocalSearchMatch = {
  slug: PackageIdentifier;
  title: string;
  confidence: number;
  matchedBy: "exact" | "contains" | "tokens" | "fuzzy";
};
