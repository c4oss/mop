import { parse, stringify } from "uuid"
import { ErrorFactory } from "./base.js"
import { tryCatch } from "./try-catch.js"

/**
 * Creates a mapper that parses a UUID string into its 16 bytes. Fails if the string is not a valid UUID.
 */
export const stringToUuid = (errorFactory?: ErrorFactory<[unknown, string]> | undefined) => tryCatch(parse, errorFactory)

/**
 * Creates a mapper that formats 16 bytes as a UUID string. Fails if the bytes are not a valid UUID.
 */
export const uuidToString = (errorFactory?: ErrorFactory<[unknown, Uint8Array]> | undefined) => tryCatch(stringify, errorFactory)
