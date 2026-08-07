import * as E from "fp-ts/Either";
import { Either } from 'fp-ts/Either';
import { ValueOrFactory } from "value-or-factory";

/**
 * The result of a mapping attempt. Either a value or an error.
 */
export type Result<T> = Either<readonly MapError[], T>

/**
 * One piece of an error path.
 */
export type ErrorPathComponent = string | number

export type ErrorPath = readonly ErrorPathComponent[]

/**
 * An error associated with a mapping attempt.
 */
export type MapError = {

    readonly path?: ErrorPath | undefined
    readonly message: string
    readonly value: unknown

}

/**
 * A mapper converts a value from one type to another.
 */
export type Mapper<I, O> = (value: Result<I>) => Result<O>

export type ErrorInput = undefined | ErrorInfo | string

/**
 * Used for quickly building errors. Can be a string, an object with a path and message, or an array of either the two.
 */
export type ErrorFactory<T> = ValueOrFactory<ErrorInput | readonly ErrorFactory<T>[], [T]>

/**
 * An error for a factory. Gets combined with a value and turned into a MapError.
 */
export type ErrorInfo = Pick<MapError, "path" | "message">

/**
 * Generates an error using a factory and a value.
 */
export function buildError<T>(factory: ErrorFactory<T>, value: T): readonly MapError[] {
    if (typeof factory === "function") {
        return buildError(factory(value), value)
    }
    else if (Array.isArray(factory)) {
        return factory.map(_ => buildError(_, value)).flat()
    }
    else if (typeof factory === "string") {
        return [{ path: [], message: factory, value }]
    }
    else if (factory === undefined) {
        return []
    }
    else {
        return [{ ...factory as ErrorInfo, value }]
    }
}

// Extractors

/**
 * Extract the value from a success result.
 */
export type ResultType<P> = P extends E.Right<infer O> ? O : never

/**
 * Extract the input type from a mapper.
 */
export type InputType<P> = P extends Mapper<infer I, unknown> ? I : never

/**
 * Extract the output type from a mapper.
 */
export type OutputType<P> = P extends Mapper<never, infer O> ? O : never
