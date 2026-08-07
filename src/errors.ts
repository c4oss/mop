import * as E from "fp-ts/Either"
import { map, mapLeft, toUnion } from "fp-ts/Either"
import { flow, pipe } from "fp-ts/function"
import { groupBy, mapObjIndexed, values } from "ramda"
import { mapFail } from "./core.js"
import { errorAt, formatError, formatPath } from "./formatting.js"
import { ErrorFormatter } from "./util.js"

/**
 * Throws if there is an error, otherwise returns the value.
 */
export const throwError = (formatter: ErrorFormatter = formatError(false)) => flow(singleErrorMessage(formatter), E.mapLeft(_ => { throw new globalThis.Error(_) }), toUnion)
/**
 * Turns the errors into a map of errors, where the key is the formatted path and the value is an array of errors for each key.
 */
export const groupErrors = () => mapFail(groupBy(_ => formatPath(_.path)))
/**
 * Turns the errors into a map of errors, where the key is the formatted path and the value is an array of string for each key.
 */
export const groupMessages = (formatter: ErrorFormatter = formatError(false)) => flow(groupErrors(), mapLeft(mapObjIndexed(_ => _!.map(formatter))))
/**
 * Turns the errors into a map of errors, where the key is the formatted path and the value is a single string of all the errors for that key.
 */
export const combineMessages = (formatter: ErrorFormatter = formatError(false)) => flow(groupErrors(), mapLeft(mapObjIndexed(error => formatter(error!) + ".")))
/**
 * Turns the errors into a list of error messages.
 */
export const messageList = (formatter: ErrorFormatter = formatError(false)) => flow(combineMessages(formatter), mapLeft(flow(mapObjIndexed((value, key) => errorAt(key, value)), values)))
/**
 * Turns the errors into one string.
 */
export const singleErrorMessage = (formatter: ErrorFormatter = formatError(false)) => flow(messageList(formatter), E.mapLeft(l => l.join("\n")))
export const singleErrorMessageOnly = (formatter: ErrorFormatter = formatError(false)) => flow(singleErrorMessage(formatter), failOnly)

/**
 * Returns only errors. If there are no errors, the value is undefined.
 */
export const errorMessagesOnly = (formatter: ErrorFormatter = formatError(false)) => flow(messageList(formatter), failOnly)
/**
 * Returns only errors. If there are no errors, the value is undefined.
 */
export const errorsOnly = () => flow(map(_ => undefined), toUnion)

/**
 * Returns only successful values. If there were errors, the value is undefined.
 */
export const failTo = <O>(value: O) => flow(E.mapLeft(_ => value), toUnion)
export const failToUndefined = failTo(undefined)

/**
 * Returns only failed values. If successful, the value is undefined.
 * @param either Either
 * @returns Failure or undefined.
 */
export function failOnly<E, A>(either: E.Either<E, A>) {
    return pipe(either, map(_ => undefined), toUnion)
}
