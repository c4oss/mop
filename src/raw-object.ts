import { flow, pipe } from "fp-ts/function"
import { mapObjIndexed } from "ramda"
import { Result } from "./base.js"
import { map } from "./core.js"
import { exec } from "./exec.js"
import { ObjectInput, ObjectSchema } from "./object.js"
import { cast, typed } from "./types.js"

export type RawObjectOutput<S extends ObjectSchema> = { [K in keyof S]: Result<S[K]> }

/**
 * Convert an object to an object of results.
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
