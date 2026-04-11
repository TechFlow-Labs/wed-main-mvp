/**
 * Local calendar date as YYYY-MM-DD (no UTC shift — avoids toISOString() off-by-one).
 */
export function toLocalYmd(d: Date): string {
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  return `${y}-${pad(m)}-${pad(day)}`;
}

/**
 * OpenAPI date-time for "the day the user picked" on the calendar.
 * Uses local Y/M/D + fixed noon UTC so the UTC date part always matches that day (no next/prev day drift).
 */
export function localCalendarDateToEventIso(d: Date): string {
  return `${toLocalYmd(d)}T12:00:00.000Z`;
}
