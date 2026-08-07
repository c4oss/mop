
import { ValueOrFactory } from "value-or-factory";
import { array } from "./array.js";
import { buildError, ErrorFactory, Result } from "./base.js";
import { failure, flatMap, flow, map, of } from "./core.js";
import { maybe, maybeOr, maybeOrNull, maybeOrUndefined } from "./optionality.js";
import { predicate } from "./test.js";

export const typed = <T>(value: Result<T>) => value
export const typedMaybe = <T>(value: Result<T | null | undefined>) => maybe(typed<T>)(value)
export const typedOr = <T>(factory: ValueOrFactory<T>) => maybeOr(typed<T>, factory)
export const typedOrUndefined = <T>(value: Result<T | null | undefined>) => maybeOrUndefined(typed<T>)(value)
export const typedOrNull = <T>(value: Result<T | null | undefined>) => maybeOrNull(typed<T>)(value)

/**
 * Casts an unknown value to a type.
 */
export const cast = <T>(value: Result<unknown>) => map(_ => _ as T)(value)

/**
 * A no-op string typed mapper, used for type inference.
 */
export const stringType = typed<string>
/**
 * A no-op boolean typed mapper, used for type inference.
 */
export const booleanType = typed<boolean>
/**
 * A no-op number typed mapper, used for type inference.
 */
export const numberType = typed<number>
/**
 * A no-op bigint typed mapper, used for type inference.
 */
export const bigintType = typed<bigint>
/**
 * A no-op object typed mapper, used for type inference.
 */
export const objectType = typed<object>
/**
 * A no-op symbol typed mapper, used for type inference.
 */
export const symbolType = typed<symbol>
/**
 * A no-op Date typed mapper, used for type inference.
 */
export const dateType = typed<Date>
/**
 * A no-op ArrayBuffer typed mapper, used for type inference.
 */
export const arrayBufferType = typed<ArrayBuffer>
/**
 * A no-op ArrayBufferView typed mapper, used for type inference.
 */
export const arrayBufferViewType = typed<ArrayBufferView>

export const isNull = (message?: ErrorFactory<unknown>) => predicate<unknown>(_ => _ === null, message)
export const isUndefined = (message?: ErrorFactory<unknown>) => predicate<unknown>(_ => _ === undefined, message)
export const isInstanceOf = <T, A extends unknown[]>(con: new (...args: A) => T, message: ErrorFactory<unknown> = "This value must be an instance of " + con.name) => flatMap((_: unknown) => _ instanceof con ? of(_) : failure(buildError(message, _)))
export const isType = <T>(type: string, message: ErrorFactory<unknown> = _ => "This value must be of type " + type) => flow(predicate<unknown>(_ => typeof _ === type, message), cast<T>)
export const isString = (message?: ErrorFactory<unknown>) => isType<string>("string", message)
export const isStringArray = (message?: ErrorFactory<unknown>) => flow(isArray(message), array(isString(message)))
export const isBoolean = (message?: ErrorFactory<unknown>) => isType<boolean>("boolean", message)
export const isBooleanArray = (message?: ErrorFactory<unknown>) => flow(isArray(message), array(isBoolean(message)))
export const isNumber = (message?: ErrorFactory<unknown>) => isType<number>("number", message)
export const isNumberArray = (message?: ErrorFactory<unknown>) => flow(isArray(message), array(isNumber(message)))
export const isBigint = (message?: ErrorFactory<unknown>) => isType<bigint>("bigint", message)
export const isBigintArray = (message?: ErrorFactory<unknown>) => flow(isArray(message), array(isBigint(message)))
export const isObject = (message?: ErrorFactory<unknown>) => isType<object>("object", message)
export const isObjectArray = (message?: ErrorFactory<unknown>) => flow(isArray(message), array(isObject(message)))
export const isSymbol = (message?: ErrorFactory<unknown>) => isType<symbol>("symbol", message)
export const isSymbolArray = (message?: ErrorFactory<unknown>) => flow(isArray(message), array(isSymbol(message)))
export const isArray = (message: ErrorFactory<unknown> = "This value must be an array") => flow(predicate<unknown>(Array.isArray, message), cast<readonly unknown[]>)
export const isArrayArray = (message?: ErrorFactory<unknown>) => flow(isArray(message), array(isArray(message)))
export const isArrayOf = <T>(type: string, message: ErrorFactory<unknown> = _ => "This value must be of type " + type) => flow(isArray(message), array(isType<T>(type, message)))
export const isDate = (message: ErrorFactory<unknown> = "This value must be a date") => flatMap((_: unknown) => _ instanceof Date ? of(_) : failure(buildError(message, _)))
export const isDateArray = (message?: ErrorFactory<unknown>) => flow(isArray(message), array(isDate(message)))
export const isArrayBufferView = (message: ErrorFactory<unknown> = "This value must be an array buffer view") => flatMap((_: unknown) => ArrayBuffer.isView(_) ? of(_) : failure(buildError(message, _)))
export const isArrayBufferViewArray = (message?: ErrorFactory<unknown>) => flow(isArray(message), array(isArrayBufferView(message)))
