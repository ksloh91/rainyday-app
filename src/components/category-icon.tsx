const CATEGORY_STYLES: Record<string, { bg: string; glyph: string }> = {
  food_dining: { bg: "bg-amber-500", glyph: "🍽" },
  groceries: { bg: "bg-lime-600", glyph: "🛒" },
  transport: { bg: "bg-pink-500", glyph: "🚌" },
  housing: { bg: "bg-violet-500", glyph: "🏠" },
  utilities: { bg: "bg-sky-500", glyph: "💡" },
  shopping: { bg: "bg-fuchsia-500", glyph: "🛍" },
  health: { bg: "bg-rose-500", glyph: "♥" },
  entertainment: { bg: "bg-indigo-500", glyph: "🎬" },
  education: { bg: "bg-blue-500", glyph: "📚" },
  personal: { bg: "bg-teal-500", glyph: "✨" },
  subscriptions: { bg: "bg-purple-500", glyph: "↻" },
  travel: { bg: "bg-cyan-500", glyph: "✈" },
  gifts: { bg: "bg-orange-500", glyph: "🎁" },
  fees: { bg: "bg-zinc-500", glyph: "¤" },
  other_expense: { bg: "bg-zinc-600", glyph: "•" },
  salary: { bg: "bg-emerald-500", glyph: "💰" },
  freelance: { bg: "bg-emerald-600", glyph: "💼" },
  business: { bg: "bg-emerald-700", glyph: "📈" },
  investments: { bg: "bg-green-500", glyph: "📊" },
  refunds: { bg: "bg-green-600", glyph: "↩" },
  gifts_income: { bg: "bg-green-700", glyph: "🎁" },
  other_income: { bg: "bg-zinc-600", glyph: "•" },
};

const fallback = { bg: "bg-zinc-500", glyph: "•" };

export function CategoryIcon({ categoryId }: { categoryId: string }) {
  const style = CATEGORY_STYLES[categoryId] ?? fallback;
  return (
    <span
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base ${style.bg}`}
      aria-hidden
    >
      {style.glyph}
    </span>
  );
}
