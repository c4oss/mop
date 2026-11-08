import * as E from "fp-ts/Either"
import { map, mapLeft, toUnion } from "fp-ts/Either"
import { flow, pipe } from "fp-ts/function"
import { groupBy, mapObjIndexed, values } from "ramda"
import { mapFail } from "./core.js"
import { errorAt, formatError, formatPath } from "./formatting.js"
import { ErrorFormatter } from "./regex.js"

// Functions for reshaping the errors of a result into forms that are easier to display.
// Most take an optional `formatter` that turns errors into message strings (defaults to `formatError(false)`).

/**
 * Returns the value of a result, or throws an `Error` whose message lists every error (see `singleErrorMessage`).
 */
export const throwError = (formatter: ErrorFormatter = formatError(false)) => flow(singleErrorMessage(formatter), E.mapLeft(_ => { throw new globalThis.Error(_) }), toUnion)
/**
 * Turns the errors into an object whose keys are formatted paths and whose values are the errors at each path.
 */
export const groupErrors = () => mapFail(groupBy(_ => formatPath(_.path)))
/**
 * Turns the errors into an object whose keys are formatted paths and whose values are the error messages at each path.
 */
export const groupMessages = (formatter: ErrorFormatter = formatError(false)) => flow(groupErrors(), mapLeft(mapObjIndexed(_ => _!.map(formatter))))
/**
 * Turns the errors into an object whose keys are formatted paths and whose values are a single message combining every error at that path.
 */
export const combineMessages = (formatter: ErrorFormatter = formatError(false)) => flow(groupErrors(), mapLeft(mapObjIndexed(error => formatter(error!) + ".")))
/**
 * Turns the errors into a list of messages, one per path, each prefixed with its path (see `errorAt`).
 */
export const messageList = (formatter: ErrorFormatter = formatError(false)) => flow(combineMessages(formatter), mapLeft(flow(mapObjIndexed((value, key) => errorAt(key, value)), values)))
/**
 * Turns the errors into one string, with one line per path.
 */
export const singleErrorMessage = (formatter: ErrorFormatter = formatError(false)) => flow(messageList(formatter), E.mapLeft(l => l.join("\n")))
/**
 * Returns only the single combined error message (see `singleErrorMessage`), or `undefined` on success.
 */
export const singleErrorMessageOnly = (formatter: ErrorFormatter = formatError(false)) => flow(singleErrorMessage(formatter), failOnly)

/**
 * Returns only the list of error messages (see `messageList`), or `undefined` on success.
 */
export const errorMessagesOnly = (formatter: ErrorFormatter = formatError(false)) => flow(messageList(formatter), failOnly)
/**
 * Returns only the errors, or `undefined` on success.
 */
export const errorsOnly = () => flow(map(_ => undefined), toUnion)

/**
 * Returns the successful value, or `value` on failure.
 */
export const failTo = <O>(value: O) => flow(E.mapLeft(_ => value), toUnion)
/**
 * Returns the successful value, or `undefined` on failure.
 */
export const failToUndefined = failTo(undefined)

/**
 * Returns the failure (left) value, or `undefined` on success.
 * @param either Either
 * @returns Failure or undefined.
 */
export function failOnly<E, A>(either: E.Either<E, A>) {
    return pipe(either, map(_ => undefined), toUnion)
}
