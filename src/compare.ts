
import { ErrorFactory } from "./base.js"
import { flow } from "./core.js"
import { predicate } from "./test.js"

/*
export const is = <I, O extends I>(is: O, error: ErrorFactory<I> = "Must be equal to " + is) => flow(test(_ => _ === is, error), cast<O>)
export const isNot = <I, O extends I>(is: O, error: ErrorFactory<I> = "Must not be equal to " + is) => flow(test(_ => _ !== is, error), cast<O>)
*/

/**
 * Creates a mapper that requires the input to be strictly equal (`===`) to a value.
 */
export const is = <I>(is: I, error: ErrorFactory<I> = "Must be equal to " + is) => flow(predicate(_ => _ === is, error))

/**
 * Creates a mapper that requires the input to not be strictly equal (`!==`) to a value.
 */
export const isNot = <I>(is: I, error: ErrorFactory<I> = "Must not be equal to " + is) => flow(predicate(_ => _ !== is, error))
