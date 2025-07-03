# temporal-api

Time definition library with calendar-aware arithmetic, using tc39 Temporal API.

## Features

- Both fixed interval and relative time duration calculations
- Calendar-aware date arithmetic (handling leap years and varying month lengths)
- Mixed positive/negative time interval operations ([Temporal](https://www.npmjs.com/package/@js-temporal/polyfill) does not allow mixed sign offsets)
- Fractional numbers allowed for fixed-duration units (e.g. `hours(1.5)` -> 90 minutes)

## Fixed time intervals

```typescript
weeks(2).days()    // 14
weeks(2.5).days()  // 17.5 (fractional supported)
weeks(2).seconds() // 2 * 7 * 24 * 60 * 60

// Negative durations work too
hours(-24).days()  // -1
```

## Relative date math

```typescript
// Basic operations
fromNow().years(4).days() // 365 * 4 + 1 (due to leap year)
fromDate('2023-01-01').months(6).timestamp()

// Input flexibility
fromDate(new Date('2023-01-01'))  // Date object
fromDate(1672531200000)           // Timestamp  
fromDate('2023-01-01T00:00:00Z')  // ISO string

// Add 1 year, subtract 3 months, add 5 days
fromDate('2023-06-15T12:00:00Z')
  .years(1)     // → 2024-06-15
  .months(-3)   // → 2024-03-15  
  .days(5);     // → 2024-03-20
```

## API Reference

### Relative time intervals

Entry points:

- `fromNow()`
- `fromDate(string | Date | number)`

Methods:

- `.years(n : number)`
- `.months(n : number)`
- `.weeks(n : number)`
- `.days(n : number)`
- `.hours(n : number)`- `minutes(n : number)`
- `seconds(n : number)`
- `milliseconds(n : number)`

Relative/calendar units (`fromDate`, `fromNow`) **require whole integers** because Temporal's calendar operations forbids fractional months, days, etc.

Getters:

- `.timestamp()`
- `.years()`
- `.months()`
- `.weeks()`
- `.days()`
- `.hours()`
- `.minutes()`
- `.seconds()`
- `.milliseconds()`

### Absolute time intervals

All methods are chainable and act as getters if called with no arguments:

- `weeks(n : number)`
- `days(n : number)`
- `hours(n : number)`
- `minutes(n : number)`
- `seconds(n : number)`
- `milliseconds(n : number)`

_All_ fixed-duration factory functions accept **integers or decimals** (positive or negative):