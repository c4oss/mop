import { error, ErrorFactory } from "./base.js";
import { failure, flatMap, flow, success } from "./core.js";
import { tryCatch } from "./try-catch.js";
import { isArray, isArrayArray, isBoolean, isBooleanArray, isNumber, isNumberArray, isObject, isObjectArray, isString, isStringArray } from "./types.js";

/**
 * A JSON primitive value.
 */
export type JsonPrimitive = string | number | null | boolean

/**
 * A JSON array.
 */
export type JsonArray = readonly Json[]

/**
 * A JSON object. Optional (undefined) properties are allowed.
 */
export type JsonObject = { readonly [K in string]: Json } & { readonly [K in string]?: Json | undefined };

/**
 * Any JSON value.
 */
export type Json = JsonPrimitive | JsonArray | JsonObject

/**
 * Creates a mapper that parses a JSON string. Fails if the string is not valid JSON.
 */
export const fromJson = (error: ErrorFactory<[unknown, string]> = _ => "This is not valid json") => tryCatch<string, Json>(JSON.parse, error)

/**
 * Creates a mapper that converts a value to a JSON string. Fails if `JSON.stringify` throws.
 */
export const toJson = (errorFactory: ErrorFactory<[unknown, unknown]> = _ => "Could not stringify to JSON") => tryCatch<unknown, string>(JSON.stringify, errorFactory)

/**
 * Creates a mapper that validates that the input is a JSON value (checked recursively).
 */
export const isJson = (errorFactory: ErrorFactory<unknown> = "This value is not a JSON value") => flatMap((input: unknown) => {
    if (jsonTest(input)) {
        return success(input)
    }
    else {
        return failure(error(errorFactory, input))
    }
})

/**
 * Creates a mapper that is meant to validate that the input is a JSON primitive.
 * Note: it currently uses the JSON object test, so it accepts JSON objects and arrays and rejects primitives.
 */
export const isJsonPrimitive = (errorFactory: ErrorFactory<unknown> = "This value is not a JSON primitive") => flatMap((input: unknown) => {
    if (jsonObjectTest(input)) {
        return success(input)
    }
    else {
        return failure(error(errorFactory, input))
    }
})

/**
 * Creates a mapper that validates that the input is a JSON object (checked recursively). Arrays also pass this check.
 */
export const isJsonObject = (errorFactory: ErrorFactory<unknown> = "This value is not a JSON object") => flatMap((input: unknown) => {
    if (jsonObjectTest(input)) {
        return success(input)
    }
    else {
        return failure(error(errorFactory, input))
    }
})

/**
 * Creates a mapper that validates that the input is a JSON array (checked recursively).
 */
export const isJsonArray = (errorFactory: ErrorFactory<unknown> = "This value is not a JSON array") => flatMap((input: unknown) => {
    if (jsonArrayTest(input)) {
        return success(input)
    }
    else {
        return failure(error(errorFactory, input))
    }
})

/**
 * Creates a mapper that parses a JSON string and requires the result to be a string.
 */
export const fromJsonString = (errorFactory?: ErrorFactory<unknown>) => flow(fromJson(errorFactory), isString(errorFactory))
/**
 * Creates a mapper that parses a JSON string and requires the result to be a number.
 */
export const fromJsonNumber = (errorFactory?: ErrorFactory<unknown>) => flow(fromJson(errorFactory), isNumber(errorFactory))
/**
 * Creates a mapper that parses a JSON string and requires the result to be a boolean.
 */
export const fromJsonBoolean = (errorFactory?: ErrorFactory<unknown>) => flow(fromJson(errorFactory), isBoolean(errorFactory))
/**
 * Creates a mapper that parses a JSON string and requires the result to be an object (`typeof` "object", so arrays and null also pass).
 */
export const fromJsonObject = (errorFactory?: ErrorFactory<unknown>) => flow(fromJson(errorFactory), isObject(errorFactory))
/**
 * Creates a mapper that parses a JSON string and requires the result to be an array.
 */
export const fromJsonArray = (errorFactory?: ErrorFactory<unknown>) => flow(fromJson(errorFactory), isArray(errorFactory))

/**
 * Creates a mapper that parses a JSON string and requires the result to be an array of strings.
 */
export const fromJsonArrayOfStrings = (errorFactory?: ErrorFactory<unknown>) => flow(fromJson(errorFactory), isStringArray(errorFactory))
/**
 * Creates a mapper that parses a JSON string and requires the result to be an array of numbers.
 */
export const fromJsonArrayOfNumbers = (errorFactory?: ErrorFactory<unknown>) => flow(fromJson(errorFactory), isNumberArray(errorFactory))
/**
 * Creates a mapper that parses a JSON string and requires the result to be an array of booleans.
 */
export const fromJsonArrayOfBooleans = (errorFactory?: ErrorFactory<unknown>) => flow(fromJson(errorFactory), isBooleanArray(errorFactory))
/**
 * Creates a mapper that parses a JSON string and requires the result to be an array of objects.
 */
export const fromJsonArrayOfObjects = (errorFactory?: ErrorFactory<unknown>) => flow(fromJson(errorFactory), isObjectArray(errorFactory))
/**
 * Creates a mapper that parses a JSON string and requires the result to be an array of arrays.
 */
export const fromJsonArrayOfArrays = (errorFactory?: ErrorFactory<unknown>) => flow(fromJson(errorFactory), isArrayArray(errorFactory))

/**
 * Internal utility function. Tests if the input is a JSON value, recursively.
 */
function jsonTest(value: unknown): value is Json {
    return jsonPrimitiveTest(value) || jsonArrayTest(value) || jsonObjectTest(value)
}
/**
 * Internal utility function. Tests if the input is a non-null object whose values are all JSON values. Arrays also pass.
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
 * Internal utility function. Tests if the input is an array whose elements are all JSON values.
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
 * Internal utility function. Tests if the input is a JSON primitive (string, number, boolean or null).
 */
function jsonPrimitiveTest(value: unknown): value is JsonPrimitive {
    return value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean"
}
