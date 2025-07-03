import { expect } from 'chai';
import {
  weeks, days,
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

  it('throws error for invalid strings', () => {
    expect(() => fromDate('invalid-date')).to.throw('fromDate: Invalid date input');
  });

  it('throws error for invalid input types', () => {
    expect(() => fromDate({} as any)).to.throw('fromDate: Input must be a Date object, timestamp (number), or ISO date string');
  });
});
