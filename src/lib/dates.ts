const TIMEZONE = "Asia/Tbilisi";

// Returns "YYYY-MM-DD" for the given instant, in the company's local timezone.
export function toTbilisiDateString(instant: Date): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(instant);
}

// Returns a UTC-midnight Date representing the given "YYYY-MM-DD" calendar day.
// Used as the value of AttendanceRecord.date so that one row = one calendar day.
export function dateStringToUtcMidnight(dateString: string): Date {
  return new Date(`${dateString}T00:00:00.000Z`);
}

export function todayAsUtcMidnight(): Date {
  return dateStringToUtcMidnight(toTbilisiDateString(new Date()));
}

export function toTbilisiTimeString(instant: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(instant);
}

export function toTbilisiShortTimeString(instant: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(instant);
}
