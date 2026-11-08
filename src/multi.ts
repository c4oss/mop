import { flow } from "fp-ts/function";
import { mergeAll } from "ramda";
import { InputType, Mapper, OutputType } from "./base.js";
import { map } from "./core.js";
import { exec } from "./exec.js";
import { flattenArray } from "./flatten.js";
import { UnionToIntersection } from "./internal.js";
import { cast, typed } from "./types.js";

/**
 * A list of object mappers to combine with `multi`.
 */
export type MultiSchema = ReadonlyArray<Mapper<never, object>>

/**
 * The input type of `multi`: the intersection of every schema's input type.
 */
export type MultiInput<S extends MultiSchema> = UnionToIntersection<{ [K in keyof S]: InputType<S[K]> }[number]>

/**
 * The output type of `multi`: the intersection of every schema's output type.
 */
export type MultiOutput<S extends MultiSchema> = UnionToIntersection<{ [K in keyof S]: OutputType<S[K]> }[number]>

/**
 * Creates a mapper that runs several object mappers on the same input and merges their outputs into one object.
 * Later outputs overwrite earlier ones for duplicate keys. Fails with the errors of every failing mapper.
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
