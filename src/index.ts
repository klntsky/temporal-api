import { DurationBuilder } from './duration.js';
import { RelativeBuilder } from './relative.js';
import { assertSafeInt } from './utils.js';

/**
 * Creates a time duration starting with the specified number of weeks.
 * @param n - Number of weeks (default: 1)
 * @returns Chainable time object for building complex durations
 * @example
 * weeks(2).days() // Returns 14 (2 weeks = 14 days)
 * weeks().hours(24).weeks() // Returns ~1.14 (1 week + 24 hours)
 */
export const weeks        = (n = 1) => new DurationBuilder().weeks(n);

/**
 * Creates a time duration starting with the specified number of days.
 * @param n - Number of days (default: 1)
 * @returns Chainable time object for building complex durations
 * @example
 * days(7).weeks() // Returns 1 (7 days = 1 week)
 * days().hours(12).days() // Returns 1.5 (1.5 days)
 */
export const days         = (n = 1) => new DurationBuilder().days(n);

/**
 * Creates a time duration starting with the specified number of hours.
 * @param n - Number of hours (default: 1)
 * @returns Chainable time object for building complex durations
 * @example
 * hours(24).days() // Returns 1 (24 hours = 1 day)
 * hours().minutes(30).hours() // Returns 1.5 (1.5 hours)
 */
export const hours        = (n = 1) => new DurationBuilder().hours(n);

/**
 * Creates a time duration starting with the specified number of minutes.
 * @param n - Number of minutes (default: 1)
 * @returns Chainable time object for building complex durations
 * @example
 * minutes(60).hours() // Returns 1 (60 minutes = 1 hour)
 * minutes().seconds(30).minutes() // Returns 1.5 (1.5 minutes)
 */
export const minutes      = (n = 1) => new DurationBuilder().minutes(n);

/**
 * Creates a time duration starting with the specified number of seconds.
 * @param n - Number of seconds (default: 1)
 * @returns Chainable time object for building complex durations
 * @example
 * seconds(60).minutes() // Returns 1 (60 seconds = 1 minute)
 * seconds().milliseconds(500).seconds() // Returns 1.5 (1.5 seconds)
 */
export const seconds      = (n = 1) => new DurationBuilder().seconds(n);

/**
 * Creates a time duration starting with the specified number of milliseconds.
 * @param n - Number of milliseconds (default: 1)
 * @returns Chainable time object for building complex durations
 * @example
 * milliseconds(1000).seconds() // Returns 1 (1000ms = 1 second)
 * milliseconds().seconds(1).milliseconds() // Returns 1001 (1001ms)
 */
export const milliseconds = (n = 1) => new DurationBuilder().milliseconds(n);

/**
 * Creates a calendar-aware date calculation from a date, timestamp, or ISO string
 * @param d - Date object, timestamp (number), or ISO date string
 * @returns Chainable date object for calendar-aware calculations
 * @throws {Error} When input is not a valid date format or represents an invalid date
 * @example
 * fromDate(new Date('2023-01-01')).days(7) // Using Date object
 * fromDate(1672531200000).weeks(2) // Using timestamp
 * fromDate('2023-01-01T00:00:00Z').months(3) // Using ISO string
 */
export const fromDate = (d: Date | number | string): RelativeBuilder => {
  let date: Date;

  if (d instanceof Date) {
    date = new Date(d);
  } else if (typeof d === 'number') {
    assertSafeInt(d, 'fromDate');
    date = new Date(d);
  } else if (typeof d === 'string') {
    date = new Date(d);
  } else {
    throw new Error('fromDate: Input must be a Date object, timestamp (number), or ISO date string');
  }

  if (isNaN(date.getTime())) {
    throw new Error('fromDate: Invalid date input');
  }

  return new RelativeBuilder(date);
};

/**
 * Creates a calendar-aware date calculation anchored to the current date and time.
 * @returns Chainable date object for calendar-aware calculations from now
 * @example
 * fromNow().days(7) // 7 days from now
 * fromNow().months(-1) // 1 month ago
 * fromNow().years(1).timestamp() // Timestamp for 1 year from now
 */
export const fromNow = () => fromDate(new Date());
