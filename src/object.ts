
import { flow } from "fp-ts/function"
import { InputType, Mapper, OutputType } from "./base.js"
import { flattenObject } from "./flatten.js"
import { onlyHasKeys } from "./on-object.js"
import { rawObject } from "./raw-object.js"
import { cast, typed } from "./types.js"
import { OptionalKeys, RequiredKeys } from "./util.js"

export type ObjectSchema = { readonly [K: string]: Mapper<never, unknown> }

export type ObjectInput<S extends ObjectSchema> = { readonly [K in RequiredKeys<{ [K in keyof S]: InputType<S[K]> }>]: InputType<S[K]> } & { [K in OptionalKeys<{ [K in keyof S]: InputType<S[K]> }>]?: InputType<S[K]> }

export type StrictObjectOutput<S extends ObjectSchema> = { readonly [K in keyof S]: OutputType<S[K]> }
export type ObjectOutput<S extends ObjectSchema> = { readonly [K in keyof S]: OutputType<S[K]> } & { readonly [key: string]: unknown }
//TODO if ANY key = type O, what about the keys in ObjectSchema?
export type LooseObjectOutput<S extends ObjectSchema, O> = { readonly [K in keyof S]: OutputType<S[K]> } & { readonly [key: string]: O }

export function object<S extends ObjectSchema>(schema: S) {
    return flow(
        typed<ObjectInput<S>>,
        rawObject(schema),
        flattenObject(),
        cast<ObjectOutput<S>>
    )
}

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
