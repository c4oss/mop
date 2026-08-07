import { flow } from "fp-ts/function";
import { Predicate } from "fp-ts/Predicate";
import { buildError, ErrorFactory, ErrorInput, Mapper } from "./base.js";
import { failure, flatMap, of } from "./core.js";
import { ArrayOrElement } from "./internal.js";
import { split, to1 } from "./tuples.js";

/**
 * This is the base of all validators. Performs a test, throws an error if it fails. If it passes, the original value is returned.
 */
export const predicate = <T>(predicates: ArrayOrElement<Predicate<T>>, error: ErrorFactory<T> = "This value is invalid.") => flatMap((input: T) => {
    const failures = (Array.isArray(predicates) ? predicates : [predicates]).map(_ => _(input)).filter(_ => !_)
    if (failures.length > 0) {
        return failure(buildError(error, input))
    }
    return of(input)
})

export const test = <T>(testers: ArrayOrElement<(value: T) => ArrayOrElement<ErrorInput>>) => flatMap((input: T) => {
    const errors = buildError([testers].flat().flatMap(tester => tester(input)), input)
    if (errors.length > 0) {
        return failure(buildError(errors, input))
    }
    return of(input)
})

/**
 * Uses another mapper to test, but returns the original value unchanged if successful.
 */
export const testWith = <T>(func: Mapper<T, unknown>) => flow(split(func), to1)
