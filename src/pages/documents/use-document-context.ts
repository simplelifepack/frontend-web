import { useEffect, useMemo, useState } from "react";
import { api, type DocumentRecord, type PackageListItem } from "@/lib/api";
import {
  documentRequirementTypes,
  normalizeRequirementValue,
} from "@/readiness/calculatePackageReadiness";

export function useDocumentContext(doc: DocumentRecord) {
  const [people, setPeople] = useState<Array<{ id: string; name: string }>>([]);
  const [packages, setPackages] = useState<PackageListItem[]>([]);
  const [peopleError, setPeopleError] = useState(false);
  const [packagesError, setPackagesError] = useState(false);
  const [packagesLoading, setPackagesLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    api.documents
      .assignmentOptions()
      .then((value) => {
        if (!cancelled) setPeople(value);
      })
      .catch(() => {
        if (!cancelled) setPeopleError(true);
      });
    const loadPackages = async () => {
      const items: PackageListItem[] = [];
      let page = 1;
      while (!cancelled) {
        const response = await api.packages.list({
          page,
          limit: 200,
          sort: "title",
        });
        items.push(...response.items);
        if (!response.pagination.hasNextPage) break;
        page++;
      }
      if (!cancelled) setPackages(items);
    };
    loadPackages()
      .catch(() => {
        if (!cancelled) setPackagesError(true);
      })
      .finally(() => {
        if (!cancelled) setPackagesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);
  const usedIn = useMemo(() => {
    const types = new Set(documentRequirementTypes(doc));
    return packages.flatMap((pack) => {
      const requirements = pack.requirements.filter(
        (requirement) =>
          requirement.assignment?.documentId === doc.id ||
          requirement.acceptedDocumentTypes.some((type) =>
            types.has(normalizeRequirementValue(type)),
          ),
      );
      return requirements.length
        ? [
            {
              ...pack,
              required: requirements.some(
                (requirement) => requirement.required,
              ),
            },
          ]
        : [];
    });
  }, [doc, packages]);
  return { people, peopleError, usedIn, packagesLoading, packagesError };
}
