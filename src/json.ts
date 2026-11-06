import { error, ErrorFactory } from "./base.js";
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
export const toJson = (errorFactory: ErrorFactory<[unknown, unknown]> = _ => "Could not stringify to JSON") => tryCatch<unknown, string>(JSON.stringify, errorFactory)

/**
 * Creates a mapper that validates that the input is a json serializable value.
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
 * Creates a mapper that validates that the input is a json serializable primitive.
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
 * Creates a mapper that validates that the input is a json serializable object.
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
 * Creates a mapper that validates that the input is a json serializable array.
 */
export const isJsonArray = (errorFactory: ErrorFactory<unknown> = "This value is not a JSON array") => flatMap((input: unknown) => {
    if (jsonArrayTest(input)) {
        return success(input)
    }
    else {
        return failure(error(errorFactory, input))
    }
})

export const fromJsonString = (errorFactory?: ErrorFactory<unknown>) => flow(fromJson(errorFactory), isString(errorFactory))
export const fromJsonNumber = (errorFactory?: ErrorFactory<unknown>) => flow(fromJson(errorFactory), isNumber(errorFactory))
export const fromJsonBoolean = (errorFactory?: ErrorFactory<unknown>) => flow(fromJson(errorFactory), isBoolean(errorFactory))
export const fromJsonObject = (errorFactory?: ErrorFactory<unknown>) => flow(fromJson(errorFactory), isObject(errorFactory))
export const fromJsonArray = (errorFactory?: ErrorFactory<unknown>) => flow(fromJson(errorFactory), isArray(errorFactory))

export const fromJsonArrayOfStrings = (errorFactory?: ErrorFactory<unknown>) => flow(fromJson(errorFactory), isStringArray(errorFactory))
export const fromJsonArrayOfNumbers = (errorFactory?: ErrorFactory<unknown>) => flow(fromJson(errorFactory), isNumberArray(errorFactory))
export const fromJsonArrayOfBooleans = (errorFactory?: ErrorFactory<unknown>) => flow(fromJson(errorFactory), isBooleanArray(errorFactory))
export const fromJsonArrayOfObjects = (errorFactory?: ErrorFactory<unknown>) => flow(fromJson(errorFactory), isObjectArray(errorFactory))
export const fromJsonArrayOfArrays = (errorFactory?: ErrorFactory<unknown>) => flow(fromJson(errorFactory), isArrayArray(errorFactory))

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
