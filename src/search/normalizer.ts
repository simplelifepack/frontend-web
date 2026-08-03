export function normalizeSearchText(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function compactSearchText(input: string) {
  return normalizeSearchText(input).replace(/\s+/g, "");
}
