export function formatClockTime(dateValue: string): string {
  const date = new Date(dateValue);
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export function formatDisplayDate(dateValue: string): string {
  const date = parseDisplayDate(dateValue);
  return date.toLocaleDateString([], { year: "numeric", month: "long", day: "numeric" });
}

export function formatShortUserStamp(dateValue?: string, userName?: string): string {
  if (!dateValue || !userName) {
    return "";
  }

  return `${userName} ${formatClockTime(dateValue)}`;
}

function parseDisplayDate(dateValue: string): Date {
  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateValue.trim());

  if (!dateOnlyMatch) {
    return new Date(dateValue);
  }

  const [, yearText, monthText, dayText] = dateOnlyMatch;
  return new Date(Number(yearText), Number(monthText) - 1, Number(dayText));
}
