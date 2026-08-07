import * as E from "fp-ts/Either"
import { buildError, ErrorFactory } from "./base.js"
import { flatMap } from "./core.js"
import { testWith } from "./test.js"

/**
 * Tries to execute a function, catching errors. Returns a result containing the return value of the function.
 */
export const tryCatch = <I, O>(func: (value: I) => O, message: ErrorFactory<[unknown, I]> = error => `${error[0]}`.replace(/\.$/, "")) => flatMap((value: I) => {
    return E.tryCatch(() => func(value), e => buildError(message, [e, value]))
})

/**
 * Does validation, catching errors. If no errors caught, returns a result containing the initial value instead of the return value of the validation function.
 */
export const testTryCatch = <I>(func: (value: I) => unknown, message: ErrorFactory<[unknown, I]> = error => `${error[0]}`) => {
    return testWith(tryCatch(func, message))
}
