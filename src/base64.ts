import { Base64 } from "js-base64"
import { ErrorFactory } from "./base.js"
import { tryCatch } from "./try-catch.js"

/**
 * Convert a base64 string to an ID.
 */
export const base64StringToUint8Array = (error?: ErrorFactory<[unknown, string]>) => tryCatch(Base64.toUint8Array, error)

/**
 * Convert an ID to a base64 string.
 */
export const uint8ArrayToBase64String = (urlSafe?: boolean | undefined, error?: ErrorFactory<[unknown, Uint8Array]>) => tryCatch((id: Uint8Array) => Base64.fromUint8Array(id, urlSafe), error)
