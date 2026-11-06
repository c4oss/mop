
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
 * Creates a mapper that converts a string to an int.
 */
export const stringToInt = (errorFactory: ErrorFactory<[unknown | undefined, string]> = "This value must be numeric") => flow(numeric(v => error(errorFactory, [undefined, v])), tryCatch(parseInt, errorFactory));

/**
 * Creates a mapper that converts a string to a float.
 */
export const stringToFloat = (errorFactory: ErrorFactory<[unknown | undefined, string]> = "This value must be numeric") => flow(numeric(v => error(errorFactory, [undefined, v])), tryCatch(parseFloat, errorFactory));

/**
 * Creates a mapper that converts a string or number to an int.
 */
export const stringOrNumberToInt = (errorFactory: ErrorFactory<unknown> = "This value must be a number or a numeric string") => tryBoth(flow(isString(), blankToEmpty(), maybe(flow(numeric(), stringToInt()))), isNumber(), errorFactory)

/**
 * Creates a mapper that converts a string or number to an float.
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
 * Creates a mapper that converts a date to a timestamp.
 */
export const dateToTime = () => map((input: Date) => input.getTime())

/**
 * Creates a mapper that converts a timestamp to a date.
 */
export const timeToDate = () => map((input: number) => new Date(input))

/**
 * Creates a mapper that converts a date to a string. Uses Date.toISOString method.
 */
export const dateToIsoString = () => map((input: Date) => input.toISOString())

/**
 * Creates a mapper that converts a timestamp to a date. Uses Date.parse method.
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
 * Creates a mapper that converts a string to a regex object.
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
