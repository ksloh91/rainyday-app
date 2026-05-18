export type TransactionType = "expense" | "income";

export const CATEGORIES = [
  // Expenses
  { id: "food_dining", label: "Food & dining", type: "expense" },
  { id: "groceries", label: "Groceries", type: "expense" },
  { id: "transport", label: "Transport", type: "expense" },
  { id: "housing", label: "Housing & rent", type: "expense" },
  { id: "utilities", label: "Utilities", type: "expense" },
  { id: "shopping", label: "Shopping", type: "expense" },
  { id: "health", label: "Health", type: "expense" },
  { id: "entertainment", label: "Entertainment", type: "expense" },
  { id: "education", label: "Education", type: "expense" },
  { id: "personal", label: "Personal care", type: "expense" },
  { id: "subscriptions", label: "Subscriptions", type: "expense" },
  { id: "travel", label: "Travel", type: "expense" },
  { id: "gifts", label: "Gifts & donations", type: "expense" },
  { id: "fees", label: "Fees & charges", type: "expense" },
  { id: "other_expense", label: "Other", type: "expense" },
  // Income
  { id: "salary", label: "Salary", type: "income" },
  { id: "freelance", label: "Freelance & side income", type: "income" },
  { id: "business", label: "Business", type: "income" },
  { id: "investments", label: "Investments", type: "income" },
  { id: "refunds", label: "Refunds", type: "income" },
  { id: "gifts_income", label: "Gifts received", type: "income" },
  { id: "other_income", label: "Other", type: "income" },
] as const satisfies readonly {
  id: string;
  label: string;
  type: TransactionType;
}[];

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export function categoriesForType(type: TransactionType) {
  return CATEGORIES.filter((c) => c.type === type);
}

export function defaultCategoryForType(type: TransactionType): CategoryId {
  return categoriesForType(type)[0].id;
}

export function getCategoryLabel(id: string): string {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id;
}
