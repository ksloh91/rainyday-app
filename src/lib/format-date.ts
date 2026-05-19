const locale = "en-MY";

export function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isToday(date: Date) {
  return isSameDay(date, new Date());
}

/** Monday-start week (common for MY). */
export function startOfWeek(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function isInWeekContaining(date: Date, weekStart: Date) {
  const end = new Date(weekStart);
  end.setDate(end.getDate() + 7);
  return date >= weekStart && date < end;
}

export function isThisWeek(date: Date, now = new Date()) {
  return isInWeekContaining(date, startOfWeek(now));
}

export function isLastWeek(date: Date, now = new Date()) {
  const lastStart = startOfWeek(now);
  lastStart.setDate(lastStart.getDate() - 7);
  return isInWeekContaining(date, lastStart);
}

export function isThisMonth(date: Date, now = new Date()) {
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth()
  );
}

export function formatWeekRange(now = new Date()) {
  const start = startOfWeek(now);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const fmt = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
  });
  return `${fmt.format(start)} – ${fmt.format(end)}`;
}

export function formatMonthLabel(now = new Date()) {
  return new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(
    now,
  );
}

export function isYesterday(date: Date) {
  const y = new Date();
  y.setDate(y.getDate() - 1);
  return isSameDay(date, y);
}

export function dayKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatTodayHeader(date = new Date()) {
  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatDayNumber(date: Date) {
  return String(date.getDate()).padStart(2, "0");
}

export function formatDayWeekday(date: Date) {
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return new Intl.DateTimeFormat(locale, { weekday: "long" }).format(date);
}

export function formatMonthYear(date: Date) {
  return new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatTime(date: Date) {
  return new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

export function formatMoney(
  amount: number,
  opts?: { signed?: boolean; currency?: string },
) {
  const currency = opts?.currency ?? "MYR";
  const prefix = currency === "MYR" ? "RM" : currency;
  const abs = Math.abs(amount).toFixed(2);
  if (!opts?.signed) return `${prefix} ${abs}`;
  if (amount > 0) return `+${prefix} ${abs}`;
  if (amount < 0) return `−${prefix} ${abs}`;
  return `${prefix} ${abs}`;
}
