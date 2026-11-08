import * as E from "fp-ts/Either";
import { Either } from 'fp-ts/Either';
import { ValueOrFactory } from "value-or-factory";

/**
 * The result of a mapping attempt: either a list of errors (left) or a value (right).
 * Shorthand for `Either<readonly MapError[], T>`.
 */
export type Result<T> = Either<readonly MapError[], T>

/**
 * One segment of an error path. Strings are object keys and numbers are array indexes.
 */
export type PathComponent = string | number

/**
 * A full error path, made of path components from the outermost value inward.
 */
export type Path = readonly PathComponent[]

/**
 * An error produced by a failed mapping.
 */
export type MapError = {

    /**
     * Where in the input the error occurred. Empty or undefined means the root value.
     */
    readonly path?: Path | undefined

    /**
     * A human-readable description of the error. May contain `{value}`, which `formatError` replaces with the value.
     */
    readonly message: string

    /**
     * The value that failed.
     */
    readonly value: unknown

}

/**
 * A mapper converts a result of one type into a result of another type.
 * Mappers are composed with `flow` and run with `exec` or `transform`.
 * A mapper that receives a failure should normally pass it through unchanged.
 */
export type Mapper<I, O> = (value: Result<I>) => Result<O>

/**
 * A flexible way to describe errors. Can be a message string, an object with a message and path,
 * `undefined` (no error), an array of any of these, or a function of the failing value that returns any of these.
 * @typeParam T The value passed to factory functions.
 */
export type ErrorFactory<T> = ValueOrFactory<ErrorInput | readonly ErrorFactory<T>[], [T]>

/**
 * A single, non-function error description accepted by `ErrorFactory`.
 */
export type ErrorInput = undefined | Pick<MapError, "path" | "message"> | string

/**
 * Builds a list of errors from an error factory.
 * @param factory The error factory. Functions are called with `value`; arrays are flattened; `undefined` produces no errors.
 * @param value The value that failed, attached to every generated error.
 * @returns The generated errors.
 */
export function error<T>(factory: ErrorFactory<T>, value: T): readonly MapError[] {
    if (factory === undefined) {
        return []
    }
    else if (typeof factory === "function") {
        return error(factory(value), value)
    }
    else if (Array.isArray(factory)) {
        return factory.map(_ => error(_, value)).flat()
    }
    else if (typeof factory === "string") {
        return [{ path: [], message: factory, value }]
    }
    else {
        return [{ ...factory as Pick<MapError, "path" | "message">, value }]
    }
}

/**
 * Extracts the value type from a success (right) result type.
 */
export type ResultType<P> = P extends E.Right<infer O> ? O : never

/**
 * Extracts the input type from a mapper type.
 */
export type InputType<P> = P extends Mapper<infer I, unknown> ? I : never

/**
 * Extracts the output type from a mapper type.
 */
export type OutputType<P> = P extends Mapper<never, infer O> ? O : never
