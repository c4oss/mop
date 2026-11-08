
import { ValueOrFactory } from "value-or-factory";
import { array } from "./array.js";
import { error, ErrorFactory, Result } from "./base.js";
import { failure, flatMap, flow, map, of } from "./core.js";
import { maybe, maybeOr, maybeOrNull, maybeOrUndefined } from "./optionality.js";
import { predicate } from "./test.js";

/**
 * A mapper that returns its input unchanged, used to declare the type at a point in a `flow`. Does not check anything at runtime.
 */
export const typed = <T>(value: Result<T>) => value
/**
 * Like `typed`, but the value may also be `null` or `undefined`.
 */
export const typedMaybe = <T>(value: Result<T | null | undefined>) => maybe(typed<T>)(value)
/**
 * Like `typed`, but `null` and `undefined` are replaced with a default value.
 */
export const typedOr = <T>(factory: ValueOrFactory<T>) => maybeOr(typed<T>, factory)
/**
 * Like `typed`, but `null` becomes `undefined`.
 */
export const typedOrUndefined = <T>(value: Result<T | null | undefined>) => maybeOrUndefined(typed<T>)(value)
/**
 * Like `typed`, but `undefined` becomes `null`.
 */
export const typedOrNull = <T>(value: Result<T | null | undefined>) => maybeOrNull(typed<T>)(value)

/**
 * A mapper that casts a value to type `T`. Does not check anything at runtime.
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

// Runtime type checks. Each creates a mapper that fails if the value is not of the expected type, and narrows the type if it is.
// The `*Array` variants require an array and check every element, prefixing errors with the element's index.

/**
 * Creates a mapper that requires the value to be `null`.
 */
export const isNull = (message?: ErrorFactory<unknown>) => predicate<unknown>(_ => _ === null, message)
/**
 * Creates a mapper that requires the value to be `undefined`.
 */
export const isUndefined = (message?: ErrorFactory<unknown>) => predicate<unknown>(_ => _ === undefined, message)
/**
 * Creates a mapper that requires the value to be an instance of a class.
 */
export const isInstanceOf = <T, A extends unknown[]>(con: new (...args: A) => T, message: ErrorFactory<unknown> = "This value must be an instance of " + con.name) => flatMap((_: unknown) => _ instanceof con ? of(_) : failure(error(message, _)))
/**
 * Creates a mapper that requires `typeof value` to equal `type`, and casts it to `T`.
 */
export const isType = <T>(type: string, message: ErrorFactory<unknown> = _ => "This value must be of type " + type) => flow(predicate<unknown>(_ => typeof _ === type, message), cast<T>)
/**
 * Creates a mapper that requires the value to be a string.
 */
export const isString = (message?: ErrorFactory<unknown>) => isType<string>("string", message)
/**
 * Creates a mapper that requires the value to be an array of strings.
 */
export const isStringArray = (message?: ErrorFactory<unknown>) => flow(isArray(message), array(isString(message)))
/**
 * Creates a mapper that requires the value to be a boolean.
 */
export const isBoolean = (message?: ErrorFactory<unknown>) => isType<boolean>("boolean", message)
/**
 * Creates a mapper that requires the value to be an array of booleans.
 */
export const isBooleanArray = (message?: ErrorFactory<unknown>) => flow(isArray(message), array(isBoolean(message)))
/**
 * Creates a mapper that requires the value to be a number. `NaN` passes.
 */
export const isNumber = (message?: ErrorFactory<unknown>) => isType<number>("number", message)
/**
 * Creates a mapper that requires the value to be an array of numbers.
 */
export const isNumberArray = (message?: ErrorFactory<unknown>) => flow(isArray(message), array(isNumber(message)))
/**
 * Creates a mapper that requires the value to be a bigint.
 */
export const isBigint = (message?: ErrorFactory<unknown>) => isType<bigint>("bigint", message)
/**
 * Creates a mapper that requires the value to be an array of bigints.
 */
export const isBigintArray = (message?: ErrorFactory<unknown>) => flow(isArray(message), array(isBigint(message)))
/**
 * Creates a mapper that requires `typeof value` to be "object". Arrays and `null` also pass.
 */
export const isObject = (message?: ErrorFactory<unknown>) => isType<object>("object", message)
/**
 * Creates a mapper that requires the value to be an array of objects (see `isObject`).
 */
export const isObjectArray = (message?: ErrorFactory<unknown>) => flow(isArray(message), array(isObject(message)))
/**
 * Creates a mapper that requires the value to be a symbol.
 */
export const isSymbol = (message?: ErrorFactory<unknown>) => isType<symbol>("symbol", message)
/**
 * Creates a mapper that requires the value to be an array of symbols.
 */
export const isSymbolArray = (message?: ErrorFactory<unknown>) => flow(isArray(message), array(isSymbol(message)))
/**
 * Creates a mapper that requires the value to be an array (of unknown elements).
 */
export const isArray = (message: ErrorFactory<unknown> = "This value must be an array") => flow(predicate<unknown>(Array.isArray, message), cast<readonly unknown[]>)
/**
 * Creates a mapper that requires the value to be an array of arrays.
 */
export const isArrayArray = (message?: ErrorFactory<unknown>) => flow(isArray(message), array(isArray(message)))
/**
 * Creates a mapper that requires the value to be an array whose elements all have `typeof` equal to `type`.
 */
export const isArrayOf = <T>(type: string, message: ErrorFactory<unknown> = _ => "This value must be of type " + type) => flow(isArray(message), array(isType<T>(type, message)))
/**
 * Creates a mapper that requires the value to be a `Date`. Invalid dates pass.
 */
export const isDate = (message: ErrorFactory<unknown> = "This value must be a date") => flatMap((_: unknown) => _ instanceof Date ? of(_) : failure(error(message, _)))
/**
 * Creates a mapper that requires the value to be an array of `Date`s.
 */
export const isDateArray = (message?: ErrorFactory<unknown>) => flow(isArray(message), array(isDate(message)))
/**
 * Creates a mapper that requires the value to be an `ArrayBufferView` (a typed array or `DataView`).
 */
export const isArrayBufferView = (message: ErrorFactory<unknown> = "This value must be an array buffer view") => flatMap((_: unknown) => ArrayBuffer.isView(_) ? of(_) : failure(error(message, _)))
/**
 * Creates a mapper that requires the value to be an array of `ArrayBufferView`s.
 */
export const isArrayBufferViewArray = (message?: ErrorFactory<unknown>) => flow(isArray(message), array(isArrayBufferView(message)))
