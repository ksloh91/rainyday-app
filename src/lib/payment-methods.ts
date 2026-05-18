export const PAYMENT_METHODS = [
  { id: "tng", label: "Touch ’n Go / TNG" },
  { id: "qr_pay", label: "QR Pay" },
  { id: "credit_card", label: "Credit card" },
  { id: "cash", label: "Cash" },
] as const;

export type PaymentMethodId = (typeof PAYMENT_METHODS)[number]["id"];

export function getPaymentMethodLabel(id: string): string {
  return PAYMENT_METHODS.find((m) => m.id === id)?.label ?? id;
}
