/**
 * Backend stores datetimes as naive ISO strings (wall-clock, no timezone).
 * Avoid Date#toISOString and UTC formatters — they shift values by the local offset.
 */
const NAIVE_DATETIME_PARTS =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?$/;

export type NaiveDateTimeParts = {
  year: number;
  month: number;
  day: number;
  hours: number;
  minutes: number;
  seconds: number;
};

export function parseNaiveDateTimeParts(dateStr: string): NaiveDateTimeParts | null {
  const match = dateStr?.trim().match(NAIVE_DATETIME_PARTS);
  if (!match) return null;
  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
    hours: Number(match[4]),
    minutes: Number(match[5]),
    seconds: Number(match[6] ?? "0"),
  };
}

/** YYYY-MM-DDTHH:mm for DateTimePicker / datetime-local inputs */
export function toPickerDateTimeValue(dateStr: string): string {
  const parts = parseNaiveDateTimeParts(dateStr);
  if (!parts) return dateStr ? dateStr.slice(0, 16) : "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}T${pad(parts.hours)}:${pad(parts.minutes)}`;
}

/** YYYY-MM-DDTHH:mm:ss for API payloads (no timezone conversion) */
export function toNaiveApiDateTime(dateStr: string): string {
  if (!dateStr) return "";
  const parts = parseNaiveDateTimeParts(dateStr);
  if (!parts) return dateStr;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}T${pad(parts.hours)}:${pad(parts.minutes)}:${pad(parts.seconds)}`;
}

export function naiveDateTimeToDate(dateStr: string): Date | null {
  const parts = parseNaiveDateTimeParts(dateStr);
  if (!parts) {
    const fallback = new Date(dateStr);
    return Number.isNaN(fallback.getTime()) ? null : fallback;
  }
  return new Date(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hours,
    parts.minutes,
    parts.seconds,
  );
}

export function formatNaiveDateTime(
  dateStr: string | undefined,
  locale: string,
  options?: Intl.DateTimeFormatOptions,
): string {
  if (!dateStr) return "";
  const date = naiveDateTimeToDate(dateStr);
  if (!date) return dateStr;
  return date.toLocaleString(locale, options);
}

export function compareNaiveDateTimes(a: string, b: string): number {
  return toNaiveApiDateTime(a).localeCompare(toNaiveApiDateTime(b));
}
