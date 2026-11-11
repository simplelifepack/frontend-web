export const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

function zonedParts(value: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
  });
  return Object.fromEntries(formatter.formatToParts(value).map(part => [part.type, part.value]));
}

export function scheduleFields(value?: string | null, timeZone?: string | null) {
  if (!value || !timeZone || value.length === 10) {
    return { date: value?.slice(0, 10) ?? "", time: "", timeZone: timeZone || browserTimeZone };
  }
  const parts = zonedParts(new Date(value), timeZone);
  return { date: [parts.year, parts.month, parts.day].join("-"), time: parts.hour + ":" + parts.minute, timeZone };
}

export function healthTimestamp(date: string, time: string, timeZone: string) {
  if (!time) return date;
  if (!timeZone.trim()) throw new Error("Enter a time zone, such as Asia/Kolkata.");
  const expected = date + "T" + time + ":00";
  const wall = Date.parse(expected + "Z");
  try {
    for (const probe of [wall - 86_400_000, wall + 86_400_000]) {
      const parts = zonedParts(new Date(probe), timeZone.trim());
      const local = [parts.year, parts.month, parts.day].join("-") + "T" + [parts.hour, parts.minute, parts.second].join(":");
      const instant = new Date(wall - (Date.parse(local + "Z") - probe));
      const fields = scheduleFields(instant.toISOString(), timeZone.trim());
      if (fields.date === date && fields.time === time) return instant.toISOString();
    }
  } catch {
    throw new Error("Enter a valid IANA time zone, such as Asia/Kolkata.");
  }
  throw new Error("Choose a time that exists on this date in the selected time zone.");
}

export function displayHealthTime(value: string, timeZone: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short", timeZone }).format(new Date(value)) + " · " + timeZone;
}
