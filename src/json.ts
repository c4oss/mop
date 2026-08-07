import { ErrorFactory, buildError } from "./base.js";
import { failure, flatMap, flow, success } from "./core.js";
import { tryCatch } from "./try-catch.js";
import { isArray, isArrayArray, isBoolean, isBooleanArray, isNumber, isNumberArray, isObject, isObjectArray, isString, isStringArray } from "./types.js";

export type JsonPrimitive = string | number | null | boolean
export type JsonArray = readonly Json[]
export type JsonObject = { readonly [K in string]: Json } & { readonly [K in string]?: Json | undefined };
export type Json = JsonPrimitive | JsonArray | JsonObject

/**
 * Creates a mapper that parses a string into JSON.
 */
export const fromJson = (error: ErrorFactory<[unknown, string]> = _ => "This is not valid json") => tryCatch<string, Json>(JSON.parse, error)

/**
 * Creates a mapper that stringifies JSON.
 */
export const toJson = (error: ErrorFactory<[unknown, unknown]> = _ => "Could not stringify to JSON") => tryCatch<unknown, string>(JSON.stringify, error)

/**
 * Creates a mapper that validates that the input is a json serializable value.
 */
export const isJson = (error: ErrorFactory<unknown> = "This value is not a JSON value") => flatMap((input: unknown) => {
    if (jsonTest(input)) {
        return success(input)
    }
    else {
        return failure(buildError(error, input))
    }
})

/**
 * Creates a mapper that validates that the input is a json serializable primitive.
 */
export const isJsonPrimitive = (error: ErrorFactory<unknown> = "This value is not a JSON primitive") => flatMap((input: unknown) => {
    if (jsonObjectTest(input)) {
        return success(input)
    }
    else {
        return failure(buildError(error, input))
    }
})

/**
 * Creates a mapper that validates that the input is a json serializable object.
 */
export const isJsonObject = (error: ErrorFactory<unknown> = "This value is not a JSON object") => flatMap((input: unknown) => {
    if (jsonObjectTest(input)) {
        return success(input)
    }
    else {
        return failure(buildError(error, input))
    }
})

/**
 * Creates a mapper that validates that the input is a json serializable array.
 */
export const isJsonArray = (error: ErrorFactory<unknown> = "This value is not a JSON array") => flatMap((input: unknown) => {
    if (jsonArrayTest(input)) {
        return success(input)
    }
    else {
        return failure(buildError(error, input))
    }
})

/*
export const isJsonArrayOfStrings = (message?: ErrorFactory<unknown>) => flow(isStringArray(message))
export const isJsonArrayOfNumbers = (message?: ErrorFactory<unknown>) => flow(isNumberArray(message))
export const isJsonArrayOfBooleans = (message?: ErrorFactory<unknown>) => flow(isBooleanArray(message))
export const isJsonArrayOfObjects = (message?: ErrorFactory<unknown>) => flow(isObjectArray(message))
export const isJsonArrayOfArrays = (message?: ErrorFactory<unknown>) => flow(isArrayArray(message))
*/

export const fromJsonString = (error?: ErrorFactory<unknown>) => flow(fromJson(error), isString(error))
export const fromJsonNumber = (error?: ErrorFactory<unknown>) => flow(fromJson(error), isNumber(error))
export const fromJsonBoolean = (error?: ErrorFactory<unknown>) => flow(fromJson(error), isBoolean(error))
export const fromJsonObject = (error?: ErrorFactory<unknown>) => flow(fromJson(error), isObject(error))
export const fromJsonArray = (error?: ErrorFactory<unknown>) => flow(fromJson(error), isArray(error))

export const fromJsonArrayOfStrings = (error?: ErrorFactory<unknown>) => flow(fromJson(error), isStringArray(error))
export const fromJsonArrayOfNumbers = (error?: ErrorFactory<unknown>) => flow(fromJson(error), isNumberArray(error))
export const fromJsonArrayOfBooleans = (error?: ErrorFactory<unknown>) => flow(fromJson(error), isBooleanArray(error))
export const fromJsonArrayOfObjects = (error?: ErrorFactory<unknown>) => flow(fromJson(error), isObjectArray(error))
export const fromJsonArrayOfArrays = (error?: ErrorFactory<unknown>) => flow(fromJson(error), isArrayArray(error))

/**
 * Internal utility function. Tests if the input is a json serializable value.
 */
function jsonTest(value: unknown): value is Json {
    return jsonPrimitiveTest(value) || jsonArrayTest(value) || jsonObjectTest(value)
}
/**
 * Internal utility function. Tests if the input is a json serializable object.
 */
function jsonObjectTest(value: unknown): value is JsonObject {
    if (typeof value !== "object" || value === null) {
        return false
    }
    else {
        return Object.values(value).every(jsonTest)
    }
}
/**
 * Internal utility function. Tests if the input is a json serializable array.
 */
function jsonArrayTest(value: unknown): value is JsonArray {
    if (!Array.isArray(value)) {
        return false
    }
    else {
        return value.every(jsonTest)
    }
}
/**
 * Internal utility function. Tests if the input is a json serializable primitive.
 */
function jsonPrimitiveTest(value: unknown): value is JsonPrimitive {
    return value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean"
}
