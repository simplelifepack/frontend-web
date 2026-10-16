import { Heading, Text, Button, Ring } from "@/design-system";

import Stamp from "@/components/Stamp";
import { T } from "@/constants/theme";
import type { PackSummary } from "@/lib/api";
import { ExternalLink, RefreshCw, ShieldCheck, X } from "lucide-react";
import { packageMeta } from "./package-list-ui";
import { sourceProviderName } from "./package-source-display";
import { usePackageRefresh } from "./use-package-refresh";

type PackDetailHeaderProps = {
  completion: number;
  isComplete: boolean;
  pack: PackSummary;
  readyCount: number;
  totalCount: number;
  onClose: () => void;
};

function formatPackageDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

function packageSource(pack: PackSummary) {
  return {
    provider: pack.source ? sourceProviderName(pack.source) : "Official source",
    title: pack.source?.title ?? pack.source?.name ?? "Official source",
    url: pack.source?.url ?? "",
    checked: formatPackageDate(pack.source?.lastCheckedAt),
  };
}

export default function PackDetailHeader({ completion, isComplete, pack, readyCount, totalCount, onClose }: PackDetailHeaderProps) {
  const { refresh, refreshing, feedback } = usePackageRefresh(pack.slug);
  const source = packageSource(pack);
  const { Icon, color } = packageMeta(pack);
  return (
    <header className="lp-pack-drawer-head">
      <Button size="sm" iconOnly variant="tertiary" type="button" onClick={onClose} aria-label="Close package details"><X aria-hidden="true" focusable="false" size="var(--icon-regular)" /></Button>
      <div className="lp-pack-drawer-title">
        <span style={{ background: `color-mix(in srgb, ${color} 13.33%, transparent)`, color }}><Icon aria-hidden="true" focusable="false" size={21} /></span>
        <div><Heading level={2} size="sm">{pack.title}</Heading><Text as="p" size="md">{pack.subtitle || pack.description || pack.category}</Text></div>
      </div>
      {pack.createdBy && pack.createdBy !== "seed" ? <Text as="div" size="md" className="lp-pack-custom-badge">Custom / generated pack</Text> : null}
      <div className="lp-pack-drawer-source">
        <Text size="md">{pack.verificationSources?.length ? "Sources" : `Curated list · ${source.provider}${source.checked ? ` · last checked ${source.checked}` : ""}`}</Text>
        {pack.verificationSources?.slice(0, 3).map((item) => (
          item.url ? (
            <Text as="a" size="sm" weight="semibold" href={item.url} target="_blank" rel="noreferrer" title={item.title || item.url} key={`${item.title}-${item.url}`}>
              {item.type === "government" || item.type === "official" || item.type === "authority" ? <ShieldCheck aria-hidden="true" focusable="false" size={12} /> : <ExternalLink aria-hidden="true" focusable="false" size={12} />}
              {sourceProviderName(item)}
            </Text>
          ) : (
            <Text size="md" className="lp-pack-source-pill" key={item.title}>{sourceProviderName(item)}</Text>
          )
        ))}
        {source.checked ? <Text size="md" className="lp-pack-source-date">Checked {source.checked}</Text> : null}
        <Button size="sm" iconOnly variant="tertiary" type="button" title={refreshing ? "Checking latest requirements" : "Check again now"} aria-label="Check again now" aria-busy={refreshing} disabled={refreshing} onClick={() => void refresh()}><RefreshCw aria-hidden="true" focusable="false" size={14} className={refreshing ? "lp-pack-refresh-spinning" : undefined} /></Button>
      </div>
      {feedback ? <Text as="p" size="sm" tone="muted" className="lp-pack-refresh-feedback" role={feedback.error ? "alert" : "status"} style={{ color: feedback.error ? T.coral : T.muted }}>{feedback.message}</Text> : null}
      <Text as="div" size="md" className="lp-pack-drawer-score">
        <Ring score={completion} size={64} />
        {isComplete ? <Stamp /> : <span>{readyCount} of {totalCount} ready</span>}
      </Text>
    </header>
  );
}
