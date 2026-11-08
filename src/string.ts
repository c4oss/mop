
// String

import { flow } from "fp-ts/function";
import { ErrorFactory, Mapper } from "./base.js";
import { map, mapFail } from "./core.js";
import { filter } from "./filter.js";
import { arrayByIndex } from "./index.js";
import { maybe, maybeNull, maybeUndefined, orNull, orUndefined, req } from "./optionality.js";
import { predicate } from "./test.js";
import { typed } from "./types.js";

/**
 * Creates a mapper that trims whitespace from both ends of a string.
 */
export const trim = () => map((input: string) => input.trim())

/**
 * Creates a mapper that trims a string and turns it into `undefined` if it is then empty.
 */
export const blankToEmpty = () => flow(trim(), filter(_ => _.length !== 0))

/**
 * Creates a mapper that trims a string and then requires it to not be empty.
 */
export const notBlank = (error: ErrorFactory<string> = "This value must not be blank") => flow(trim(), predicate(_ => _ != "", error));

/**
 * Creates a mapper that requires a string (not null or undefined), trims it, and requires it to not be blank.
 * @param error The error to use when the value is missing. Also used for blank strings unless `blankError` is given.
 * @param blankError The error to use when the string is blank.
 */
export const nonBlankString = (error?: ErrorFactory<string | null | undefined>, blankError = error) => flow(req<string>(error), notBlank(blankError))

/**
 * Creates a mapper that trims a string and turns blank strings into `undefined`. Lets `undefined` and `null` pass through.
 */
export const maybeString = () => maybe(blankToEmpty())
/**
 * Creates a mapper that trims a string and turns blank strings into `undefined`. Lets `undefined` pass through.
 */
export const maybeStringUndefined = () => flow(maybeUndefined(blankToEmpty()), orUndefined)
/**
 * Creates a mapper that trims a string and turns blank strings into `undefined`.
 * Note: it ends with `orUndefined`, so `null` input also becomes `undefined`.
 */
export const maybeStringNull = () => flow(maybeNull(blankToEmpty()), orUndefined)
/**
 * Creates a mapper that trims a string and turns blank strings, `null` and `undefined` into `undefined`.
 */
export const maybeStringOrUndefined = () => flow(maybeString(), orUndefined)
/**
 * Creates a mapper that trims a string and turns blank strings, `null` and `undefined` into `null`.
 */
export const maybeStringOrNull = () => flow(maybeString(), orNull)

/**
 * Creates a mapper that requires a string to start with `match`.
 */
export const startsWith = (match: string, error: ErrorFactory<string> = "Must start with \"" + match + "\"") => predicate(_ => _.startsWith(match), error)
/**
 * Creates a mapper that requires a string to start with `match`, ignoring case.
 */
export const startsWithCi = (match: string, error: ErrorFactory<string> = "Must start with \"" + match + "\"") => predicate(_ => _.toLowerCase().startsWith(match.toLowerCase()), error)
/**
 * Creates a mapper that requires a string to end with `match`.
 */
export const endsWith = (match: string, error: ErrorFactory<string> = "Must end with \"" + match + "\"") => predicate(_ => _.endsWith(match), error)
/**
 * Creates a mapper that requires a string to end with `match`, ignoring case.
 */
export const endsWithCi = (match: string, error: ErrorFactory<string> = "Must end with \"" + match + "\"") => predicate(_ => _.toLowerCase().endsWith(match.toLowerCase()), error)

/**
 * Creates a mapper that requires a string to look like a decimal number (optional leading `-`, digits, optional `.`).
 * Note: the empty string also passes.
 */
export const numeric = (error: ErrorFactory<string> = "This value is not numeric") => regex(/^-?\d*\.?\d*$/, error)
/**
 * Creates a mapper that requires a string to match a regex.
 * Avoid regexes with the `g` or `y` flag, since `test` then depends on the regex's `lastIndex`.
 */
export const regex = (regex: RegExp, error: ErrorFactory<string> = "This value does not match pattern " + regex + "") => predicate<string>(_ => regex.test(_), error);
/**
 * Creates a mapper that requires a string to be an email address.
 */
export const email = (error: ErrorFactory<string> = "This is not a valid email") => regex(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, error)
/**
 * Creates a mapper that requires a string to be a lowercase hyphenated UUID.
 */
export const uuid = (error: ErrorFactory<string> = "This value must be a UUID") => regex(/^[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}$/, error);

/**
 * Creates a mapper that requires a string to be exactly `is` characters long.
 */
export const length = (is: number, error: ErrorFactory<string> = "Must be " + is + " characters") => predicate(_ => _.length === is, error)

/**
 * Creates a mapper that requires a string to be at least `is` characters long.
 */
export const minLength = (is: number, error: ErrorFactory<string> = "Must be at least " + is + " characters") => predicate(_ => _.length >= is, error)

/**
 * Creates a mapper that requires a string to be at most `is` characters long.
 */
export const maxLength = (is: number, error: ErrorFactory<string> = "Must be at most " + is + " characters") => predicate(_ => _.length <= is, error)

/**
 * Splits a string on newlines and transforms each line using the provided mapper.
 * Errors are prefixed with the line's index in their path, and with "Line #N: " (1-based) in their message.
 */
export function eachLine<O>(mapper: Mapper<string, O>): Mapper<string, readonly O[]> {
    return flow(
        typed<string>,
        map(string => string.split("\n")),
        arrayByIndex(index => {
            return flow(
                mapper,
                mapFail(errors => {
                    return errors.map(error => {
                        return {
                            ...error,
                            message: "Line #" + (index + 1) + ": " + error.message,
                        }
                    })
                })
            )
        })
    )
}
