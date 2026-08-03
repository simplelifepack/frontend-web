import { normalizeSearchText } from "./normalizer";

export const normalizeSearchInput = normalizeSearchText;

export function tokenize(input: string) {
  return normalizeSearchText(input).split(" ").filter(Boolean);
}
