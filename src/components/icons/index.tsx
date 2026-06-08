import type { ComponentType } from "react";
import type { CategoryId } from "@/lib/categories";
import type { PaymentMethodId } from "@/lib/payment-methods";
import {
  BusinessIcon,
  EducationIcon,
  EntertainmentIcon,
  FeesIcon,
  FoodDiningIcon,
  FreelanceIcon,
  GiftIcon,
  GroceriesIcon,
  HealthIcon,
  HousingIcon,
  InvestmentsIcon,
  OtherIcon,
  PersonalIcon,
  RefundsIcon,
  SalaryIcon,
  ShoppingIcon,
  SubscriptionsIcon,
  TransportIcon,
  TravelIcon,
  UtilitiesIcon,
} from "@/components/icons/category-glyphs";
import {
  CashIcon,
  CreditCardIcon,
  CalendarIcon,
  ExpenseTypeIcon,
  IncomeTypeIcon,
  QrPayIcon,
  WalletIcon,
} from "@/components/icons/payment-glyphs";

export type IconMeta = { bg: string; ring: string };

export const CATEGORY_META: Record<string, IconMeta> = {
  food_dining: { bg: "bg-amber-500", ring: "ring-amber-500/40" },
  groceries: { bg: "bg-lime-600", ring: "ring-lime-600/40" },
  transport: { bg: "bg-pink-500", ring: "ring-pink-500/40" },
  housing: { bg: "bg-violet-500", ring: "ring-violet-500/40" },
  utilities: { bg: "bg-sky-500", ring: "ring-sky-500/40" },
  shopping: { bg: "bg-fuchsia-500", ring: "ring-fuchsia-500/40" },
  health: { bg: "bg-rose-500", ring: "ring-rose-500/40" },
  entertainment: { bg: "bg-indigo-500", ring: "ring-indigo-500/40" },
  education: { bg: "bg-blue-500", ring: "ring-blue-500/40" },
  personal: { bg: "bg-teal-500", ring: "ring-teal-500/40" },
  subscriptions: { bg: "bg-purple-500", ring: "ring-purple-500/40" },
  travel: { bg: "bg-cyan-500", ring: "ring-cyan-500/40" },
  gifts: { bg: "bg-orange-500", ring: "ring-orange-500/40" },
  fees: { bg: "bg-zinc-500", ring: "ring-zinc-500/40" },
  other_expense: { bg: "bg-zinc-600", ring: "ring-zinc-600/40" },
  salary: { bg: "bg-emerald-500", ring: "ring-emerald-500/40" },
  freelance: { bg: "bg-emerald-600", ring: "ring-emerald-600/40" },
  business: { bg: "bg-emerald-700", ring: "ring-emerald-700/40" },
  investments: { bg: "bg-green-500", ring: "ring-green-500/40" },
  refunds: { bg: "bg-green-600", ring: "ring-green-600/40" },
  gifts_income: { bg: "bg-green-700", ring: "ring-green-700/40" },
  other_income: { bg: "bg-zinc-600", ring: "ring-zinc-600/40" },
};

export const PAYMENT_META: Record<string, IconMeta> = {
  tng: { bg: "bg-blue-500", ring: "ring-blue-500/40" },
  qr_pay: { bg: "bg-indigo-500", ring: "ring-indigo-500/40" },
  credit_card: { bg: "bg-violet-500", ring: "ring-violet-500/40" },
  cash: { bg: "bg-emerald-600", ring: "ring-emerald-600/40" },
};

const fallbackMeta: IconMeta = { bg: "bg-zinc-500", ring: "ring-zinc-500/40" };

const CATEGORY_GLYPHS: Record<
  string,
  ComponentType<{ size?: number; className?: string }>
> = {
  food_dining: FoodDiningIcon,
  groceries: GroceriesIcon,
  transport: TransportIcon,
  housing: HousingIcon,
  utilities: UtilitiesIcon,
  shopping: ShoppingIcon,
  health: HealthIcon,
  entertainment: EntertainmentIcon,
  education: EducationIcon,
  personal: PersonalIcon,
  subscriptions: SubscriptionsIcon,
  travel: TravelIcon,
  gifts: GiftIcon,
  fees: FeesIcon,
  other_expense: OtherIcon,
  salary: SalaryIcon,
  freelance: FreelanceIcon,
  business: BusinessIcon,
  investments: InvestmentsIcon,
  refunds: RefundsIcon,
  gifts_income: GiftIcon,
  other_income: OtherIcon,
};

const PAYMENT_GLYPHS: Record<
  string,
  ComponentType<{ size?: number; className?: string }>
> = {
  tng: WalletIcon,
  qr_pay: QrPayIcon,
  credit_card: CreditCardIcon,
  cash: CashIcon,
};

export function getCategoryMeta(id: string) {
  return CATEGORY_META[id] ?? fallbackMeta;
}

export function getPaymentMeta(id: string) {
  return PAYMENT_META[id] ?? fallbackMeta;
}

export function CategoryGlyph({
  categoryId,
  size = 20,
  className,
}: {
  categoryId: string;
  size?: number;
  className?: string;
}) {
  const Icon = CATEGORY_GLYPHS[categoryId] ?? OtherIcon;
  return <Icon size={size} className={className} />;
}

export function PaymentGlyph({
  paymentId,
  size = 20,
  className,
}: {
  paymentId: string;
  size?: number;
  className?: string;
}) {
  const Icon = PAYMENT_GLYPHS[paymentId] ?? CashIcon;
  return <Icon size={size} className={className} />;
}

export function CategoryBadge({
  categoryId,
  size = "md",
}: {
  categoryId: string;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const meta = getCategoryMeta(categoryId);
  const dim =
    size === "sm"
      ? "h-8 w-8"
      : size === "lg"
        ? "h-12 w-12"
        : size === "xl"
          ? "h-14 w-14"
          : "h-10 w-10";
  const iconSize =
    size === "sm" ? 16 : size === "lg" ? 24 : size === "xl" ? 28 : 20;
  return (
    <span
      className={`flex ${dim} shrink-0 items-center justify-center rounded-full text-white ${meta.bg}`}
    >
      <CategoryGlyph categoryId={categoryId} size={iconSize} />
    </span>
  );
}

export function PaymentBadge({
  paymentId,
  size = "sm",
}: {
  paymentId: string;
  size?: "sm" | "md";
}) {
  const meta = getPaymentMeta(paymentId);
  const dim = size === "md" ? "h-8 w-8" : "h-5 w-5";
  const iconSize = size === "md" ? 16 : 12;
  return (
    <span
      className={`inline-flex ${dim} shrink-0 items-center justify-center rounded-full text-white ${meta.bg}`}
    >
      <PaymentGlyph paymentId={paymentId} size={iconSize} />
    </span>
  );
}

export { CalendarIcon, ExpenseTypeIcon, IncomeTypeIcon };
export type { CategoryId, PaymentMethodId };
