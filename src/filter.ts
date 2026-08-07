import { Predicate } from "fp-ts/Predicate"
import { map } from "./core.js"

/**
 * This performs a validation, but instead of throwing an error it turns the value into undefined if it fails.
 */
export const filter = <T>(predicate: Predicate<T>) => map((value: T) => predicate(value) ? value : undefined)

/**
* This performs a validation, but instead of throwing an error it turns the value into undefined if it succeeds.
*/
export const filterNot = <T>(predicate: Predicate<T>) => map((value: T) => predicate(value) ? undefined : value)
