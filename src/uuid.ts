import { parse, stringify } from "uuid"
import { ErrorFactory } from "./base.js"
import { tryCatch } from "./try-catch.js"

/**
 * Convert a string to a UUID.
 */
export const stringToUuid = (errorFactory?: ErrorFactory<[unknown, string]> | undefined) => tryCatch(parse, errorFactory)

/**
 * Convert a UUID to a string.
 */
export const uuidToString = (errorFactory?: ErrorFactory<[unknown, Uint8Array]> | undefined) => tryCatch(stringify, errorFactory)
