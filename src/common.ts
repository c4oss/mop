import { callOrGet, ValueOrFactory } from "value-or-factory"
import { error, ErrorFactory, Mapper, Result } from "./base.js"
import { failure, flatMap, map, of, orElse, pipe, success } from "./core.js"

/**
 * Returns the same value every time.
 */
export const constant = <I, O>(v: ValueOrFactory<O>) => map<I, O>(() => callOrGet(v))

/**
 * Trigger an error manually.
 */
export const fail = <I, O>(factory: ErrorFactory<I>) => flatMap<I, O>(value => failure(error(factory, value)))

/**
 * Adds an optional mapper (may be undefined).
 */
export const possible = <I, O extends I>(mapper: Mapper<I, O> | undefined) => mapper ?? noOp<I>

/**
 * Shortcut method to add a mapper if the condition argument is set to true
 */
export const cond = <I, O extends I>(mapper: Mapper<I, O>, condition: boolean) => condition ? mapper : noOp<I>

/**
 * Does nothing (used for type inference).
 */
export const noOp = <T>(value: Result<T>) => value

/**
 * Creates a mapper that combines two mappers, the second one is only used if the first fails.
 */
export const fallback = <I, O1, O2>(mapper: Mapper<I, O1>, fallbackMapper: Mapper<I, O2>) => {
    return flatMap((value: I) => {
        return pipe(value, of, mapper, orElse(fallbackMapper(of(value))))
    })
}

/**
 * Creates a mapper that attempts to run another mapper. If it fails, returns the original value.
 */
export const attempt = <I, O>(mapper: Mapper<I, O>) => {
    return flatMap((value: I) => {
        return pipe(value, of, mapper, orElse(of(value)))
    })
}

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
