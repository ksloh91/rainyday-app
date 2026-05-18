import { SvgIcon } from "@/components/icons/svg-icon";

type GlyphProps = { size?: number; className?: string };

export function WalletIcon({ size, className }: GlyphProps) {
  return (
    <SvgIcon size={size} className={className}>
      <rect x="3" y="6" width="18" height="14" rx="2" />
      <path d="M17 12h.01M3 10h18" />
    </SvgIcon>
  );
}

export function QrPayIcon({ size, className }: GlyphProps) {
  return (
    <SvgIcon size={size} className={className}>
      <rect x="4" y="4" width="7" height="7" rx="1" />
      <rect x="13" y="4" width="7" height="7" rx="1" />
      <rect x="4" y="13" width="7" height="7" rx="1" />
      <path d="M15 15h2M19 15h1M15 19h4" />
    </SvgIcon>
  );
}

export function CreditCardIcon({ size, className }: GlyphProps) {
  return (
    <SvgIcon size={size} className={className}>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M3 10h18M7 15h4" />
    </SvgIcon>
  );
}

export function CashIcon({ size, className }: GlyphProps) {
  return (
    <SvgIcon size={size} className={className}>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M7 9h.01M17 9h.01M7 15h.01M17 15h.01" />
    </SvgIcon>
  );
}

export function ExpenseTypeIcon({ size, className }: GlyphProps) {
  return (
    <SvgIcon size={size} className={className}>
      <path d="M5 12h14" />
    </SvgIcon>
  );
}

export function IncomeTypeIcon({ size, className }: GlyphProps) {
  return (
    <SvgIcon size={size} className={className}>
      <path d="M12 5v14M5 12h14" />
    </SvgIcon>
  );
}

export function CalendarIcon({ size, className }: GlyphProps) {
  return (
    <SvgIcon size={size} className={className}>
      <rect x="4" y="5" width="16" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M4 10h16" />
    </SvgIcon>
  );
}
