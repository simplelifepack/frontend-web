/** Stable navigation labels; package records and counts still come from the API. */
export const packageCategories = [
  "Identity & Civic",
  "Money & Tax",
  "Health",
  "Family & Life",
  "Home & Property",
  "Education",
  "Jobs & Employment",
  "Travel & Immigration",
] as const;

export function visiblePackageCategories(categories: string[]) {
  return [
    ...new Set(
      [
        ...packageCategories,
        ...categories.map((category) => category.trim()),
      ].filter(
        (category) => category && category !== "All" && category !== "My packs",
      ),
    ),
  ];
}

export function isUserPack(pack: { createdBy?: string }) {
  return Boolean(
    pack.createdBy && pack.createdBy !== "seed" && pack.createdBy !== "ai",
  );
}

export function matchesPackageCategory(
  pack: { category: string; createdBy?: string },
  selectedCategory: string,
) {
  if (selectedCategory === "All") return true;
  if (selectedCategory === "My packs") return isUserPack(pack);
  return (
    pack.category.trim().toLowerCase() === selectedCategory.trim().toLowerCase()
  );
}

export function mergePackageCategories(current: string[], incoming: string[] | undefined, packs: Array<{ category: string }>) {
  return [...new Set([...current, ...(incoming ?? []), ...packs.map(pack => pack.category)].filter(Boolean))];
}
