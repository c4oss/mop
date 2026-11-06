import { flow } from "fp-ts/function"
import { callOrGet, ValueOrFactory } from "value-or-factory"
import { error, ErrorFactory, Mapper, Result } from "./base.js"
import { failure, flatMap, of } from "./core.js"
import { exec } from "./exec.js"
import { tryCatch } from "./try-catch.js"

/**
 * Require a value.
 * @param message An optional custom error message.
 * @returns A mapper that returns a value or error if undefined.
 */
export function req<T = unknown>(errorFactory: ErrorFactory<T | undefined | null> = "This value is required") {
    return flatMap((value: T | undefined | null) => {
        if (value === undefined || value === null) {
            return failure(error(errorFactory, value))
        }
        return of(value)
    })
}
export function reqUndefined<T = unknown>(errorFactory: ErrorFactory<T | undefined> = "This value is required") {
    return flatMap((value: T | undefined) => {
        if (value === undefined) {
            return failure(error(errorFactory, value))
        }
        return of(value)
    })
}
export function reqNull<T = unknown>(errorFactory: ErrorFactory<T | null> = "This value is required") {
    return flatMap((value: T | null) => {
        if (value === null) {
            return failure(error(errorFactory, value))
        }
        return of(value)
    })
}

/**
 * Creates a mapper that returns a default value if the input is null or undefined.
 * @param factory Default generator or value.
 * @returns A new mapper.
 */
export const or = <I, O>(factory: ValueOrFactory<O>): Mapper<I | undefined | null, I | O> => tryCatch(value => {
    if (value === undefined || value === null) {
        return callOrGet(factory)
    }
    return value
})
export const orUndefined = <I>(result: Result<I | null | undefined>) => or<I, undefined>(undefined)(result)
export const orNull = <I>(result: Result<I | null | undefined>) => or<I, null>(null)(result)

/**
 * Wraps a mapper so that it skips empty values (null or undefined).
 * @param mapper Mapper
 * @returns New mapper that skips empty values.
 */
export const maybe = <I, O>(mapper: Mapper<I, O>) => flatMap((value: I | undefined | null) => {
    if (value === undefined) {
        return of(undefined)
    }
    if (value === null) {
        return of(null)
    }
    return exec(value, mapper)
})
export const maybeUndefined = <I, O>(mapper: Mapper<I, O>) => flatMap((value: I | undefined) => {
    if (value === undefined) {
        return of(undefined)
    }
    return exec(value, mapper)
})
export const maybeNull = <I, O>(mapper: Mapper<I, O>) => flatMap((value: I | null) => {
    if (value === null) {
        return of(null)
    }
    return exec(value, mapper)
})

export const maybeOr = <I, O>(mapper: Mapper<I, O>, factory: ValueOrFactory<O>) => flow(maybe(mapper), or(factory))
export const maybeOrUndefined = <I, O>(mapper: Mapper<I, O>) => flow(maybe(mapper), orUndefined)
export const maybeOrNull = <I, O>(mapper: Mapper<I, O>) => flow(maybe(mapper), orNull)
