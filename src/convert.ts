
// Type converters.

import { flow } from "fp-ts/function"
import { buildError, ErrorFactory } from "./base.js"
import { failure, flatMap, map, of, success } from "./core.js"
import { tryBoth } from "./experimental.js"
import { maybe } from "./optionality.js"
import { blankToEmpty, numeric } from "./string.js"
import { tryCatch } from "./try-catch.js"
import { isNumber, isString } from "./types.js"
import { regexFromString } from "./util.js"

/**
 * Creates a mapper that converts any value to a boolean using the !! operator.
 */
export const unknownToBoolean = () => map(_ => !!_);

/**
 * Creates a mapper that converts a string to an int.
 */
export const stringToInt = (error: ErrorFactory<[unknown | undefined, string]> = "This value must be numeric") => flow(numeric(v => buildError(error, [undefined, v])), tryCatch(parseInt, error));

/**
 * Creates a mapper that converts a string to a float.
 */
export const stringToFloat = (error: ErrorFactory<[unknown | undefined, string]> = "This value must be numeric") => flow(numeric(v => buildError(error, [undefined, v])), tryCatch(parseFloat, error));

/**
 * Creates a mapper that converts a string or number to an int.
 */
export const stringOrNumberToInt = (error: ErrorFactory<unknown> = "This value must be a number or a numeric string") => tryBoth(flow(isString(), blankToEmpty(), maybe(flow(numeric(), stringToInt()))), isNumber(), error)

/**
 * Creates a mapper that converts a string or number to an float.
 */
export const stringOrNumberToFloat = (error: ErrorFactory<unknown> = "This value must be a number or a numeric string") => tryBoth(flow(isString(), blankToEmpty(), maybe(flow(numeric(), stringToFloat()))), isNumber(), error)

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
        return failure(buildError("This is not a valid date string", input))
    }
    try {
        const parsed = new Date(Date.parse(input))
        parsed.toISOString()
        return success(parsed)
    }
    catch (e) {
        if (e instanceof Error) {
            return failure(buildError(e.message, input))
        }
        return failure(buildError("Invalid date.", input))
    }
})

/**
 * Creates a mapper that converts a string to a regex object.
 */
export const stringToRegex = (error: ErrorFactory<[unknown, string] | string> = error => "This is not a valid regex pattern" + " (" + error[0] + ")") => flatMap((input: string) => {
    try {
        const regex = regexFromString(input)
        if (regex === undefined) {
            return failure(buildError(error, input))
        }
        return of(regex)
    }
    catch (e) {
        return failure(buildError(error, [e, input]))
    }
})
