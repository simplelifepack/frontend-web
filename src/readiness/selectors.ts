import { createSelector } from "@reduxjs/toolkit";

import type { PackSummary } from "@/lib/api";
import type { RootState } from "@/store";
import { calculatePackageReadiness } from "./calculatePackageReadiness";

const selectPackages = (state: RootState) => state.packages.items;
const selectDocuments = (state: RootState) => state.documents.items;
const selectUser = (state: RootState) => state.auth.user;
const selectFamily = (state: RootState) => state.family.members;

export type DerivedPackSummary = PackSummary & {
  completion: number;
  requiredDocumentTypes: string[];
  uploadedDocumentTypes: string[];
  missingDocumentTypes: string[];
};

export const selectPackageCards = createSelector(
  [selectPackages, selectDocuments, selectUser, selectFamily],
  (packages, documents, user, familyMembers): DerivedPackSummary[] => {
    if (!user) return [];
    return packages.map((packageData) => {
      const readiness = calculatePackageReadiness({ packageData, documents, user, familyMembers });
      return {
        ...packageData,
        completion: readiness.percentage,
        requiredDocumentTypes: packageData.requirements.filter((requirement) => requirement.required).map((requirement) => requirement.title),
        uploadedDocumentTypes: readiness.matchedRequirements.filter((requirement) => requirement.required).map((requirement) => requirement.title),
        missingDocumentTypes: readiness.missingRequirements.filter((requirement) => requirement.required).map((requirement) => requirement.title),
      };
    });
  },
);

export function makeSelectPackageReadiness() {
  return createSelector(
    [
      selectPackages,
      selectDocuments,
      selectUser,
      selectFamily,
      (_state: RootState, slug: string) => slug,
    ],
    (packages, documents, user, familyMembers, slug) => {
      const packageData = packages.find((pack) => pack.slug === slug);
      if (!packageData || !user) return null;
      return calculatePackageReadiness({ packageData, documents, user, familyMembers });
    },
  );
}
