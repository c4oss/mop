import { flow } from "fp-ts/function"
import { error, ErrorFactory } from "./base.js"
import { noOp } from "./common.js"
import { map } from "./core.js"
import { predicate } from "./test.js"

/**
 * A mapper that takes a string as input, and gets the value from LocalStorage.
 */
export const localStorage = flow(noOp<string>, map(key => window.localStorage.getItem(key)))

/**
 * Creates a mapper that requires that two keys of an object match.
 * The error can be assigned to the path of the first key, the second key, or both.
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
