
// Type converters.

import { flow } from "fp-ts/function"
import { error, ErrorFactory } from "./base.js"
import { failure, flatMap, map, of, success } from "./core.js"
import { tryBoth } from "./experimental.js"
import { maybe } from "./optionality.js"
import { regexFromString } from "./regex.js"
import { blankToEmpty, numeric } from "./string.js"
import { tryCatch } from "./try-catch.js"
import { isNumber, isString } from "./types.js"

/**
 * Creates a mapper that converts any value to a boolean using the !! operator.
 */
export const unknownToBoolean = () => map(_ => !!_);

/**
 * Creates a mapper that converts a numeric string to an integer. Fails if the string is not numeric.
 */
export const stringToInt = (errorFactory: ErrorFactory<[unknown | undefined, string]> = "This value must be numeric") => flow(numeric(v => error(errorFactory, [undefined, v])), tryCatch(parseInt, errorFactory));

/**
 * Creates a mapper that converts a numeric string to a float. Fails if the string is not numeric.
 */
export const stringToFloat = (errorFactory: ErrorFactory<[unknown | undefined, string]> = "This value must be numeric") => flow(numeric(v => error(errorFactory, [undefined, v])), tryCatch(parseFloat, errorFactory));

/**
 * Creates a mapper that accepts a number or a numeric string and converts it to an integer.
 * Numbers pass through unchanged. Blank strings become `undefined`.
 */
export const stringOrNumberToInt = (errorFactory: ErrorFactory<unknown> = "This value must be a number or a numeric string") => tryBoth(flow(isString(), blankToEmpty(), maybe(flow(numeric(), stringToInt()))), isNumber(), errorFactory)

/**
 * Creates a mapper that accepts a number or a numeric string and converts it to a float.
 * Numbers pass through unchanged. Blank strings become `undefined`.
 */
export const stringOrNumberToFloat = (errorFactory: ErrorFactory<unknown> = "This value must be a number or a numeric string") => tryBoth(flow(isString(), blankToEmpty(), maybe(flow(numeric(), stringToFloat()))), isNumber(), errorFactory)

/**
 * Creates a mapper that converts a number to a string.
 */
export const numberToString = () => map((input: number) => input.toString())

/**
 * Creates a mapper that converts a number to a locale string.
 */
export const numberToLocaleString = () => map((input: number) => input.toLocaleString())

/**
 * Creates a mapper that converts a date to a timestamp in milliseconds.
 */
export const dateToTime = () => map((input: Date) => input.getTime())

/**
 * Creates a mapper that converts a timestamp in milliseconds to a date.
 */
export const timeToDate = () => map((input: number) => new Date(input))

/**
 * Creates a mapper that converts a date to an ISO 8601 string, using `Date.toISOString`.
 */
export const dateToIsoString = () => map((input: Date) => input.toISOString())

/**
 * Creates a mapper that parses a string into a date, using `Date.parse`. Fails if the string is blank or not a valid date.
 */
export const stringToDate = () => flatMap((input: string) => {
    if (input.trim() === "") {
        return failure(error("This is not a valid date string", input))
    }
    try {
        const parsed = new Date(Date.parse(input))
        parsed.toISOString()
        return success(parsed)
    }
    catch (e) {
        if (e instanceof Error) {
            return failure(error(e.message, input))
        }
        return failure(error("Invalid date.", input))
    }
})

/**
 * Creates a mapper that converts a regex literal string such as `"/^abc$/i"` into a `RegExp` (see `regexFromString`).
 * Fails if the string is not in `/pattern/flags` form or the pattern is invalid.
 * @param errorFactory Receives the input string if it is not in literal form, or `[thrown error, input]` if the pattern is invalid.
 */
export const stringToRegex = (errorFactory: ErrorFactory<[unknown, string] | string> = error => "This is not a valid regex pattern" + " (" + error[0] + ")") => flatMap((input: string) => {
    try {
        const regex = regexFromString(input)
        if (regex === undefined) {
            return failure(error(errorFactory, input))
        }
        return of(regex)
    }
    catch (e) {
        return failure(error(errorFactory, [e, input]))
    }
})
