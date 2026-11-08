
import { flow } from "fp-ts/function"
import { InputType, Mapper, OutputType } from "./base.js"
import { flattenObject } from "./flatten.js"
import { onlyHasKeys } from "./on-object.js"
import { rawObject } from "./raw-object.js"
import { cast, typed } from "./types.js"
import { OptionalKeys, RequiredKeys } from "./util.js"

/**
 * An object schema: a mapper for each key.
 */
export type ObjectSchema = { readonly [K: string]: Mapper<never, unknown> }

/**
 * The input type of an object schema. Keys whose mapper accepts `undefined` are optional.
 */
export type ObjectInput<S extends ObjectSchema> = { readonly [K in RequiredKeys<{ [K in keyof S]: InputType<S[K]> }>]: InputType<S[K]> } & { [K in OptionalKeys<{ [K in keyof S]: InputType<S[K]> }>]?: InputType<S[K]> }

/**
 * The output type of a strict object schema: exactly the schema's keys.
 */
export type StrictObjectOutput<S extends ObjectSchema> = { readonly [K in keyof S]: OutputType<S[K]> }

/**
 * The output type of an object schema: the schema's keys, plus any other keys of unknown type.
 */
export type ObjectOutput<S extends ObjectSchema> = { readonly [K in keyof S]: OutputType<S[K]> } & { readonly [key: string]: unknown }

//TODO if ANY key = type O, what about the keys in ObjectSchema?
/**
 * The output type of a loose object schema: the schema's keys, plus any other keys of type `O`.
 */
export type LooseObjectOutput<S extends ObjectSchema, O> = { readonly [K in keyof S]: OutputType<S[K]> } & { readonly [key: string]: O }

/**
 * Creates a mapper that validates an object by running each schema mapper on the matching key.
 * The output contains only the schema's keys. Fails with the errors of every failing key, each prefixed with its key.
 */
export function object<S extends ObjectSchema>(schema: S) {
    return flow(
        typed<ObjectInput<S>>,
        rawObject(schema),
        flattenObject(),
        cast<ObjectOutput<S>>
    )
}

/**
 * Like `object`, but first fails if the input has any keys that are not in the schema (see `onlyHasKeys`).
 */
export function strictObject<S extends ObjectSchema>(schema: S) {
    return flow(
        typed<ObjectInput<S>>,
        onlyHasKeys(...Object.keys(schema)),
        rawObject(schema),
        flattenObject(),
        cast<StrictObjectOutput<S>>
    )
}

//TODO loose object?
