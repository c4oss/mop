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
export type PathComponent = string | number

/**
 * A full error path, which is an array of path components.
 */
export type Path = readonly PathComponent[]

/**
 * An error associated with a transformation attempt.
 */
export type MapError = {

    readonly path?: Path | undefined
    readonly message: string
    readonly value: unknown

}

/**
 * A mapper converts a value from one type to another.
 */
export type Mapper<I, O> = (value: Result<I>) => Result<O>

/**
 * Used for quickly building errors. Can be a string, an object with a path and message, or an array of either the two.
 */
export type ErrorFactory<T> = ValueOrFactory<ErrorInput | readonly ErrorFactory<T>[], [T]>

/**
 * Input for the error builder function.
 */
export type ErrorInput = undefined | Pick<MapError, "path" | "message"> | string

/**
 * Generates an error using a factory and a value.
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
