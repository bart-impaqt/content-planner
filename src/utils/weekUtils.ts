/**
 * Gets the ISO week number for a given date
 */
export function getISOWeek(date: Date): number {
  const target = new Date(date.valueOf());
  const dayNr = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  }
  return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
}

/**
 * Gets the year for ISO week numbering
 */
export function getISOWeekYear(date: Date): number {
  const target = new Date(date.valueOf());
  target.setDate(target.getDate() + 3 - ((date.getDay() + 6) % 7));
  return target.getFullYear();
}

/**
 * Gets current week in YYYY-WW format
 */
export function getCurrentWeekKey(): string {
  const now = new Date();
  const year = getISOWeekYear(now);
  const week = getISOWeek(now);
  return `${year}-${week.toString().padStart(2, "0")}`;
}

/**
 * Generates an array of week keys for a range
 */
export function generateWeekRange(
  startWeek: number,
  startYear: number,
  count: number
): string[] {
  const weeks: string[] = [];
  let currentWeek = startWeek;
  let currentYear = startYear;

  for (let i = 0; i < count; i++) {
    weeks.push(`${currentYear}-${currentWeek.toString().padStart(2, "0")}`);

    currentWeek++;
    if (currentWeek > 52) {
      // Check if the year actually has 53 weeks
      const lastDay = new Date(currentYear, 11, 31);
      const maxWeeks = getISOWeek(lastDay) === 53 ? 53 : 52;

      if (currentWeek > maxWeeks) {
        currentWeek = 1;
        currentYear++;
      }
    }
  }

  return weeks;
}

/**
 * Gets the current week number
 */
export function getCurrentWeek(): number {
  return getISOWeek(new Date());
}

/**
 * Gets the current year for ISO week
 */
export function getCurrentYear(): number {
  return getISOWeekYear(new Date());
}
