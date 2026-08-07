import { createSelector } from "@reduxjs/toolkit";

import type { PackageListItem, PackSummary } from "@/lib/api";
import type { RootState } from "@/store";
import { calculatePackageReadiness } from "./calculatePackageReadiness";

const selectPackages = (state: RootState) => state.packages.items;
const selectPackageDetails = (state: RootState) => state.packages.detailsBySlug;
const selectDocuments = (state: RootState) => state.documents.items;
const selectUser = (state: RootState) => state.auth.user;
const selectFamily = (state: RootState) => state.family.members;

export type DerivedPackSummary = PackageListItem & {
  completion: number;
  requiredDocumentTypes: string[];
  uploadedDocumentTypes: string[];
  missingDocumentTypes: string[];
  requirements: PackSummary["requirements"];
};

export const selectPackageCards = createSelector(
  [selectPackages, selectPackageDetails, selectDocuments, selectUser, selectFamily],
  (packages, detailsBySlug, documents, user, familyMembers): DerivedPackSummary[] => {
    if (!user) return [];
    return packages.map((packageData) => {
      const detail = detailsBySlug[packageData.slug];
      const readiness = detail
        ? calculatePackageReadiness({ packageData: detail, documents, user, familyMembers })
        : null;
      return {
        ...packageData,
        requirements: detail?.requirements ?? [],
        completion: readiness?.percentage ?? 0,
        requiredDocumentTypes: detail?.requirements.filter((requirement) => requirement.required).map((requirement) => requirement.title) ?? [],
        uploadedDocumentTypes: readiness?.matchedRequirements.filter((requirement) => requirement.required).map((requirement) => requirement.title) ?? [],
        missingDocumentTypes: readiness?.missingRequirements.filter((requirement) => requirement.required).map((requirement) => requirement.title) ?? [],
      };
    });
  },
);

export function makeSelectPackageReadiness() {
  return createSelector(
    [
      selectPackages,
      selectPackageDetails,
      selectDocuments,
      selectUser,
      selectFamily,
      (_state: RootState, slug: string) => slug,
    ],
    (_packages, detailsBySlug, documents, user, familyMembers, slug) => {
      const packageData = detailsBySlug[slug];
      if (!packageData || !user) return null;
      return calculatePackageReadiness({ packageData, documents, user, familyMembers });
    },
  );
}
