import { createSelector } from "@reduxjs/toolkit";

import type { PackageListItem } from "@/lib/api";
import type { RootState } from "@/store";
import { calculatePackReadiness } from "./calculatePackageReadiness";

const selectPackages = (state: RootState) => state.packages.items;
const selectCataloguePackages = (state: RootState) => state.packages.catalogueItems;
const selectDocuments = (state: RootState) => state.documents.items;

export type DerivedPackSummary = PackageListItem & {
  completion: number;
  requiredDocumentTypes: string[];
  uploadedDocumentTypes: string[];
  missingDocumentTypes: string[];
};

function derivePackageCards(packages: PackageListItem[], documents: RootState["documents"]["items"]): DerivedPackSummary[] {
  return packages.map((pack) => {
    const readiness = calculatePackReadiness(pack.requirements, documents);
    const required = readiness.requirements.filter((requirement) => requirement.required);
    return {
      ...pack,
      completion: readiness.percentage,
      requiredDocumentTypes: required.map((requirement) => requirement.title),
      uploadedDocumentTypes: required.filter((requirement) => requirement.status === "ready").map((requirement) => requirement.title),
      missingDocumentTypes: required.filter((requirement) => requirement.status === "missing").map((requirement) => requirement.title),
    };
  });
}

export const selectPackageCards = createSelector([selectPackages, selectDocuments], derivePackageCards);
export const selectCataloguePackageCards = createSelector([selectCataloguePackages, selectDocuments], derivePackageCards);

export function makeSelectPackageReadiness() {
  return createSelector(
    [selectPackages, selectDocuments, (_state: RootState, slug: string) => slug],
    (packages, documents, slug) => {
      const pack = packages.find((item) => item.slug === slug);
      return pack ? calculatePackReadiness(pack.requirements, documents) : null;
    },
  );
}
