
import { MapError } from "./base.js";

/**
 * Turns one or more errors into a single message string. See `formatError`.
 */
export type ErrorFormatter = (errors: MapError | readonly MapError[]) => string

/**
 * Creates a `RegExp` from a regex literal string such as `"/^abc$/i"`.
 * @returns The regex, or `undefined` if the string is not in `/pattern/flags` form.
 * @throws If the pattern or flags are invalid.
 */
export function regexFromString(regex: string) {
    const main = regex.match(/\/(.+)\/.*/)?.[1]
    if (main === undefined) {
        return
    }
    return new RegExp(main, regex.match(/\/.+\/(.*)/)?.[1])
}
