import { PathComponent } from "./base.js"
import { errorAt, formatPath } from "./formatting.js"
import { mapFail } from "./index.js"
import { arrayOrElement, ArrayOrElement } from "./internal.js"

/**
 * Creates a mapper that prepends path components to the path of every error.
 * Used when running a mapper on a nested value, so errors point at where they occurred.
 */
export const path = (paths: ArrayOrElement<PathComponent>) => mapFail(errors => {
    return errors.map(error => ({ ...error, path: [...arrayOrElement(paths), ...arrayOrElement(error.path ?? []) ?? []] }))
})

/**
 * Creates a mapper that removes the path from every error and moves it into the message instead (see `errorAt`).
 */
export const truncatePaths = () => {
    return mapFail(errors => {
        return errors.map(error => {
            return {
                value: error.value,
                message: errorAt(formatPath(error.path), error.message),
            }
        })
    })
}
