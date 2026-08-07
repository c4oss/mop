import { flow } from "fp-ts/function";
import { mergeAll } from "ramda";
import { InputType, Mapper, OutputType } from "./base.js";
import { map } from "./core.js";
import { exec } from "./exec.js";
import { flattenArray } from "./flatten.js";
import { UnionToIntersection } from "./internal.js";
import { cast, typed } from "./types.js";

export type MultiSchema = ReadonlyArray<Mapper<never, object>>
export type MultiInput<S extends MultiSchema> = UnionToIntersection<{ [K in keyof S]: InputType<S[K]> }[number]>
export type MultiOutput<S extends MultiSchema> = UnionToIntersection<{ [K in keyof S]: OutputType<S[K]> }[number]>

/*
const x = multi([
    object({
        b: stringToInt()
    }),
    object({
        a: stringToInt()
    })
])
const y = exec({ a: "", b: "" }, x)
if (isRight(y)) {
    y.right.b
}
*/

export function multi<S extends MultiSchema>(schemas: S) {
    return flow(
        typed<MultiInput<S>>,
        map(input => schemas.map(schema => exec(input as InputType<typeof schema>, schema))),
        flattenArray(),
        map(mergeAll),
        cast<MultiOutput<S>>
    )
}
