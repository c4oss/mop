import { mapLeft } from "fp-ts/Either"
import { flow, pipe } from "fp-ts/function"
import { MapError, Mapper, Result } from "./base.js"
import { of } from "./core.js"
import { combineMessages, errorMessagesOnly, errorsOnly, failTo, failToUndefined, groupErrors, groupMessages, messageList, singleErrorMessage, singleErrorMessageOnly, throwError } from "./errors.js"
import { ErrorFormatter } from "./regex.js"

// The `exec*` functions run a mapper on a value immediately.
// The `transform*` functions build a reusable function that takes a value and runs the mapper on it.
// The suffix says what is returned when the mapper fails.

/**
 * Runs a mapper on a value and returns the result.
 */
export const exec = <I, O>(value: I, mapper: Mapper<I, O>) => pipe(value, transform(mapper))

/**
 * Runs a mapper on a value. On failure, replaces the errors with the result of `otherwise`.
 */
export const execOr = <I, O, F>(value: I, mapper: Mapper<I, O>, otherwise: (e: readonly MapError[]) => Result<F>) => pipe(value, transformOr(mapper, otherwise))

/**
 * Runs a mapper on a value and returns the output. On failure, throws an `Error` whose message lists the errors.
 */
export const execOrThrow = <I, O>(value: I, mapper: Mapper<I, O>, formatter?: ErrorFormatter | undefined) => pipe(value, of, mapper, throwError(formatter))

/**
 * Runs a mapper on a value and returns the output. On failure, returns `onFail`.
 */
export const execOrValue = <I, O, F>(value: I, onFail: F, mapper: Mapper<I, O>) => pipe(value, of, mapper, failTo<F>(onFail))

/**
 * Runs a mapper on a value. On failure, the errors are grouped by formatted path (see `groupErrors`).
 */
export const execOrGroup = <I, O>(value: I, mapper: Mapper<I, O>) => pipe(value, of, mapper, groupErrors())

/**
 * Runs a mapper on a value. On failure, the errors are messages grouped by formatted path (see `groupMessages`).
 */
export const execOrMessages = <I, O>(value: I, mapper: Mapper<I, O>, formatter?: ErrorFormatter | undefined) => pipe(value, of, mapper, groupMessages(formatter))

/**
 * Runs a mapper on a value. On failure, the errors are one combined message per formatted path (see `combineMessages`).
 */
export const execOrCombineMessages = <I, O>(value: I, mapper: Mapper<I, O>, formatter?: ErrorFormatter | undefined) => pipe(value, of, mapper, combineMessages(formatter))

/**
 * Runs a mapper on a value. On failure, the errors are a list of messages, one per path (see `messageList`).
 */
export const execOrMessageList = <I, O>(value: I, mapper: Mapper<I, O>, formatter?: ErrorFormatter | undefined) => pipe(value, of, mapper, messageList(formatter))

/**
 * Runs a mapper on a value and returns the output, or `undefined` on failure.
 */
export const execOrUndefined = <I, O>(value: I, mapper: Mapper<I, O>) => pipe(value, of, mapper, failToUndefined)

/**
 * Runs a mapper on a value. On failure, the errors are combined into a single message string (see `singleErrorMessage`).
 */
export const execOrSingleErrorMessage = <I, O>(value: I, mapper: Mapper<I, O>, formatter?: ErrorFormatter | undefined) => pipe(value, of, mapper, singleErrorMessage(formatter))

/**
 * Runs a mapper on a value and returns only the errors, or `undefined` on success.
 */
export const execOrErrorsOnly = <I, O>(value: I, mapper: Mapper<I, O>) => pipe(value, of, mapper, errorsOnly())

/**
 * Runs a mapper on a value and returns only the list of error messages, or `undefined` on success.
 */
export const execOrErrorMessagesOnly = <I, O>(value: I, mapper: Mapper<I, O>, formatter?: ErrorFormatter | undefined) => pipe(value, of, mapper, errorMessagesOnly(formatter))

/**
 * Runs a mapper on a value and returns only a single combined error message, or `undefined` on success.
 */
export const execOrSingleErrorMessageOnly = <I, O>(value: I, mapper: Mapper<I, O>, formatter?: ErrorFormatter | undefined) => pipe(value, of, mapper, singleErrorMessageOnly(formatter))

/**
 * Creates a function that runs a mapper on a value and returns the result.
 */
export const transform = <I, O>(mapper: Mapper<I, O>) => flow(of<I>, mapper)

/**
 * Creates a function that runs a mapper on a value. On failure, replaces the errors with the result of `otherwise`.
 */
export const transformOr = <I, O, F>(mapper: Mapper<I, O>, otherwise: (e: readonly MapError[]) => Result<F>) => flow(of<I>, mapper, mapLeft(otherwise))

/**
 * Creates a function that runs a mapper on a value and returns the output, or `onFail` on failure.
 */
export const transformOrValue = <I, O, F>(onFail: F, mapper: Mapper<I, O>) => flow(of<I>, mapper, failTo<F>(onFail))

/**
 * Creates a function that runs a mapper on a value and returns the output, or `undefined` on failure.
 */
export const transformOrUndefined = <I, O>(mapper: Mapper<I, O>) => flow(of<I>, mapper, failToUndefined)

/**
 * Creates a function that runs a mapper on a value and returns the output. On failure, throws an `Error` whose message lists the errors.
 */
export const transformOrThrow = <I, O>(mapper: Mapper<I, O>, formatter?: ErrorFormatter | undefined) => flow(of<I>, mapper, throwError(formatter))

/**
 * Creates a function that runs a mapper on a value. On failure, the errors are grouped by formatted path (see `groupErrors`).
 */
export const transformOrGroup = <I, O>(mapper: Mapper<I, O>) => flow(of<I>, mapper, groupErrors())

/**
 * Creates a function that runs a mapper on a value. On failure, the errors are messages grouped by formatted path (see `groupMessages`).
 */
export const transformOrMessages = <I, O>(mapper: Mapper<I, O>, formatter?: ErrorFormatter | undefined) => flow(of<I>, mapper, groupMessages(formatter))

/**
 * Creates a function that runs a mapper on a value. On failure, the errors are one combined message per formatted path (see `combineMessages`).
 */
export const transformOrCombineMessages = <I, O>(mapper: Mapper<I, O>, formatter?: ErrorFormatter | undefined) => flow(of<I>, mapper, combineMessages(formatter))

/**
 * Creates a function that runs a mapper on a value. On failure, the errors are a list of messages, one per path (see `messageList`).
 */
export const transformOrMessageList = <I, O>(mapper: Mapper<I, O>, formatter?: ErrorFormatter | undefined) => flow(of<I>, mapper, messageList(formatter))

/**
 * Creates a function that runs a mapper on a value. On failure, the errors are combined into a single message string (see `singleErrorMessage`).
 */
export const transformOrSingleErrorMessage = <I, O>(mapper: Mapper<I, O>, formatter?: ErrorFormatter | undefined) => flow(of<I>, mapper, singleErrorMessage(formatter))

/**
 * Creates a function that runs a mapper on a value and returns only the errors, or `undefined` on success.
 */
export function transformOrErrorsOnly<I, O>(mapper: Mapper<I, O>) {
    return flow(of<I>, mapper, errorsOnly())
}

/**
 * Creates a function that runs a mapper on a value and returns only the list of error messages, or `undefined` on success.
 */
export function transformOrErrorMessagesOnly<I, O>(mapper: Mapper<I, O>, formatter?: ErrorFormatter | undefined) {
    return flow(of<I>, mapper, errorMessagesOnly(formatter))
}

/**
 * Creates a function that runs a mapper on a value and returns only a single combined error message, or `undefined` on success.
 */
export function transformOrSingleErrorMessageOnly<I, O>(mapper: Mapper<I, O>, formatter?: ErrorFormatter | undefined) {
    return flow(of<I>, mapper, singleErrorMessageOnly(formatter))
}
