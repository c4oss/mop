import { flow } from "fp-ts/function";
import { Predicate } from "fp-ts/Predicate";
import { error, ErrorFactory, ErrorInput, Mapper } from "./base.js";
import { failure, flatMap, of } from "./core.js";
import { ArrayOrElement } from "./internal.js";
import { split, to1 } from "./tuples.js";

/**
 * The base of most validators. Creates a mapper that runs one or more predicates on the value.
 * If any predicate returns false, fails with the given error. Otherwise, returns the value unchanged.
 */
export const predicate = <T>(predicates: ArrayOrElement<Predicate<T>>, factory: ErrorFactory<T> = "This value is invalid.") => flatMap((input: T) => {
    const failures = (Array.isArray(predicates) ? predicates : [predicates]).map(_ => _(input)).filter(_ => !_)
    if (failures.length > 0) {
        return failure(error(factory, input))
    }
    return of(input)
})

/**
 * Creates a mapper that runs one or more testers on the value. Each tester returns errors (or `undefined`/an empty array if it passes).
 * Fails with every error returned. Otherwise, returns the value unchanged.
 */
export const test = <T>(testers: ArrayOrElement<(value: T) => ArrayOrElement<ErrorInput>>) => flatMap((input: T) => {
    const errors = error([testers].flat().flatMap(tester => tester(input)), input)
    if (errors.length > 0) {
        return failure(error(errors, input))
    }
    return of(input)
})

/**
 * Creates a mapper that runs another mapper as a check, discarding its output.
 * Fails if that mapper fails, and otherwise returns the original value unchanged.
 */
export const testWith = <T>(func: Mapper<T, unknown>) => flow(split(func), to1)
