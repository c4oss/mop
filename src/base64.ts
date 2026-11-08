import { Base64 } from "js-base64"
import { ErrorFactory } from "./base.js"
import { tryCatch } from "./try-catch.js"

/**
 * Creates a mapper that decodes a base64 (or base64url) string into bytes.
 * @param error The error to use if decoding throws. Receives `[thrown error, input]`.
 */
export const base64ToUint8Array = (error?: ErrorFactory<[unknown, string]>) => tryCatch(Base64.toUint8Array, error)

/**
 * Creates a mapper that encodes bytes as a base64 string.
 * @param urlSafe Use the URL-safe base64 alphabet without padding.
 * @param error The error to use if encoding throws. Receives `[thrown error, input]`.
 */
export const uint8ArrayToBase64 = (urlSafe?: boolean | undefined, error?: ErrorFactory<[unknown, Uint8Array]>) => tryCatch((id: Uint8Array) => Base64.fromUint8Array(id, urlSafe), error)
