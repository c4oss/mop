
import { flow } from "fp-ts/function"
import { ErrorFactory, Mapper } from "./base.js"
import { map } from "./core.js"
import { loop } from "./internal.js"
import { path } from "./path.js"
import { at } from "./pos.js"
import { predicate } from "./test.js"
import { cast, typed } from "./types.js"

/**
 * Creates a mapper that applies a mapper to every element of an array. Errors are prefixed with the element's index.
 */
export const array = <I, O>(mapper: Mapper<I, O>) => loop(index => flow(mapper, path(index)))

/**
 * Like `array`, but the mapper returns an array for each element, and the results are flattened into a single array.
 */
export const flatArray = <I, O>(mapper: Mapper<I, readonly O[]>) => flow(loop(index => flow(mapper, path(index))), map(_ => _.flat()))

/**
 * Like `array`, but chooses the mapper for each element based on its index.
 */
export const arrayByIndex = <I, O>(mapper: (index: number) => Mapper<I, O>) => loop(index => flow(mapper(index), path(index)))

/**
 * Requires the array to have exactly `count` elements.
 */
export const elems = <T>(count: number, error: ErrorFactory<readonly T[]> = _ => "Must have " + count + " elements (has " + _.length + ")") => predicate(_ => _.length === count, error);

/**
 * Requires the array to have at least `count` elements.
 */
export const minElem = <T>(count: number, error: ErrorFactory<readonly T[]> = _ => "Must have at least " + count + " elements (has " + _.length + ")") => predicate(_ => _.length >= count, error);

/**
 * Requires the array to have at most `count` elements.
 */
export const maxElem = <T>(count: number, error: ErrorFactory<readonly T[]> = _ => "Must have at most " + count + " elements (has " + _.length + ")") => predicate(_ => _.length <= count, error);

/**
 * Requires the array to contain exactly one element, then returns that single item.
 * Emits `emptyError` when the array is empty and `multiError` when it has more than one item.
 */
export const oneElem = <I>(emptyError: ErrorFactory<readonly I[]> = "This array is empty.", multiError: ErrorFactory<readonly I[]> = "This array has multiple items") => flow(
    typed<readonly I[]>,
    predicate(_ => _.length !== 0, emptyError),
    predicate(_ => _.length < 2, multiError),
    at(0),
    cast<I>
)

/**
 * Creates a mapper that wraps a single value in an array. Arrays are passed through unchanged.
 */
export const arrayOrElement = <T>() => flow(typed<T | readonly T[]>, map(value => Array.isArray(value) ? value : [value]))
