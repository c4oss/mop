import { Mapper } from "./base.js"
import { flow } from "./core.js"
import { LooseObjectOutput, ObjectOutput, StrictObjectOutput } from "./object.js"
import { onlyHasKeys } from "./on-object.js"
import { record } from "./record.js"
import { cast, typed } from "./types.js"

export type UnknownObject = { readonly [key: string]: unknown }
export type UnknownObjectSchema = { readonly [K: string]: Mapper<unknown, unknown> }

export function unknownObject<S extends UnknownObjectSchema>(schema: S) {
    return flow(
        typed<UnknownObject>,
        record(key => schema[key] ?? typed<unknown>),
        cast<ObjectOutput<S>>
    )
}
export function looseUnknownObject<S extends UnknownObjectSchema, O>(schema: S, other: (key: string) => Mapper<unknown, O>) {
    return flow(
        typed<UnknownObject>,
        record(key => schema[key] ?? other(key)),
        cast<LooseObjectOutput<S, O>>
    )
}
export function strictUnknownObject<S extends UnknownObjectSchema>(schema: S) {
    return flow(
        typed<UnknownObject>,
        onlyHasKeys(...Object.keys(schema)),
        unknownObject(schema),
        cast<StrictObjectOutput<S>>
    )
}
