/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Temporal } from '@js-temporal/polyfill';

/* ------------------------------------------------------------------------ */
/* Constants                                                                */
/* ------------------------------------------------------------------------ */
const MS = {
  millisecond: 1,
  second: 1_000,
  minute: 60_000,
  hour: 3_600_000,
  day: 86_400_000,
  week: 604_800_000          // 7 × 24 h
} as const;

/* ------------------------------------------------------------------------ */
/* Helpers                                                                  */
/* ------------------------------------------------------------------------ */
/**
 * Ensures a value is a finite number (integers or decimals).
 * Throws a descriptive error with the caller's name on failure.
 */
function assertFiniteNumber(value: number, caller: string): void {
  if (!Number.isFinite(value)) {
    throw new Error(`${caller}: value must be a finite number`);
  }
  if (!Number.isSafeInteger(Math.trunc(value))) {
    throw new Error(`${caller}: absolute value exceeds safe range`);
  }
}

/**
 * Ensures a value is a finite, safe integer (no decimals).
 * Used by calendar-aware operations which must receive whole units.
 */
function assertSafeInt(value: number, caller: string): void {
  if (!Number.isFinite(value)) {
    throw new Error(`${caller}: value must be a finite integer`);
  }
  if (!Number.isInteger(value)) {
    throw new Error(`${caller}: value must be an integer (no decimals)`);
  }
  if (!Number.isSafeInteger(value)) {
    throw new Error(`${caller}: value exceeds safe integer range`);
  }
}

/**
 * Builder for creating and manipulating fixed-duration time periods.
 * All calculations use fixed conversion rates (e.g., 1 week = 7 days = 168 hours).
 */
class DurationBuilder {
  private total = 0;                        /* ms */
  private add(ms: number) { this.total += ms; return this; }

  /**
   * Sets or gets the number of weeks.
   * @param n - Number of weeks to set (optional)
   * @returns If n is provided: chainable time object for further operations. If n is omitted: current weeks as number
   * @example
   * weeks(2).days() // Returns 14 (2 weeks = 14 days)
   * weeks(2).days(1).weeks() // Returns ~2.14 (2 weeks + 1 day)
   */
  weeks(n: number): DurationBuilder; weeks(): number;
  weeks(n?: number): any { return n === undefined ? this.total / MS.week
                                                  : (assertFiniteNumber(n, 'weeks'), this.add(n * MS.week)); }

  /**
   * Sets or gets the number of days.
   * @param n - Number of days to set (optional)
   * @returns If n is provided: chainable time object for further operations. If n is omitted: current days as number
   * @example
   * days(7).hours() // Returns 168 (7 days = 168 hours)
   * days(1).hours(12).days() // Returns 1.5 (1.5 days)
   */
  days(n: number): DurationBuilder; days(): number;
  days(n?: number): any { return n === undefined ? this.total / MS.day
                                                 : (assertFiniteNumber(n, 'days'), this.add(n * MS.day)); }

  /**
   * Sets or gets the number of hours.
   * @param n - Number of hours to set (optional)
   * @returns If n is provided: chainable time object for further operations. If n is omitted: current hours as number
   * @example
   * hours(24).days() // Returns 1 (24 hours = 1 day)
   * hours(1).minutes(30).hours() // Returns 1.5 (1.5 hours)
   */
  hours(n: number): DurationBuilder; hours(): number;
  hours(n?: number): any { return n === undefined ? this.total / MS.hour
                                                  : (assertFiniteNumber(n, 'hours'), this.add(n * MS.hour)); }

  /**
   * Sets or gets the number of minutes.
   * @param n - Number of minutes to set (optional)
   * @returns If n is provided: chainable time object for further operations. If n is omitted: current minutes as number
   * @example
   * minutes(60).hours() // Returns 1 (60 minutes = 1 hour)
   * minutes(30).seconds(30).minutes() // Returns 30.5 (30.5 minutes)
   */
  minutes(n: number): DurationBuilder; minutes(): number;
  minutes(n?: number): any { return n === undefined ? this.total / MS.minute
                                                    : (assertFiniteNumber(n, 'minutes'), this.add(n * MS.minute)); }

  /**
   * Sets or gets the number of seconds.
   * @param n - Number of seconds to set (optional)
   * @returns If n is provided: chainable time object for further operations. If n is omitted: current seconds as number
   * @example
   * seconds(60).minutes() // Returns 1 (60 seconds = 1 minute)
   * seconds(30).milliseconds(500).seconds() // Returns 30.5 (30.5 seconds)
   */
  seconds(n: number): DurationBuilder; seconds(): number;
  seconds(n?: number): any { return n === undefined ? this.total / MS.second
                                                    : (assertFiniteNumber(n, 'seconds'), this.add(n * MS.second)); }

  /**
   * Sets or gets the number of milliseconds.
   * @param n - Number of milliseconds to set (optional)
   * @returns If n is provided: chainable time object for further operations. If n is omitted: current milliseconds as number
   * @example
   * milliseconds(1000).seconds() // Returns 1 (1000ms = 1 second)
   * milliseconds(500).seconds(1).milliseconds() // Returns 1500 (1.5 seconds)
   */
  milliseconds(n: number): DurationBuilder; milliseconds(): number;
  milliseconds(n?: number): any { return n === undefined ? this.total
                                                         : (assertFiniteNumber(n, 'milliseconds'), this.add(n)); }
}

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

/* ------------------------------------------------------------------------ */
/* 2) Relative builder: calendar-aware (uses Temporal)                      */
/* ------------------------------------------------------------------------ */
interface Offsets {
  years: number; months: number; days: number;
  hours: number; minutes: number; seconds: number; milliseconds: number;
}
const ZERO: Offsets = { years:0, months:0, days:0, hours:0,
                        minutes:0, seconds:0, milliseconds:0 };

/**
 * Builder for calendar-aware date/time calculations relative to an anchor date.
 * Handles complex calendar arithmetic including leap years, varying month lengths,
 * and daylight saving time transitions using the Temporal API.
 */
class RelativeBuilder {
  private readonly anchorPlain: Temporal.PlainDateTime;   /* UTC */
  private readonly anchorMs: number;
  private readonly off: Offsets;

  constructor(anchor: Date | Temporal.PlainDateTime,
              off: Offsets = { ...ZERO }) {
    if (anchor instanceof Date) {
      const inst = Temporal.Instant.fromEpochMilliseconds(anchor.getTime());
      this.anchorPlain = inst.toZonedDateTimeISO('UTC').toPlainDateTime();
      this.anchorMs = anchor.getTime();
    } else {
      this.anchorPlain = anchor;
      this.anchorMs = Number(
        anchor.toZonedDateTime('UTC').toInstant().epochMilliseconds
      );
    }
    this.off = off;
  }

  private plus(patch: Partial<Offsets>) {
    return new RelativeBuilder(this.anchorPlain, { ...this.off, ...patch });
  }

  private targetPlain(): Temporal.PlainDateTime {
    let result = this.anchorPlain;
    
    // Apply each offset individually to handle mixed signs
    // Temporal does not support mixed-sign offsets in a single operation
    const offsetOrder: (keyof Offsets)[] = [
      'years', 'months', 'days', 'hours', 'minutes', 'seconds', 'milliseconds'
    ];

    for (const unit of offsetOrder) {
      const value = this.off[unit];
      if (value !== 0) {
        result = result.add({ [unit]: value });
      }
    }
    
    return result;
  }

  private deltaMs(): number {
    const tgtMs = Number(
      this.targetPlain()
          .toZonedDateTime('UTC')
          .toInstant().epochMilliseconds
    );
    return tgtMs - this.anchorMs;
  }

  /* ─ fractional helpers ─ */
  private monthsFraction(): number {
    const target = this.targetPlain();
    const diff = this.anchorPlain.until(target, { largestUnit: 'months' });
    const whole = diff.years * 12 + diff.months;

    if (diff.days   | diff.hours | diff.minutes |
        diff.seconds | diff.milliseconds) {
      const anchorPlusWhole = this.anchorPlain.add({ months: whole });
      const rem = anchorPlusWhole.until(target, { largestUnit: 'days' });
      const dim = anchorPlusWhole.daysInMonth;
      const frac =
        (rem.days / dim) +
        (rem.hours * MS.hour) / (dim * MS.day) +
        (rem.minutes * MS.minute) / (dim * MS.day) +
        (rem.seconds * MS.second) / (dim * MS.day) +
        (rem.milliseconds) / (dim * MS.day);

      return whole + frac;
    }
    return whole;
  }

  private yearsFraction(): number { return this.monthsFraction() / 12; }

  /**
   * Adds years to the calculation or gets the current years difference.
   * Calendar-aware: handles leap years and varying month lengths.
   * @param n - Number of years to add (optional)
   * @returns If n is provided: chainable date object for further calculations. If n is omitted: current years difference as number
   * @example
   * fromDate('2020-02-29').years(1) // Handles leap year correctly
   * fromDate('2020-01-01').years(2).years() // Returns 2
   */
  years(n: number): RelativeBuilder; years(): number;
  years(n?: number): any {
    return n === undefined ? this.yearsFraction()
                           : (assertSafeInt(n, 'years'), this.plus({ years: this.off.years + n }));
  }

  /**
   * Adds months to the calculation or gets the current months difference.
   * Calendar-aware: handles varying month lengths (28-31 days).
   * @param n - Number of months to add (optional)
   * @returns If n is provided: chainable date object for further calculations. If n is omitted: current months difference as number
   * @example
   * fromDate('2021-01-31').months(1) // Correctly handles Jan 31 → Feb 28
   * fromDate('2021-01-01').months(6).months() // Returns 6
   */
  months(n: number): RelativeBuilder; months(): number;
  months(n?: number): any {
    return n === undefined ? this.monthsFraction()
                           : (assertSafeInt(n, 'months'), this.plus({ months: this.off.months + n }));
  }

  /**
   * Adds weeks to the calculation or gets the current weeks difference.
   * @param n - Number of weeks to add (optional)
   * @returns If n is provided: chainable date object for further calculations. If n is omitted: current weeks difference as number
   * @example
   * fromDate('2023-01-01').weeks(2).days() // Returns 14 (2 weeks = 14 days)
   * fromDate('2023-01-01').days(14).weeks() // Returns 2
   */
  weeks(n: number): RelativeBuilder; weeks(): number;
  weeks(n?: number): any {
    return n === undefined ? this.deltaMs() / MS.week
                           : (assertSafeInt(n, 'weeks'), this.plus({ days: this.off.days + n * 7 }));
  }

  /**
   * Adds days to the calculation or gets the current days difference.
   * @param n - Number of days to add (optional)
   * @returns If n is provided: chainable date object for further calculations. If n is omitted: current days difference as number
   * @example
   * fromDate('2023-01-01').days(7).weeks() // Returns 1 (7 days = 1 week)
   * fromDate('2023-01-01').weeks(1).days() // Returns 7
   */
  days(n: number): RelativeBuilder; days(): number;
  days(n?: number): any {
    return n === undefined ? this.deltaMs() / MS.day
                           : (assertSafeInt(n, 'days'), this.plus({ days: this.off.days + n }));
  }

  /**
   * Adds hours to the calculation or gets the current hours difference.
   * @param n - Number of hours to add (optional)
   * @returns If n is provided: chainable date object for further calculations. If n is omitted: current hours difference as number
   * @example
   * fromDate('2023-01-01T00:00:00Z').hours(24).days() // Returns 1 (24 hours = 1 day)
   * fromDate('2023-01-01T00:00:00Z').days(1).hours() // Returns 24
   */
  hours(n: number): RelativeBuilder; hours(): number;
  hours(n?: number): any {
    return n === undefined ? this.deltaMs() / MS.hour
                           : (assertSafeInt(n, 'hours'), this.plus({ hours: this.off.hours + n }));
  }

  /**
   * Adds minutes to the calculation or gets the current minutes difference.
   * @param n - Number of minutes to add (optional)
   * @returns If n is provided: chainable date object for further calculations. If n is omitted: current minutes difference as number
   * @example
   * fromDate('2023-01-01T00:00:00Z').minutes(60).hours() // Returns 1 (60 minutes = 1 hour)
   * fromDate('2023-01-01T00:00:00Z').hours(1).minutes() // Returns 60
   */
  minutes(n: number): RelativeBuilder; minutes(): number;
  minutes(n?: number): any {
    return n === undefined ? this.deltaMs() / MS.minute
                           : (assertSafeInt(n, 'minutes'), this.plus({ minutes: this.off.minutes + n }));
  }

  /**
   * Adds seconds to the calculation or gets the current seconds difference.
   * @param n - Number of seconds to add (optional)
   * @returns If n is provided: chainable date object for further calculations. If n is omitted: current seconds difference as number
   * @example
   * fromDate('2023-01-01T00:00:00Z').seconds(60).minutes() // Returns 1 (60 seconds = 1 minute)
   * fromDate('2023-01-01T00:00:00Z').minutes(1).seconds() // Returns 60
   */
  seconds(n: number): RelativeBuilder; seconds(): number;
  seconds(n?: number): any {
    return n === undefined ? this.deltaMs() / MS.second
                           : (assertSafeInt(n, 'seconds'), this.plus({ seconds: this.off.seconds + n }));
  }

  /**
   * Adds milliseconds to the calculation or gets the current milliseconds difference.
   * @param n - Number of milliseconds to add (optional)
   * @returns If n is provided: chainable date object for further calculations. If n is omitted: current milliseconds difference as number
   * @example
   * fromDate('2023-01-01T00:00:00Z').milliseconds(1000).seconds() // Returns 1 (1000ms = 1 second)
   * fromDate('2023-01-01T00:00:00Z').seconds(1).milliseconds() // Returns 1000
   */
  milliseconds(n: number): RelativeBuilder; milliseconds(): number;
  milliseconds(n?: number): any {
    return n === undefined ? this.deltaMs()
                           : (assertSafeInt(n, 'milliseconds'), this.plus({ milliseconds: this.off.milliseconds + n }));
  }

  /**
   * Gets the final calculated timestamp in milliseconds since Unix epoch.
   * @returns The calculated timestamp as a number
   * @example
   * fromDate('2023-01-01T00:00:00Z').days(1).timestamp() // Returns timestamp for 2023-01-02
   * new Date(fromDate('2023-01-01').months(6).timestamp()) // Convert back to Date
   */
  timestamp() { return this.deltaMs() + this.anchorMs; }
}

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
