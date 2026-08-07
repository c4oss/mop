
import { ErrorFactory } from "./base.js";
import { predicate } from "./test.js";

/**
 * Creates a mapper that validates that a number is greater than a specified value.
 */
export const isGt = <T>(is: T, error: ErrorFactory<T> = "Must be greater than to " + is) => predicate(_ => _ > is, error);

/**
 * Creates a mapper that validates that a number is greater than or equal to a specified value.
 */
export const isGtOrEq = <T>(is: T, error: ErrorFactory<T> = "Must be greater than or equal to " + is) => predicate(_ => _ >= is, error);

/**
 * Creates a mapper that validates that a number is less than a specified value.
 */
export const isLt = <T>(is: T, error: ErrorFactory<T> = "Must be less than " + is) => predicate(_ => _ < is, error);

/**
 * Creates a mapper that validates that a number is less than or equal to a specified value.
 */
export const isLtOrEq = <T>(is: T, error: ErrorFactory<T> = "Must be less than or equal to " + is) => predicate(_ => _ <= is, error);

/**
 * Creates a mapper that validates that a number is divisible by a specified value.
 */
export const isDivisibleBy = (divisor: number, error: ErrorFactory<number> = "Must be divisible by " + divisor) => predicate(_ => _ % divisor === 0, error);

/**
 * Creates a mapper that validates that a number is not divisible by a specified value.
 */
export const isNotDivisibleBy = (divisor: number, error: ErrorFactory<number> = "Must not be divisible by " + divisor) => predicate(_ => _ % divisor !== 0, error);
