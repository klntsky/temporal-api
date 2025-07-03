import { MS } from './constants.js';
import { assertFiniteNumber } from './utils.js';

/**
 * Builder for creating and manipulating fixed-duration time periods.
 * All calculations use fixed conversion rates (e.g., 1 week = 7 days = 168 hours).
 */
export class DurationBuilder {
  private total = 0;                        /* ms */
  private add (ms: number) { this.total += ms; return this; }

  /**
   * Sets or gets the number of weeks.
   * @param n - Number of weeks to set (optional)
   * @returns If n is provided: chainable time object for further operations. If n is omitted: current weeks as number
   * @example
   * weeks(2).days() // Returns 14 (2 weeks = 14 days)
   * weeks(2).days(1).weeks() // Returns ~2.14 (2 weeks + 1 day)
   */
  weeks(n: number): DurationBuilder; weeks(): number;
  weeks (n?: number): DurationBuilder | number { return n === undefined ? this.total / MS.week
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
  days (n?: number): DurationBuilder | number { return n === undefined ? this.total / MS.day
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
  hours (n?: number): DurationBuilder | number { return n === undefined ? this.total / MS.hour
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
  minutes (n?: number): DurationBuilder | number { return n === undefined ? this.total / MS.minute
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
  seconds (n?: number): DurationBuilder | number { return n === undefined ? this.total / MS.second
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
  milliseconds (n?: number): DurationBuilder | number { return n === undefined ? this.total
    : (assertFiniteNumber(n, 'milliseconds'), this.add(n)); }
}
