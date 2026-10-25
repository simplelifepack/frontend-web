import { Heading, Text } from "@/design-system";
import type { PackSummary } from "@/lib/api";
import { ShieldCheck, ExternalLink } from "lucide-react";
import { sourceHostname, sourceProviderName } from "./package-source-display";
function formatPackageDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function PackageSourceList({ pack }: { pack: PackSummary }) {
  if (!pack.verificationSources?.length) return null;
  return (
    <section className="lp-pack-source-list">
      <Heading level={3} size="sm">
        Sources
      </Heading>
      {pack.verificationSources.slice(0, 4).map((source) => {
        const provider = sourceProviderName(source);
        const host = sourceHostname(source.url);
        const checked = formatPackageDate(source.retrievedAt) ?? "recently";
        const details = [source.title, host, `checked ${checked}`]
          .filter(Boolean)
          .join(" · ");
        return (
          <Text
            as="a"
            size="md"
            href={source.url}
            target="_blank"
            rel="noreferrer"
            key={`${source.title}-${source.url}`}
          >
            <span>
              <strong>{provider}</strong>
              <small>{details}</small>
            </span>
            {source.type === "government" ||
            source.type === "official" ||
            source.type === "authority" ? (
              <ShieldCheck aria-hidden="true" focusable="false" size={15} />
            ) : (
              <ExternalLink aria-hidden="true" focusable="false" size={15} />
            )}
          </Text>
        );
      })}
      <Text as="p" size="md">
        Sources help verify the checklist, but institutions can still ask for
        more.
      </Text>
    </section>
  );
}
