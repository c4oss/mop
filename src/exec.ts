import { mapLeft } from "fp-ts/Either"
import { flow, pipe } from "fp-ts/function"
import { MapError, Mapper, Result } from "./base.js"
import { of } from "./core.js"
import { combineMessages, errorMessagesOnly, errorsOnly, failTo, failToUndefined, groupErrors, groupMessages, messageList, singleErrorMessage, singleErrorMessageOnly, throwError } from "./errors.js"
import { ErrorFormatter } from "./util.js"

export const exec = <I, O>(value: I, mapper: (value: Result<I>) => O) => pipe(value, transform(mapper))
export const execOr = <I, O, F>(value: I, mapper: Mapper<I, O>, otherwise: (e: readonly MapError[]) => Result<F>) => pipe(value, transformOr(mapper, otherwise))
export const execOrThrow = <I, O>(value: I, mapper: Mapper<I, O>, formatter?: ErrorFormatter | undefined) => pipe(value, of, mapper, throwError(formatter))
export const execOrValue = <I, O, F>(value: I, onFail: F, mapper: Mapper<I, O>) => pipe(value, of, mapper, failTo<F>(onFail))
export const execOrGroup = <I, O>(value: I, mapper: Mapper<I, O>) => pipe(value, of, mapper, groupErrors())
export const execOrMessages = <I, O>(value: I, mapper: Mapper<I, O>, formatter?: ErrorFormatter | undefined) => pipe(value, of, mapper, groupMessages(formatter))
export const execOrCombineMessages = <I, O>(value: I, mapper: Mapper<I, O>, formatter?: ErrorFormatter | undefined) => pipe(value, of, mapper, combineMessages(formatter))
export const execOrMessageList = <I, O>(value: I, mapper: Mapper<I, O>, formatter?: ErrorFormatter | undefined) => pipe(value, of, mapper, messageList(formatter))
export const execOrUndefined = <I, O>(value: I, mapper: Mapper<I, O>) => pipe(value, of, mapper, failToUndefined)
export const execOrSingleErrorMessage = <I, O>(value: I, mapper: Mapper<I, O>, formatter?: ErrorFormatter | undefined) => pipe(value, of, mapper, singleErrorMessage(formatter))

export const execOrErrorsOnly = <I, O>(value: I, mapper: Mapper<I, O>) => pipe(value, of, mapper, errorsOnly())
export const execOrErrorMessagesOnly = <I, O>(value: I, mapper: Mapper<I, O>, formatter?: ErrorFormatter | undefined) => pipe(value, of, mapper, errorMessagesOnly(formatter))
export const execOrSingleErrorMessageOnly = <I, O>(value: I, mapper: Mapper<I, O>, formatter?: ErrorFormatter | undefined) => pipe(value, of, mapper, singleErrorMessageOnly(formatter))

export const transform = <I, O>(mapper: (value: Result<I>) => O) => flow(of<I>, mapper)
export const transformOr = <I, O, F>(mapper: Mapper<I, O>, otherwise: (e: readonly MapError[]) => Result<F>) => flow(of<I>, mapper, mapLeft(otherwise))
export const transformOrValue = <I, O, F>(onFail: F, mapper: Mapper<I, O>) => flow(of<I>, mapper, failTo<F>(onFail))
export const transformOrUndefined = <I, O>(mapper: Mapper<I, O>) => flow(of<I>, mapper, failToUndefined)
export const transformOrThrow = <I, O>(mapper: Mapper<I, O>, formatter?: ErrorFormatter | undefined) => flow(of<I>, mapper, throwError(formatter))
export const transformOrGroup = <I, O>(mapper: Mapper<I, O>) => flow(of<I>, mapper, groupErrors())
export const transformOrMessages = <I, O>(mapper: Mapper<I, O>, formatter?: ErrorFormatter | undefined) => flow(of<I>, mapper, groupMessages(formatter))
export const transformOrCombineMessages = <I, O>(mapper: Mapper<I, O>, formatter?: ErrorFormatter | undefined) => flow(of<I>, mapper, combineMessages(formatter))
export const transformOrMessageList = <I, O>(mapper: Mapper<I, O>, formatter?: ErrorFormatter | undefined) => flow(of<I>, mapper, messageList(formatter))
export const transformOrSingleErrorMessage = <I, O>(mapper: Mapper<I, O>, formatter?: ErrorFormatter | undefined) => flow(of<I>, mapper, singleErrorMessage(formatter))

export const transformOrErrorsOnly = <I, O>(mapper: Mapper<I, O>) => flow(of<I>, mapper, errorsOnly())
export const transformOrErrorMessagesOnly = <I, O>(mapper: Mapper<I, O>, formatter?: ErrorFormatter | undefined) => flow(of<I>, mapper, errorMessagesOnly(formatter))
export const transformOrSingleErrorMessageOnly = <I, O>(mapper: Mapper<I, O>, formatter?: ErrorFormatter | undefined) => flow(of<I>, mapper, singleErrorMessageOnly(formatter))
