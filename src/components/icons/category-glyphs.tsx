import { SvgIcon } from "@/components/icons/svg-icon";

type GlyphProps = { size?: number; className?: string };

export function FoodDiningIcon({ size, className }: GlyphProps) {
  return (
    <SvgIcon size={size} className={className}>
      <path d="M4 3v7M8 3v7M4 10c0 2.5 2 4 4 4s4-1.5 4-4M16 3v18M20 3v18" />
    </SvgIcon>
  );
}

export function GroceriesIcon({ size, className }: GlyphProps) {
  return (
    <SvgIcon size={size} className={className}>
      <path d="M6 7h15l-1.5 9h-12L6 7zM6 7 5 3H2" />
      <circle cx="9" cy="20" r="1" />
      <circle cx="18" cy="20" r="1" />
    </SvgIcon>
  );
}

export function TransportIcon({ size, className }: GlyphProps) {
  return (
    <SvgIcon size={size} className={className}>
      <path d="M5 16h14" />
      <path d="M6.5 16 8 11h8l1.5 5" />
      <path d="M8 11l1.5-3h5L16 11" />
      <circle cx="7.5" cy="16" r="1.25" fill="currentColor" stroke="none" />
      <circle cx="16.5" cy="16" r="1.25" fill="currentColor" stroke="none" />
    </SvgIcon>
  );
}

export function HousingIcon({ size, className }: GlyphProps) {
  return (
    <SvgIcon size={size} className={className}>
      <path d="M4 11 12 4l8 7M6 10v9h12v-9" />
    </SvgIcon>
  );
}

export function UtilitiesIcon({ size, className }: GlyphProps) {
  return (
    <SvgIcon size={size} className={className}>
      <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />
    </SvgIcon>
  );
}

export function ShoppingIcon({ size, className }: GlyphProps) {
  return (
    <SvgIcon size={size} className={className}>
      <path d="M6 7h15l-1.5 9h-12L6 7zM9 11V6a3 3 0 0 1 6 0v5" />
    </SvgIcon>
  );
}

export function HealthIcon({ size, className }: GlyphProps) {
  return (
    <SvgIcon size={size} className={className}>
      <path d="M12 21s-6-4.35-6-9a4 4 0 0 1 8 0c0 4.65-6 9-6 9z" />
    </SvgIcon>
  );
}

export function EntertainmentIcon({ size, className }: GlyphProps) {
  return (
    <SvgIcon size={size} className={className}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m10 10 5 3-5 3V10z" />
    </SvgIcon>
  );
}

export function EducationIcon({ size, className }: GlyphProps) {
  return (
    <SvgIcon size={size} className={className}>
      <path d="M12 3 2 8l10 5 10-5-10-5zM4 10v6M20 10v6M12 13v6" />
    </SvgIcon>
  );
}

export function PersonalIcon({ size, className }: GlyphProps) {
  return (
    <SvgIcon size={size} className={className}>
      <circle cx="12" cy="8" r="4" />
      <path d="M5 21v-1a5 5 0 0 1 10 0v1" />
    </SvgIcon>
  );
}

export function SubscriptionsIcon({ size, className }: GlyphProps) {
  return (
    <SvgIcon size={size} className={className}>
      <path d="M4 12a8 8 0 0 1 16 0M12 4v4M12 16v4" />
      <path d="M12 12h.01" />
    </SvgIcon>
  );
}

export function TravelIcon({ size, className }: GlyphProps) {
  return (
    <SvgIcon size={size} className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </SvgIcon>
  );
}

export function GiftIcon({ size, className }: GlyphProps) {
  return (
    <SvgIcon size={size} className={className}>
      <rect x="4" y="10" width="16" height="10" rx="1" />
      <path d="M12 10V20M4 10h16M8 10c-2 0-3-1.5-3-3s2-3 4-1M16 10c2 0 3-1.5 3-3s-2-3-4-1" />
    </SvgIcon>
  );
}

export function FeesIcon({ size, className }: GlyphProps) {
  return (
    <SvgIcon size={size} className={className}>
      <path d="M7 7h10M7 12h10M7 17h6" />
      <rect x="4" y="4" width="16" height="16" rx="2" />
    </SvgIcon>
  );
}

export function SalaryIcon({ size, className }: GlyphProps) {
  return (
    <SvgIcon size={size} className={className}>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <circle cx="12" cy="12" r="2" />
      <path d="M7 10h.01M17 10h.01" />
    </SvgIcon>
  );
}

export function FreelanceIcon({ size, className }: GlyphProps) {
  return (
    <SvgIcon size={size} className={className}>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 4 0v2" />
    </SvgIcon>
  );
}

export function BusinessIcon({ size, className }: GlyphProps) {
  return (
    <SvgIcon size={size} className={className}>
      <path d="M4 20V9l8-4 8 4v11" />
      <path d="M9 20v-5h6v5M9 12h6" />
    </SvgIcon>
  );
}

export function InvestmentsIcon({ size, className }: GlyphProps) {
  return (
    <SvgIcon size={size} className={className}>
      <path d="M4 18V8M10 18V4M16 18v-6M22 18H2" />
    </SvgIcon>
  );
}

export function RefundsIcon({ size, className }: GlyphProps) {
  return (
    <SvgIcon size={size} className={className}>
      <path d="M4 12a8 8 0 0 1 13.5-5.5M20 8v4h-4" />
    </SvgIcon>
  );
}

export function OtherIcon({ size, className }: GlyphProps) {
  return (
    <SvgIcon size={size} className={className}>
      <circle cx="6" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="18" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </SvgIcon>
  );
}
