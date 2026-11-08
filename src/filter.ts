import { Predicate } from "fp-ts/Predicate"
import { map } from "./core.js"

/**
 * Creates a mapper that keeps the value if the predicate passes, and turns it into `undefined` otherwise. Never fails.
 */
export const filter = <T>(predicate: Predicate<T>) => map((value: T) => predicate(value) ? value : undefined)

/**
 * Creates a mapper that turns the value into `undefined` if the predicate passes, and keeps it otherwise. Never fails.
 */
export const filterNot = <T>(predicate: Predicate<T>) => map((value: T) => predicate(value) ? undefined : value)
