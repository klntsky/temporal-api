import { expect } from 'chai';
import {
  weeks, days, hours, minutes, seconds, milliseconds,
  fromDate, fromNow
} from '../src/index.js';

describe('DurationBuilder – weeks()', () => {
  it('weeks(2).days() === 14', () => {
    expect(weeks(2).days()).to.equal(14);
  });

  it('days(14).weeks() === 2', () => {
    expect(days(14).weeks()).to.equal(2);
  });

  it('days(14).weeks() === 2', () => {
    expect(days(15).weeks()).to.equal(15/7);
  });

  it('weeks(1).days(1).weeks() ≅ 1 + 1⁄7', () => {
    expect(weeks(1).days(1).weeks()).to.be.closeTo(1 + 1 / 7, 1e-12);
  });
});

describe('RelativeBuilder – weeks()', () => {
  const anchor = new Date('2025-01-01T00:00:00Z');

  it('fromDate(anchor).weeks(1).days() === 7', () => {
    expect(fromDate(anchor).weeks(1).days()).to.equal(7);
  });

  it('weeks(2).weeks() === 2', () => {
    expect(fromDate(anchor).weeks(2).weeks()).to.equal(2);
  });
});

describe('RelativeBuilder – calendar diff edge-cases', () => {
  it('leap-year stay - years() ≈ 1', () => {
    const y = fromDate(new Date('2020-02-29T00:00:00Z')).years(1).years();
    expect(y).to.be.closeTo(1, 1e-12);
  });

  it('month-end roll-over 31 Jan → 28 Feb', () => {
    const ts = fromDate(new Date('2021-01-31T00:00:00Z'))
                 .months(1)
                 .timestamp();
    expect(new Date(ts).toISOString())
      .to.equal('2021-02-28T00:00:00.000Z');
  });

  it('month-end roll-over 31 Jan → 28 Feb, checking month count', () => {
    expect(fromDate(new Date('2021-01-31T00:00:00Z'))
      .months(1)
      .months())
      .to.equal(1);
  });

  it('month-end roll-over 31 Jan → 28 Feb, checking week count', () => {
    expect(fromDate(new Date('2021-01-31T00:00:00Z'))
      .months(1)
      .weeks())
      .to.equal(4);
    expect(fromDate(new Date('2021-01-31T00:00:00Z'))
      .months(1)
      .days())
      .to.equal(4 * 7);
  });

  it('leap year', () => {
    expect(fromNow()
      .years(4)
      .days())
      .to.equal(365 * 4 + 1); // not precise lol
  });
});

describe('fromDate – input types', () => {
  const testDate = new Date('2023-01-01T00:00:00Z');
  const testTimestamp = testDate.getTime();
  const testISOString = '2023-01-01T00:00:00Z';

  it('accepts Date objects', () => {
    const result = fromDate(testDate).timestamp();
    expect(result).to.equal(testTimestamp);
  });

  it('accepts timestamps (numbers)', () => {
    const result = fromDate(testTimestamp).timestamp();
    expect(result).to.equal(testTimestamp);
  });

  it('accepts ISO strings', () => {
    const result = fromDate(testISOString).timestamp();
    expect(result).to.equal(testTimestamp);
  });

  it('accepts date strings', () => {
    const result = fromDate('2023-01-01').timestamp();
    expect(result).to.equal(testTimestamp);
  });

  it('throws error for invalid strings', () => {
    expect(() => fromDate('invalid-date')).to.throw('fromDate: Invalid date input');
  });

  it('throws error for invalid input types', () => {
    expect(() => fromDate({} as any)).to.throw('fromDate: Input must be a Date object, timestamp (number), or ISO date string');
  });
});

describe('DurationBuilder – negative durations', () => {
  it('negative weeks work correctly', () => {
    expect(weeks(-2).days()).to.equal(-14);
    expect(days(-14).weeks()).to.equal(-2);
  });

  it('negative days work correctly', () => {
    expect(days(-7).hours()).to.equal(-168);
    expect(hours(-168).days()).to.equal(-7);
  });

  it('negative hours work correctly', () => {
    expect(hours(-24).days()).to.equal(-1);
    expect(hours(-1).minutes()).to.equal(-60);
  });

  it('negative minutes work correctly', () => {
    expect(minutes(-60).hours()).to.equal(-1);
    expect(minutes(-30).seconds()).to.equal(-1800);
  });

  it('negative seconds work correctly', () => {
    expect(seconds(-60).minutes()).to.equal(-1);
    expect(seconds(-1).milliseconds()).to.equal(-1000);
  });

  it('negative milliseconds work correctly', () => {
    expect(milliseconds(-1000).seconds()).to.equal(-1);
    expect(milliseconds(-500).seconds(1).milliseconds()).to.equal(500);
  });

  it('mixed positive and negative durations', () => {
    expect(weeks(2).days(-3).days()).to.equal(11); // 14 - 3 = 11
    expect(days(10).hours(-12).hours()).to.equal(228); // 240 - 12 = 228
    expect(hours(5).minutes(-30).minutes()).to.equal(270); // 300 - 30 = 270
  });

  it('negative values can zero out durations', () => {
    expect(weeks(2).weeks(-2).weeks()).to.equal(0);
    expect(days(5).days(-5).hours()).to.equal(0);
    expect(hours(3).hours(-3).minutes()).to.equal(0);
  });

  it('negative values can make durations go negative', () => {
    expect(weeks(1).weeks(-2).weeks()).to.equal(-1);
    expect(days(3).days(-5).days()).to.equal(-2);
    expect(hours(2).hours(-4).hours()).to.equal(-2);
  });
});

describe('RelativeBuilder – negative time travel', () => {
  const baseDate = new Date('2023-06-15T12:00:00Z');

  it('negative years work correctly', () => {
    const result = fromDate(baseDate).years(-2);
    expect(result.years()).to.equal(-2);
    
    const timestamp = result.timestamp();
    const resultDate = new Date(timestamp);
    expect(resultDate.getFullYear()).to.equal(2021);
  });

  it('negative months work correctly', () => {
    const result = fromDate(baseDate).months(-6);
    expect(result.months()).to.equal(-6);
    
    const timestamp = result.timestamp();
    const resultDate = new Date(timestamp);
    expect(resultDate.getMonth()).to.equal(11); // December (0-indexed)
    expect(resultDate.getFullYear()).to.equal(2022);
  });

  it('negative weeks work correctly', () => {
    const result = fromDate(baseDate).weeks(-2);
    expect(result.weeks()).to.equal(-2);
    expect(result.days()).to.equal(-14);
    
    const timestamp = result.timestamp();
    const resultDate = new Date(timestamp);
    expect(resultDate.getDate()).to.equal(1); // June 15 - 14 days = June 1
  });

  it('negative days work correctly', () => {
    const result = fromDate(baseDate).days(-10);
    expect(result.days()).to.equal(-10);
    
    const timestamp = result.timestamp();
    const resultDate = new Date(timestamp);
    expect(resultDate.getDate()).to.equal(5); // June 15 - 10 days = June 5
  });

  it('negative hours work correctly', () => {
    const result = fromDate(baseDate).hours(-6);
    expect(result.hours()).to.equal(-6);
    
    const timestamp = result.timestamp();
    const resultDate = new Date(timestamp);
    expect(resultDate.getUTCHours()).to.equal(6); // 12:00 - 6 hours = 06:00 UTC
  });

  it('negative minutes work correctly', () => {
    const result = fromDate(baseDate).minutes(-30);
    expect(result.minutes()).to.equal(-30);
    
    const timestamp = result.timestamp();
    const resultDate = new Date(timestamp);
    expect(resultDate.getUTCMinutes()).to.equal(30); // 12:00 - 30 min = 11:30 UTC
    expect(resultDate.getUTCHours()).to.equal(11);
  });

  it('negative seconds work correctly', () => {
    const result = fromDate(baseDate).seconds(-45);
    expect(result.seconds()).to.equal(-45);
    
    const timestamp = result.timestamp();
    const resultDate = new Date(timestamp);
    expect(resultDate.getUTCSeconds()).to.equal(15); // :00 - 45 sec = previous minute :15
  });

  it('negative milliseconds work correctly', () => {
    const result = fromDate(baseDate).milliseconds(-500);
    expect(result.milliseconds()).to.equal(-500);
    
    const timestamp = result.timestamp();
    expect(timestamp).to.equal(baseDate.getTime() - 500);
  });

  it('mixed positive and negative operations', () => {
    // Now this should work with sequential application of offsets
    const result = fromDate(baseDate).years(1).months(-3).days(5);
    expect(result.years()).to.be.closeTo(0.76, 0.02); // ~9 months and 5 days, accounting for calendar complexity
    
    const timestamp = result.timestamp();
    const resultDate = new Date(timestamp);
    expect(resultDate.getFullYear()).to.equal(2024);
    expect(resultDate.getMonth()).to.equal(2); // March (0-indexed)
    expect(resultDate.getDate()).to.equal(20); // June 15 + 5 days = June 20, but in March
  });

  it('sequential positive and negative operations', () => {
    // Sequential operations work fine, unlike mixed-sign in single operation
    const result = fromDate(baseDate).years(1).months(-3);
    expect(result.years()).to.be.closeTo(0.75, 0.01); // ~9 months = 0.75 years
    
    const timestamp = result.timestamp();
    const resultDate = new Date(timestamp);
    expect(resultDate.getFullYear()).to.equal(2024);
    expect(resultDate.getMonth()).to.equal(2); // March (0-indexed)
  });

  it('going back across year boundary', () => {
    const newYear = new Date('2023-01-15T00:00:00Z');
    const result = fromDate(newYear).months(-2);
    
    const timestamp = result.timestamp();
    const resultDate = new Date(timestamp);
    expect(resultDate.getFullYear()).to.equal(2022);
    expect(resultDate.getMonth()).to.equal(10); // November (0-indexed)
  });

  it('negative leap year handling', () => {
    const leapDay = new Date('2020-02-29T00:00:00Z');
    const result = fromDate(leapDay).years(-1);
    
    const timestamp = result.timestamp();
    const resultDate = new Date(timestamp);
    expect(resultDate.getFullYear()).to.equal(2019);
    expect(resultDate.getMonth()).to.equal(1); // February
    expect(resultDate.getDate()).to.equal(28); // Feb 28 (no leap day in 2019)
  });

  it('large negative values', () => {
    const result = fromDate(baseDate).years(-100);
    expect(result.years()).to.equal(-100);
    
    const timestamp = result.timestamp();
    const resultDate = new Date(timestamp);
    expect(resultDate.getFullYear()).to.equal(1923);
  });

  it('combinations that zero out', () => {
    const result = fromDate(baseDate).days(5).days(-5);
    expect(result.days()).to.equal(0);
    expect(result.timestamp()).to.equal(baseDate.getTime());
  });

  it('combinations that go negative overall', () => {
    const result = fromDate(baseDate).days(3).days(-10);
    expect(result.days()).to.equal(-7);
    
    const timestamp = result.timestamp();
    expect(timestamp).to.be.lessThan(baseDate.getTime());
  });
});

describe('DurationBuilder – invalid number inputs', () => {
  it('rejects NaN for weeks', () => {
    expect(() => weeks(NaN)).to.throw('weeks: value must be a finite number');
  });

  it('rejects Infinity for days', () => {
    expect(() => days(Infinity)).to.throw('days: value must be a finite number');
    expect(() => days(-Infinity)).to.throw('days: value must be a finite number');
  });

  it('rejects unsafe integers for minutes', () => {
    expect(() => minutes(Number.MAX_SAFE_INTEGER + 1)).to.throw('minutes: absolute value exceeds safe range');
  });

  it('rejects NaN in chained operations', () => {
    expect(() => weeks(2).days(NaN)).to.throw('days: value must be a finite number');
  });
});

describe('RelativeBuilder – invalid number inputs', () => {
  const baseDate = new Date('2023-06-15T12:00:00Z');

  it('rejects NaN for years', () => {
    expect(() => fromDate(baseDate).years(NaN)).to.throw('years: value must be a finite integer');
  });

  it('rejects Infinity for months', () => {
    expect(() => fromDate(baseDate).months(Infinity)).to.throw('months: value must be a finite integer');
    expect(() => fromDate(baseDate).months(-Infinity)).to.throw('months: value must be a finite integer');
  });

  it('rejects decimals for weeks', () => {
    expect(() => fromDate(baseDate).weeks(2.7)).to.throw('weeks: value must be an integer (no decimals)');
  });

  it('rejects unsafe integers for days', () => {
    expect(() => fromDate(baseDate).days(Number.MAX_SAFE_INTEGER + 1)).to.throw('days: value exceeds safe integer range');
  });

  it('rejects NaN in chained operations', () => {
    expect(() => fromDate(baseDate).years(1).hours(NaN)).to.throw('hours: value must be a finite integer');
  });

  it('rejects decimals in chained operations', () => {
    expect(() => fromDate(baseDate).months(6).seconds(30.3)).to.throw('seconds: value must be an integer (no decimals)');
  });
});

describe('fromDate – invalid timestamp inputs', () => {
  it('rejects NaN timestamps', () => {
    expect(() => fromDate(NaN)).to.throw('fromDate: value must be a finite integer');
  });

  it('rejects Infinity timestamps', () => {
    expect(() => fromDate(Infinity)).to.throw('fromDate: value must be a finite integer');
    expect(() => fromDate(-Infinity)).to.throw('fromDate: value must be a finite integer');
  });

  it('rejects decimal timestamps', () => {
    expect(() => fromDate(1672531200000.5)).to.throw('fromDate: value must be an integer (no decimals)');
  });

  it('rejects unsafe integer timestamps', () => {
    expect(() => fromDate(Number.MAX_SAFE_INTEGER + 1)).to.throw('fromDate: value exceeds safe integer range');
  });

  it('still accepts valid integer timestamps', () => {
    const timestamp = 1672531200000;
    const result = fromDate(timestamp);
    expect(result.timestamp()).to.equal(timestamp);
  });
});

describe('DurationBuilder – fractional durations', () => {
  it('weeks with decimals', () => {
    expect(weeks(1.5).days()).to.equal(10.5);
  });

  it('days with decimals', () => {
    expect(days(1.5).hours()).to.equal(36);
  });

  it('hours with decimals', () => {
    expect(hours(1.5).minutes()).to.equal(90);
  });

  it('minutes with decimals', () => {
    expect(minutes(1.25).seconds()).to.equal(75);
  });

  it('seconds with decimals', () => {
    expect(seconds(1.5).milliseconds()).to.equal(1500);
  });

  it('negative fractional durations', () => {
    expect(days(-2.5).hours()).to.equal(-60);
  });
});
