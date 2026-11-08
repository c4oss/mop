import { callOrGet, ValueOrFactory } from "value-or-factory"
import { error, ErrorFactory, Mapper, Result } from "./base.js"
import { failure, flatMap, map, of, orElse, pipe, success } from "./core.js"

/**
 * Creates a mapper that replaces any successful value with a constant (or the result of calling a factory).
 */
export const constant = <I, O>(v: ValueOrFactory<O>) => map<I, O>(() => callOrGet(v))

/**
 * Creates a mapper that always fails with the given error.
 */
export const fail = <I, O>(factory: ErrorFactory<I>) => flatMap<I, O>(value => failure(error(factory, value)))

/**
 * Returns the mapper, or a mapper that does nothing if it is `undefined`.
 */
export const possible = <I, O extends I>(mapper: Mapper<I, O> | undefined) => mapper ?? noOp<I>

/**
 * Returns the mapper if `condition` is true, otherwise a mapper that does nothing.
 */
export const cond = <I, O extends I>(mapper: Mapper<I, O>, condition: boolean) => condition ? mapper : noOp<I>

/**
 * A mapper that returns its input unchanged. Useful for setting the input type of a `flow`.
 */
export const noOp = <T>(value: Result<T>) => value

/**
 * Creates a mapper that runs `mapper`, and if it fails, runs `fallbackMapper` on the original value instead.
 * Note that `fallbackMapper` is evaluated even when `mapper` succeeds.
 */
export const fallback = <I, O1, O2>(mapper: Mapper<I, O1>, fallbackMapper: Mapper<I, O2>) => {
    return flatMap((value: I) => {
        return pipe(value, of, mapper, orElse(fallbackMapper(of(value))))
    })
}

/**
 * Creates a mapper that runs another mapper. If it fails, returns the original value instead.
 */
export const attempt = <I, O>(mapper: Mapper<I, O>) => {
    return flatMap((value: I) => {
        return pipe(value, of, mapper, orElse(of(value)))
    })
}

/**
 * Creates a mapper that runs `mapper` only if `test` returns true for the value. Otherwise, returns `defaultTo`.
 */
export const conditional = <I, O, D>(test: (input: I) => boolean, mapper: Mapper<I, O>, defaultTo: D) => {
    return flatMap<I, O | D>(value => {
        if (test(value)) {
            return pipe(value, of, mapper)
        }
        else {
            return success(defaultTo)
        }
    })
}
