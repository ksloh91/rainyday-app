"use client";

import {
  CategoryBadge,
  CategoryGlyph,
  getCategoryMeta,
  getPaymentMeta,
  PaymentBadge,
  PaymentGlyph,
} from "@/components/icons";

type Option = { id: string; label: string };

type IconOptionGridProps = {
  label: string;
  options: readonly Option[];
  value: string;
  onChange: (id: string) => void;
  variant: "category" | "payment";
  columns?: number;
};

function shortLabel(label: string) {
  const first = label.split(/[&/]/)[0]?.trim() ?? label;
  return first.length > 12 ? `${first.slice(0, 11)}…` : first;
}

export function IconOptionGrid({
  label,
  options,
  value,
  onChange,
  variant,
  columns = 4,
}: IconOptionGridProps) {
  return (
    <div>
      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
        {label}
      </p>
      <div
        className="mt-2 grid gap-2"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {options.map((opt) => {
          const selected = value === opt.id;
          const meta =
            variant === "category"
              ? getCategoryMeta(opt.id)
              : getPaymentMeta(opt.id);

          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              className={`flex flex-col items-center gap-1.5 rounded-xl border px-1 py-2.5 transition active:scale-[0.98] ${
                selected
                  ? `border-transparent bg-zinc-900 text-white ring-2 ${meta.ring} dark:bg-zinc-100 dark:text-zinc-900`
                  : "border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
              }`}
            >
              {variant === "category" ? (
                selected ? (
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-white ${meta.bg}`}
                  >
                    <CategoryGlyph categoryId={opt.id} size={18} />
                  </span>
                ) : (
                  <CategoryBadge categoryId={opt.id} size="sm" />
                )
              ) : selected ? (
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-white ${meta.bg}`}
                >
                  <PaymentGlyph paymentId={opt.id} size={18} />
                </span>
              ) : (
                <PaymentBadge paymentId={opt.id} size="md" />
              )}
              <span className="max-w-full truncate text-center text-[10px] leading-tight font-medium">
                {shortLabel(opt.label)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
