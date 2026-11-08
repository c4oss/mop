import { MapError, PathComponent } from "./base.js"
import { ArrayOrElement, arrayOrElement } from "./internal.js"

/**
 * Formats an error path as a string, e.g. `["list", 0, "id"]` becomes `list[0].id`. An undefined path becomes an empty string.
 */
export function formatPath(path?: ArrayOrElement<PathComponent>) {
    if (path === undefined) {
        return ""
    }
    return arrayOrElement(path).map((value, index) => typeof value === "string" ? ((index > 0) ? "." : "") + value : "[" + value + "]").join("")
}

/**
 * Creates an error formatter that joins error messages with ", ".
 * Replaces the first `{value}` in each message with the error's value.
 * @param includeValues Also append each error's value in parentheses.
 */
export function formatError(includeValues = false) {
    return (errors: MapError | readonly MapError[]) => {
        return arrayOrElement(errors)
            .map(_ => _.message.replace("{value}", `${_.value}`) + (includeValues ? " (" + `${_.value}` + ")" : ""))
            .join(", ")
    }
}

/**
 * Prefixes a message with the path it applies to (`Error(s) at <path>: <message>`). An empty path returns the message unchanged.
 */
export function errorAt(path: string, message: string) {
    if (path === "") {
        return message
    }
    return "Error(s) at " + path + ": " + message
}
