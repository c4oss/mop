import { Mapper } from "./base.js"
import { flow } from "./core.js"
import { LooseObjectOutput, ObjectOutput, StrictObjectOutput } from "./object.js"
import { onlyHasKeys } from "./on-object.js"
import { record } from "./record.js"
import { cast, typed } from "./types.js"

/**
 * An object with string keys and values of unknown type.
 */
export type UnknownObject = { readonly [key: string]: unknown }

/**
 * A schema for `unknownObject`: a mapper from `unknown` for each key.
 */
export type UnknownObjectSchema = { readonly [K: string]: Mapper<unknown, unknown> }

/**
 * Creates a mapper that validates an object of unknown shape by running each schema mapper on the matching key.
 * Unlike `object`, it iterates over the input's keys: keys not in the schema are kept unchanged, and schema keys
 * missing from the input are not checked. Errors are prefixed with the key.
 */
export function unknownObject<S extends UnknownObjectSchema>(schema: S) {
    return flow(
        typed<UnknownObject>,
        record(key => schema[key] ?? typed<unknown>),
        cast<ObjectOutput<S>>
    )
}

/**
 * Like `unknownObject`, but keys not in the schema are transformed with the mapper returned by `other`.
 */
export function looseUnknownObject<S extends UnknownObjectSchema, O>(schema: S, other: (key: string) => Mapper<unknown, O>) {
    return flow(
        typed<UnknownObject>,
        record(key => schema[key] ?? other(key)),
        cast<LooseObjectOutput<S, O>>
    )
}

/**
 * Like `unknownObject`, but first fails if the input has any keys that are not in the schema (see `onlyHasKeys`).
 */
export function strictUnknownObject<S extends UnknownObjectSchema>(schema: S) {
    return flow(
        typed<UnknownObject>,
        onlyHasKeys(...Object.keys(schema)),
        unknownObject(schema),
        cast<StrictObjectOutput<S>>
    )
}
