export function assertFiniteNumber (value: number, caller: string): void {
  if (!Number.isFinite(value)) {
    throw new Error(`${caller}: value must be a finite number`);
  }
  if (!Number.isSafeInteger(Math.trunc(value))) {
    throw new Error(`${caller}: absolute value exceeds safe range`);
  }
}

export function assertSafeInt (value: number, caller: string): void {
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
