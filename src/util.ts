
import { MapError } from "./base.js";

export type ErrorFormatter = (errors: MapError | readonly MapError[]) => string

/**
 * Regex from a string.
 */
export function regexFromString(regex: string) {
    const main = regex.match(/\/(.+)\/.*/)?.[1]
    if (main === undefined) {
        return
    }
    return new RegExp(main, regex.match(/\/.+\/(.*)/)?.[1])
}
