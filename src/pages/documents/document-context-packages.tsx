import { Text, Heading, Pill } from "@/design-system";
import { Plane, Users, FolderOpen } from "lucide-react";
import { Link } from "react-router-dom";
import type { useDocumentContext } from "./use-document-context";

type Props = Pick<
  ReturnType<typeof useDocumentContext>,
  "usedIn" | "packagesLoading" | "packagesError"
> & { onClose: () => void };
export default function DocumentContextPackages({
  usedIn,
  packagesLoading,
  packagesError,
  onClose,
}: Props) {
  return (
    <section
      className="document-context-section"
      aria-labelledby="document-packages-heading"
    >
      <Heading level={3} id="document-packages-heading" size="sm">
        Used in packages
      </Heading>
      {packagesLoading ? (
        <Text tone="muted">Loading packages…</Text>
      ) : packagesError ? (
        <Text tone="danger">Unable to load packages.</Text>
      ) : usedIn.length ? (
        usedIn.map((pack) => {
          const PackageIcon = /travel|visa/i.test(pack.category)
            ? Plane
            : /family|legacy|death|pension/i.test(pack.category)
              ? Users
              : FolderOpen;
          return (
            <Link
              key={pack.id}
              className="document-context-package"
              to={`/packages/${pack.slug}`}
              onClick={onClose}
            >
              <PackageIcon aria-hidden="true" size={14} />
              <Text>{pack.title}</Text>
              <Pill tone="flat">{pack.required ? "required" : "optional"}</Pill>
            </Link>
          );
        })
      ) : (
        <Text tone="muted">
          No package currently requires this document type.
        </Text>
      )}
    </section>
  );
}
