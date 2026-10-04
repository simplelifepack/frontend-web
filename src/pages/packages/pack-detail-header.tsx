import Ring from "@/components/Ring";
import Stamp from "@/components/Stamp";
import { T } from "@/constants/theme";
import type { PackSummary } from "@/lib/api";
import { ExternalLink, RefreshCw, ShieldCheck, X } from "lucide-react";
import { packageMeta } from "./package-list-ui";
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
      <button type="button" className="lp-pack-drawer-close" onClick={onClose} aria-label="Close package details"><X size={18} /></button>
      <div className="lp-pack-drawer-title">
        <span style={{ background: `${color}22`, color }}><Icon size={21} /></span>
        <div><h2>{pack.title}</h2><p>{pack.subtitle || pack.description || pack.category}</p></div>
      </div>
      {pack.createdBy && pack.createdBy !== "seed" ? <div className="lp-pack-custom-badge">Custom / generated pack</div> : null}
      <div className="lp-pack-drawer-source">
        <span>{pack.verificationSources?.length ? "Sources" : `Curated list · ${source.title}${source.checked ? ` · last checked ${source.checked}` : ""}`}</span>
        {pack.verificationSources?.slice(0, 3).map((item) => (
          item.url ? (
            <a href={item.url} target="_blank" rel="noreferrer" title={item.title || item.url} key={`${item.title}-${item.url}`}>
              {item.type === "government" || item.type === "official" || item.type === "authority" ? <ShieldCheck size={12} /> : <ExternalLink size={12} />}
              {item.title || item.organization || item.url}
            </a>
          ) : (
            <span className="lp-pack-source-pill" key={item.title}>{item.title || item.organization}</span>
          )
        ))}
        {source.checked ? <span className="lp-pack-source-date">Checked {source.checked}</span> : null}
        <button type="button" title={refreshing ? "Checking latest requirements" : "Check again now"} aria-label="Check again now" aria-busy={refreshing} disabled={refreshing} onClick={() => void refresh()}><RefreshCw size={14} className={refreshing ? "lp-pack-refresh-spinning" : undefined} /></button>
      </div>
      {feedback ? <p className="lp-pack-refresh-feedback" role={feedback.error ? "alert" : "status"} style={{ color: feedback.error ? T.coral : T.muted }}>{feedback.message}</p> : null}
      <div className="lp-pack-drawer-score">
        <Ring score={completion} size={64} />
        {isComplete ? <Stamp /> : <span>{readyCount} of {totalCount} ready</span>}
      </div>
    </header>
  );
}
