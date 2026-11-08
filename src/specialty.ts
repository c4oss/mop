import { flow } from "fp-ts/function"
import { error, ErrorFactory } from "./base.js"
import { noOp } from "./common.js"
import { map } from "./core.js"
import { predicate } from "./test.js"

/**
 * A mapper that takes a key and returns its value from `window.localStorage`, or `null` if it is not set. Browser only.
 */
export const localStorage = flow(noOp<string>, map(key => window.localStorage.getItem(key)))

/**
 * Creates a mapper that requires two keys of an object to have equal values (e.g. a password and its confirmation).
 * @param a The first key.
 * @param b The confirmation key.
 * @param applyTo Which key the error is reported at: `a` ("initial"), `b` ("confirm"), or both.
 * @param errorFactory The error to use when the values differ. Receives the whole object.
 */
export const confirm = <I>(a: keyof I & string, b: keyof I & string, applyTo: "initial" | "confirm" | "both" = "confirm", errorFactory: ErrorFactory<I> = "Confirmation does not match") => {
    return predicate<I>(input => input[a] === input[b], input => {
        const error1 = error(errorFactory, input).map(error => ({ ...error, path: [a], value: input[a] }))
        const error2 = error(errorFactory, input).map(error => ({ ...error, path: [b], value: input[b] }))
        if (applyTo === "initial") {
            return error1
        }
        else if (applyTo === "confirm") {
            return error2
        }
        else {
            return error1.concat(error2)
        }
    })
}
