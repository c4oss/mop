import * as E from "fp-ts/Either"
import { pipe } from "fp-ts/function"
import { equals } from "ramda"
import { ValueOrFactory, callOrGet } from "value-or-factory"
import { MapError, Mapper, PathComponent, Result } from "./base.js"
import { ArrayOrElement, arrayOrElement } from "./internal.js"
export { fold, isLeft, isRight, toUnion } from "fp-ts/Either"
export { flow, pipe } from "fp-ts/function"

/**
 * Returns the value of a success (right) result, or `undefined` if it is a failure.
 */
export function getSuccess<E, A>(either: E.Either<E, A>) {
    if (E.isRight(either)) {
        return either.right
    }
}

/**
 * Returns the errors of a failure (left) result, or `undefined` if it is a success.
 */
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
 * Creates a failure result from one error or a list of errors.
 */
export function failure(error: ArrayOrElement<MapError>) {
    return E.left([error].flat())
}

/**
 * Creates a success result from a value.
 */
export const success = <T>(value: T) => E.right<readonly MapError[], T>(value)

/**
 * Creates a mapper that transforms a successful value with a plain function. The function cannot fail.
 */
export const map = <I, O>(func: (i: I) => O): (result: Result<I>) => Result<O> => E.map(func)

/**
 * Creates a mapper that transforms the errors of a failed result. Success results pass through unchanged.
 */
export const mapFail = <T>(func: (i: readonly MapError[]) => T) => E.mapLeft(func)

/**
 * Creates a success result from a value. Same as `success`, typed as a `Result`.
 */
export const of = <T>(value: T): Result<T> => E.right(value)

/**
 * Creates a mapper that recovers from a failure by replacing it with another result.
 * @param orElse The replacement result, or a function that receives the errors and returns one.
 */
export const orElse = <B, A>(orElse: ValueOrFactory<Result<B>, [readonly MapError[]]>) => (result: Result<A>) => E.orElseW((errors: readonly MapError[]) => callOrGet(orElse, errors))(result)

/**
 * Creates a mapper from a function that converts a value into a new result, so it can either succeed or fail.
 */
export const flatMap = <I, O>(func: (i: I) => Result<O>) => E.chain(func)

/**
 * Creates a mapper that unwraps a nested result (a result whose value is itself a result).
 */
export const flat = <T>() => flatMap((result: Result<T>) => result)

/**
 * Creates a mapper that picks the next mapper based on the current value, then runs it on that value.
 */
export const chain = <I, O>(func: (value: I) => Mapper<I, O>) => E.chain((value: I) => pipe(value, E.of, func(value)))

/**
 * Creates a mapper that transforms each error in a failed result.
 */
export const mapEachError = (func: (i: MapError) => MapError) => mapFail(_ => _.map(func))

/**
 * Creates a mapper that transforms only the errors whose path exactly matches `path`. Other errors are left unchanged.
 */
export const mapErrorAt = (path: ArrayOrElement<PathComponent>, func: (i: MapError) => MapError) => mapFail(_ => _.map(error => equals(arrayOrElement(error.path ?? []), arrayOrElement(path)) ? func(error) : error))

/**
 * Creates a mapper that calls a function with the successful value and passes the value on unchanged (usually used for logging).
 */
export const tap = <T>(func: (value: T) => void) => map((value: T) => {
    func(value)
    return value
})

/**
 * Creates a mapper that calls a function with the errors of a failed result and passes them on unchanged (usually used for logging).
 */
export const tapFail = (func: (value: readonly MapError[]) => void) => mapFail(errors => {
    func(errors)
    return errors
})
