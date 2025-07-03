# temporal-api

Time definition library with calendar-aware arithmetic, using tc39 Temporal API.

## Fixed time intervals

```typescript
weeks(2).days()    // 14
weeks(2).seconds() // 2 * 7 * 24 * 60 * 60
```

## Relative date math

```typescript
fromNow().years(4).days() // 365 * 4 + 1 (due to leap year)
```
