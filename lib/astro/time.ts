import { DateTime } from "luxon";

export interface TimeInput {
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:mm"
  tz: string; // IANA zone, e.g. "Asia/Kolkata"
}

// Convert local civil birth date/time (in its IANA zone, including historical
// DST/offset rules) to a Julian Day in Universal Time for Swiss Ephemeris.
export function toJulianDayUT(input: TimeInput): {
  jdUT: number;
  utc: string;
  offsetMinutes: number;
} {
  const [y, m, d] = input.date.split("-").map(Number);
  const [hh, mm] = input.time.split(":").map(Number);

  const local = DateTime.fromObject(
    { year: y, month: m, day: d, hour: hh, minute: mm },
    { zone: input.tz },
  );
  if (!local.isValid) {
    throw new Error(`Invalid date/time/zone: ${local.invalidReason}`);
  }
  const u = local.toUTC();
  const hourDecimal = u.hour + u.minute / 60 + u.second / 3600;

  // Swiss Ephemeris swe_julday with Gregorian flag, input treated as UT.
  const A = Math.floor((14 - u.month) / 12);
  const Y = u.year + 4800 - A;
  const M = u.month + 12 * A - 3;
  const jdn =
    u.day +
    Math.floor((153 * M + 2) / 5) +
    365 * Y +
    Math.floor(Y / 4) -
    Math.floor(Y / 100) +
    Math.floor(Y / 400) -
    32045;
  const jdUT = jdn + (hourDecimal - 12) / 24;

  return {
    jdUT,
    utc: u.toISO() ?? "",
    offsetMinutes: local.offset,
  };
}
