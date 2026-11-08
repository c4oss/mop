import { flow, pipe } from "fp-ts/function"
import { mapObjIndexed } from "ramda"
import { Result } from "./base.js"
import { map } from "./core.js"
import { exec } from "./exec.js"
import { ObjectInput, ObjectSchema } from "./object.js"
import { cast, typed } from "./types.js"

/**
 * The output of `rawObject`: a result for each key of the schema.
 */
export type RawObjectOutput<S extends ObjectSchema> = { [K in keyof S]: Result<S[K]> }

/**
 * Creates a mapper that runs each schema mapper on the matching key of the input, producing an object of results.
 * Does not fail by itself. Use `flattenObject` to combine the results (as `object` does).
 */
export function rawObject<S extends ObjectSchema>(schema: S) {
    return flow(
        typed<ObjectInput<S>>,
        map(input => {
            return pipe(
                schema,
                mapObjIndexed((value, key) => {
                    return exec(input[key as never], value)
                })
            )
        }),
        cast<RawObjectOutput<S>>
    )
}
