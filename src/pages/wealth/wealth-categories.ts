export type WealthCategory = "all" | "Accounts and investments" | "Loans" | "Insurance" | "Lent and borrowed";

export const wealthCategories: { key: WealthCategory; label: string }[] = [
  { key: "all", label: "All" },
  { key: "Accounts and investments", label: "Accounts and investments" },
  { key: "Loans", label: "Loans" },
  { key: "Insurance", label: "Insurance" },
  { key: "Lent and borrowed", label: "Lent and borrowed" },
];
