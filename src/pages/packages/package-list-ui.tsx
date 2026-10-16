import { Text, ChoiceGroup, Choice, Card, Ring } from "@/design-system";

import CustomPackButton from "@/components/CustomPackButton";

import Stamp from "@/components/Stamp";
import { T } from "@/constants/theme";
import type { DerivedPackSummary } from "@/readiness/selectors";
import { BookOpen, Briefcase, Car, ChevronRight, FileText, GraduationCap, HeartPulse, Home, IdCard, Landmark, Loader2, Plane, Plus, ShieldCheck, Users } from "lucide-react";

export function isUserPack(pack: { createdBy?: string }) {
  return Boolean(pack.createdBy && pack.createdBy !== "seed" && pack.createdBy !== "ai");
}

export function matchesPackageCategory(pack: { category: string; createdBy?: string }, selectedCategory: string) {
  if (selectedCategory === "All") return true;
  if (selectedCategory === "My packs") return isUserPack(pack);
  return pack.category.trim().toLowerCase() === selectedCategory.trim().toLowerCase();
}

export function packageMeta(pack: { searchMetadata?: DerivedPackSummary["searchMetadata"] }) {
  const metadata = pack.searchMetadata;
  const icon = metadata?.uiIcon;
  const accent = metadata?.uiAccent;
  const color = typeof accent === "string" && /^#[0-9a-f]{6}$/i.test(accent) ? accent
    : accent === "green" ? T.mint
    : accent === "teal" ? T.teal
      : accent === "pink" ? T.pink
        : accent === "purple" ? T.purple
          : accent === "blue" ? T.info
            : undefined;
  if (icon === "BookOpen") return { Icon: BookOpen, color: color ?? T.action };
  if (icon === "Briefcase") return { Icon: Briefcase, color: color ?? T.purple };
  if (icon === "Car") return { Icon: Car, color: color ?? T.teal };
  if (icon === "FileText") return { Icon: FileText, color: color ?? T.teal };
  if (icon === "GraduationCap") return { Icon: GraduationCap, color: color ?? T.readiness };
  if (icon === "HeartPulse") return { Icon: HeartPulse, color: color ?? T.pink };
  if (icon === "HomeIcon") return { Icon: Home, color: color ?? T.pink };
  if (icon === "IdCard") return { Icon: IdCard, color: color ?? T.action };
  if (icon === "Landmark") return { Icon: Landmark, color: color ?? T.mint };
  if (icon === "ShieldCheck") return { Icon: ShieldCheck, color: color ?? T.purple };
  if (icon === "Plane") return { Icon: Plane, color: color ?? T.info };
  if (icon === "Users") return { Icon: Users, color: color ?? T.purple };
  return { Icon: FileText, color: color ?? T.info };
}

function readinessText(pack: { requiredDocumentTypes: string[]; uploadedDocumentTypes: string[] }) {
  const total = pack.requiredDocumentTypes.length;
  const ready = pack.uploadedDocumentTypes.length;
  return `${ready} of ${total} ready`;
}

type CategoryPillsProps = {
  active: string;
  categories: string[];
  packs: Array<{ createdBy?: string }>;
  onSelect: (category: string) => void;
};

export function PackageCategoryPills({ active, categories, packs, onSelect }: CategoryPillsProps) {
  const items = ["All", ...new Set(categories.filter(Boolean)), "My packs"];
  return (
    <ChoiceGroup >
      {items.map((item) => (
        <Choice type="button" aria-pressed={active === item} key={item} onClick={() => onSelect(item)}>
          {item === "My packs" ? `My packs (${packs.filter(isUserPack).length})` : item}
        </Choice>
      ))}
    </ChoiceGroup>
  );
}

type PackageGridProps = {
  activeQuerySettled: boolean;
  debouncedQuery: string;
  generationStatus: "idle" | "loading" | "succeeded" | "failed";
  hasSearchQuery: boolean;
  packs: DerivedPackSummary[];
  quotaReached: boolean;
  searchCanGenerate: boolean;
  searchStatus: "idle" | "loading" | "succeeded" | "failed";
  status: "idle" | "loading" | "succeeded" | "failed";
  onGenerate: () => void;
  onOpen: (slug: string) => void;
};

export function PackageGrid({
  activeQuerySettled,
  debouncedQuery,
  generationStatus,
  hasSearchQuery,
  packs,
  quotaReached,
  searchCanGenerate,
  searchStatus,
  status,
  onGenerate,
  onOpen,
}: PackageGridProps) {
  return (
    <div   className="lp-pack-grid">
      {(status === "loading" || searchStatus === "loading") && !packs.length
        ? Array.from({ length: 6 }, (_, index) => (
          <div className="lp-pack-result lp-pack-result-skeleton" key={index}><span /><span /><span /></div>
        ))
        : null}
      {packs.map((pack) => {
        const { Icon, color } = packageMeta(pack);
        const complete = pack.completion >= 100;
        return (
          <button type="button" className={`lp-pack-result${complete ? " complete" : ""}`} key={pack.slug} onClick={() => onOpen(pack.slug)}>
            <Ring score={Math.round(pack.completion)} size={54} />
            <span className="lp-pack-result-copy">
              <strong><Icon aria-hidden="true" focusable="false" size={15} style={{ color }} /> {pack.title}</strong>
              <span>{complete ? "Everything in place" : readinessText(pack)}</span>
              {isUserPack(pack) ? <small className="lp-pack-card-badge">custom</small> : null}
            </span>
            {complete ? <Stamp /> : <ChevronRight aria-hidden="true" focusable="false" size="var(--icon-regular)" color={T.muted} />}
          </button>
        );
      })}
      {!packs.length && activeQuerySettled ? (
        <Card style={{ gridColumn: "1 / -1", textAlign: "center" }}>
          <Text as="strong" size="md" weight="semibold" style={{ color: T.white, display: "block" }}>
            {hasSearchQuery ? `No pack covers "${debouncedQuery.trim()}" yet` : "No matching packages"}
          </Text>
          <Text as="div" size="md" tone="muted" style={{ color: T.muted, marginTop: "var(--space-s8)" }}>
            {hasSearchQuery ? "Describe it and Readiness drafts the checklist for you." : "Try another search or category."}
          </Text>
          {hasSearchQuery && searchCanGenerate ? (
            <CustomPackButton quotaReached={quotaReached} variant="primary" disabled={generationStatus === "loading"} onClick={onGenerate}>
              {generationStatus === "loading" ? <Loader2 aria-hidden="true" focusable="false" size={17} className="lp-spin" /> : <Plus aria-hidden="true" focusable="false" size={17} />}
              {generationStatus === "loading" ? "Drafting pack..." : "Create a custom pack"}
            </CustomPackButton>
          ) : null}
        </Card>
      ) : null}
    </div>
  );
}
