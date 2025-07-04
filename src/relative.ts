import { Temporal } from '@js-temporal/polyfill';
import { MS } from './constants.js';
import { assertSafeInt } from './utils.js';

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
export class RelativeBuilder {
  private readonly anchorPlain: Temporal.PlainDateTime;   /* UTC */
  private readonly anchorMs: number;
  private readonly off: Offsets;

  constructor (anchor: Date | Temporal.PlainDateTime,
    off: Offsets = { ...ZERO }) {
    if (anchor instanceof Date) {
      const inst = Temporal.Instant.fromEpochMilliseconds(anchor.getTime());
      this.anchorPlain = inst.toZonedDateTimeISO('UTC').toPlainDateTime();
      this.anchorMs = anchor.getTime();
    } else {
      this.anchorPlain = anchor;
      this.anchorMs = Number(
        anchor.toZonedDateTime('UTC').toInstant().epochMilliseconds,
      );
    }
    this.off = off;
  }

  private plus (patch: Partial<Offsets>) {
    return new RelativeBuilder(this.anchorPlain, { ...this.off, ...patch });
  }

  private targetPlain (): Temporal.PlainDateTime {
    let result = this.anchorPlain;

    // Apply each offset individually to handle mixed signs
    // Temporal does not support mixed-sign offsets in a single operation
    const offsetOrder: (keyof Offsets)[] = [
      'years', 'months', 'days', 'hours', 'minutes', 'seconds', 'milliseconds',
    ];

    for (const unit of offsetOrder) {
      const value = this.off[unit];
      if (value !== 0) {
        result = result.add({ [unit]: value });
      }
    }

    return result;
  }

  private deltaMs (): number {
    const tgtMs = Number(
      this.targetPlain()
        .toZonedDateTime('UTC')
        .toInstant().epochMilliseconds,
    );
    return tgtMs - this.anchorMs;
  }

  /* ─ fractional helpers ─ */
  private monthsFraction (): number {
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

  private yearsFraction (): number { return this.monthsFraction() / 12; }

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
  years (n?: number): RelativeBuilder | number {
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
  months (n?: number): RelativeBuilder | number {
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
  weeks (n?: number): RelativeBuilder | number {
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
  days (n?: number): RelativeBuilder | number {
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
  hours (n?: number): RelativeBuilder | number {
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
  minutes (n?: number): RelativeBuilder | number {
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
  seconds (n?: number): RelativeBuilder | number {
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
  milliseconds (n?: number): RelativeBuilder | number {
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
  timestamp () { return this.deltaMs() + this.anchorMs; }
}
