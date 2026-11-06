import { MapError, PathComponent } from "./base.js"
import { ArrayOrElement, arrayOrElement } from "./internal.js"

/**
 * Utility to format an error path.
 */
export function formatPath(path?: ArrayOrElement<PathComponent>) {
    if (path === undefined) {
        return ""
    }
    return arrayOrElement(path).map((value, index) => typeof value === "string" ? ((index > 0) ? "." : "") + value : "[" + value + "]").join("")
}

/**
 * Prints an error into a message string. Replaces {value} with value. Also appends the value to the end if includeValues is true.
 */
export function formatError(includeValues = false) {
    return (errors: MapError | readonly MapError[]) => {
        return arrayOrElement(errors)
            .map(_ => _.message.replace("{value}", `${_.value}`) + (includeValues ? " (" + `${_.value}` + ")" : ""))
            .join(", ")
    }
}

/**
 * Constructs a prefix sentence referencing an error path.
 */
export function errorAt(path: string, message: string) {
    if (path === "") {
        return message
    }
    return "Error(s) at " + path + ": " + message
}
