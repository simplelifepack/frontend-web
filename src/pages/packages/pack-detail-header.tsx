import { Heading, Text, Button, Ring } from "@/design-system";
import Stamp from "@/components/Stamp";
import { T } from "@/constants/theme";
import type { PackSummary } from "@/lib/api";
import { RefreshCw, X } from "lucide-react";
import { packageMeta } from "./package-list-ui";
import { sourceProviderName } from "./package-source-display";
import { usePackageRefresh } from "./use-package-refresh";

type Props = {
  completion: number;
  isComplete: boolean;
  pack: PackSummary;
  readyCount: number;
  totalCount: number;
  onClose: () => void;
};
function formatPackageDate(value?: string | null) {
  if (!value || Number.isNaN(Date.parse(value))) return null;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}
export default function PackDetailHeader({
  completion,
  isComplete,
  pack,
  readyCount,
  totalCount,
  onClose,
}: Props) {
  const { refresh, refreshing, feedback } = usePackageRefresh(pack.slug);
  const { Icon } = packageMeta(pack);
  const sources =
    pack.verificationSources?.filter((source) => source.url) ?? [];
  const links = sources.length
    ? sources.map((source) => ({
        url: source.url,
        name: sourceProviderName(source),
        title: source.title,
      }))
    : pack.source?.url
      ? [
          {
            url: pack.source.url,
            name: sourceProviderName(pack.source),
            title: pack.source.title ?? pack.source.name,
          },
        ]
      : [];
  const checked = formatPackageDate(
    pack.source?.lastCheckedAt ?? sources[0]?.retrievedAt,
  );
  return (
    <header className="lp-pack-drawer-head">
      <Button
        size="sm"
        iconOnly
        variant="secondary"
        type="button"
        onClick={onClose}
        aria-label="Close package details"
      >
        <X aria-hidden="true" size={16} />
      </Button>
      <div className="lp-pack-drawer-title">
        <span>
          <Icon aria-hidden="true" size={21} />
        </span>
        <div>
          <Heading level={2} size="sm">
            {pack.title}
          </Heading>
          <Text as="p">{pack.subtitle || pack.category}</Text>
        </div>
      </div>
      {pack.description && (
        <Text as="p" className="lp-pack-context-description" size="sm">
          {pack.description}
        </Text>
      )}
      <div className="lp-pack-drawer-source">
        <Text size="sm" className="lp-pack-source-label">
          {links.length > 1 ? "Sources" : "Source"}
        </Text>
        <div className="lp-pack-source-links">
          {links.length ? (
            links.map((source, index) => (
              <Text
                as="a"
                size="sm"
                weight="semibold"
                href={source.url}
                target="_blank"
                rel="noreferrer"
                title={source.title}
                key={`${source.url}-${index}`}
              >
                {source.name}
              </Text>
            ))
          ) : (
            <Text size="sm" tone="muted">
              No source saved for this package.
            </Text>
          )}
        </div>
        <Text size="sm" className="lp-pack-source-date">
          {checked ? `Last checked ${checked}` : "Not yet checked"}
        </Text>
        <Button
          size="sm"
          iconOnly
          variant="tertiary"
          type="button"
          title={
            refreshing ? "Checking latest requirements" : "Check again now"
          }
          aria-label="Check again now"
          aria-busy={refreshing}
          disabled={refreshing}
          onClick={() => void refresh()}
        >
          <RefreshCw
            aria-hidden="true"
            size={14}
            className={refreshing ? "lp-pack-refresh-spinning" : undefined}
          />
        </Button>
      </div>
      {feedback && (
        <Text
          as="p"
          size="sm"
          className="lp-pack-refresh-feedback"
          role={feedback.error ? "alert" : "status"}
          style={{ color: feedback.error ? T.coral : T.muted }}
        >
          {feedback.message}
        </Text>
      )}
      <div className="lp-pack-drawer-score">
        <Ring
          score={completion}
          size={64}
          color={isComplete ? T.mint : completion >= 50 ? T.readiness : T.coral}
        />
        {isComplete ? (
          <Stamp />
        ) : (
          <Text>
            {readyCount} of {totalCount} ready
          </Text>
        )}
      </div>
    </header>
  );
}
