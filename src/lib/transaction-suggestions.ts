import type { Transaction } from "@/lib/transactions";

/** Unique non-empty values from recent transactions (most recent casing wins). */
export function collectFieldSuggestions(
  transactions: Transaction[],
  field: "description" | "merchant",
): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const tx of transactions) {
    const value = (
      field === "description"
        ? tx.description.trim() || tx.merchant.trim()
        : tx.merchant
    ).trim();
    if (!value) continue;
    const key = value.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(value);
  }

  return result;
}

export function filterSuggestions(
  query: string,
  options: string[],
  max = 6,
): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  return options
    .filter((opt) => opt.toLowerCase().includes(q))
    .sort((a, b) => {
      const aStarts = a.toLowerCase().startsWith(q);
      const bStarts = b.toLowerCase().startsWith(q);
      if (aStarts !== bStarts) return aStarts ? -1 : 1;
      return a.localeCompare(b);
    })
    .slice(0, max);
}
