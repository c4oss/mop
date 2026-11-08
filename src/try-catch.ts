import * as E from "fp-ts/Either"
import { error, ErrorFactory } from "./base.js"
import { flatMap } from "./core.js"
import { testWith } from "./test.js"

/**
 * Creates a mapper that calls a function on the value and returns its output. Fails if the function throws.
 * @param message The error to use when it throws. Receives `[thrown error, input]`. Defaults to the thrown error's text, without a trailing period.
 */
export const tryCatch = <I, O>(func: (value: I) => O, message: ErrorFactory<[unknown, I]> = error => `${error[0]}`.replace(/\.$/, "")) => flatMap((value: I) => {
    return E.tryCatch(() => func(value), e => error(message, [e, value]))
})

/**
 * Creates a mapper that calls a function on the value as a check. Fails if the function throws.
 * Otherwise, returns the original value, ignoring the function's output.
 * @param message The error to use when it throws. Receives `[thrown error, input]`. Defaults to the thrown error's text.
 */
export const testTryCatch = <I>(func: (value: I) => unknown, message: ErrorFactory<[unknown, I]> = error => `${error[0]}`) => {
    return testWith(tryCatch(func, message))
}
