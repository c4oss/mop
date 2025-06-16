import * as E from "fp-ts/Either"
import { pipe } from "fp-ts/function"
import { equals } from "ramda"
import { ValueOrFactory, callOrGet } from "value-or-factory"
import { ErrorPathComponent, MapError, Mapper, Result } from "./base"
import { ArrayOrElement, arrayOrElement } from "./internal"

export { fold, isLeft, isRight, toUnion } from "fp-ts/Either"
export { flow, pipe } from "fp-ts/function"

export function getSuccess<E, A>(either: E.Either<E, A>) {
    if (E.isRight(either)) {
        return either.right
    }
}

export function getFailure<E, A>(either: E.Either<E, A>) {
    if (E.isLeft(either)) {
        return either.left
    }
}

/**
 * Returns true if this result is a success.
 */
export const isSuccess = <T>(result: Result<T>) => E.isRight(result)

/**
 * Returns true if this result is a failure.
 */
export const isFailure = <T>(result: Result<T>) => E.isLeft(result)

/**
 * Creates a failure result from an error.
 */
export function failure(error: ArrayOrElement<MapError>) {
    return E.left([error].flat())
}

/**
 * Creates a success result from a value.
 */
export const success = <T>(value: T) => E.right<readonly MapError[], T>(value)

/**
 * A mapper that transforms a value.
 */
export const map = <I, O>(func: (i: I) => O): (result: Result<I>) => Result<O> => E.map(func)

/**
 * Maps the failure side of a transformation result.
 */
export const mapFail = <T>(func: (i: readonly MapError[]) => T) => E.mapLeft(func)

/**
 * Create a new result from a value.
 */
export const of = <T>(value: T): Result<T> => E.right(value)

/**
 * Recovers from the failure side of a transformation result.
 */
export const orElse = <B, A>(orElse: ValueOrFactory<Result<B>, [readonly MapError[]]>) => (result: Result<A>) => E.orElseW((errors: readonly MapError[]) => callOrGet(orElse, errors))(result)

/**
 * Takes a simple function that converts from I to O or generates an error.
 */
export const flatMap = <I, O>(func: (i: I) => Result<O>) => E.chain(func)

/**
 * Takes a simple function that converts from I to O or generates an error.
 */
export const flat = <T>() => flatMap((result: Result<T>) => result)

/**
 * Takes a simple function that uses the input value to generate an additional mapper that is then executed.
 */
export const chain = <I, O>(func: (value: I) => Mapper<I, O>) => E.chain((value: I) => pipe(value, E.of, func(value)))

/**
 * Maps each error in a transformation failure.
 */
export const mapEachError = (func: (i: MapError) => MapError) => mapFail(_ => _.map(func))

/**
 * Maps each error in a transformation failure.
 */
export const mapErrorAt = (path: ArrayOrElement<ErrorPathComponent>, func: (i: MapError) => MapError) => mapFail(_ => _.map(error => equals(arrayOrElement(error.path ?? []), arrayOrElement(path)) ? func(error) : error))

/**
 * Tap into a mop flow (usually used for logging).
 */
export const tap = <T>(func: (value: T) => void) => map((value: T) => {
    func(value)
    return value
})

/**
 * Tap into a mop flow on failure (usually used for logging).
 */
export const tapFail = (func: (value: readonly MapError[]) => void) => mapFail(errors => {
    func(errors)
    return errors
})
