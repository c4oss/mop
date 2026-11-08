
import { ErrorFactory } from "./base.js";
import { predicate } from "./test.js";

/**
 * Creates a mapper that requires the input to be greater than a value. Works with any type that supports `>`.
 */
export const isGt = <T>(is: T, error: ErrorFactory<T> = "Must be greater than to " + is) => predicate(_ => _ > is, error);

/**
 * Creates a mapper that requires the input to be greater than or equal to a value. Works with any type that supports `>=`.
 */
export const isGtOrEq = <T>(is: T, error: ErrorFactory<T> = "Must be greater than or equal to " + is) => predicate(_ => _ >= is, error);

/**
 * Creates a mapper that requires the input to be less than a value. Works with any type that supports `<`.
 */
export const isLt = <T>(is: T, error: ErrorFactory<T> = "Must be less than " + is) => predicate(_ => _ < is, error);

/**
 * Creates a mapper that requires the input to be less than or equal to a value. Works with any type that supports `<=`.
 */
export const isLtOrEq = <T>(is: T, error: ErrorFactory<T> = "Must be less than or equal to " + is) => predicate(_ => _ <= is, error);

/**
 * Creates a mapper that requires a number to be divisible by `divisor`.
 */
export const isDivisibleBy = (divisor: number, error: ErrorFactory<number> = "Must be divisible by " + divisor) => predicate(_ => _ % divisor === 0, error);

/**
 * Creates a mapper that requires a number to not be divisible by `divisor`.
 */
export const isNotDivisibleBy = (divisor: number, error: ErrorFactory<number> = "Must not be divisible by " + divisor) => predicate(_ => _ % divisor !== 0, error);
