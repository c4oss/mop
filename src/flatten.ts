
import { separate } from "fp-ts/Array"
import { flow } from "fp-ts/function"
import { Result } from "./base.js"
import { chain, failure, flat, flatMap, map, of } from "./core.js"
import { loop } from "./internal.js"
import { path } from "./path.js"
import { on2 } from "./tuples.js"
import { cast, typed } from "./types.js"

/**
 * Creates a mapper that turns an object of results into a @link Result of an object.
 */
export const flattenObject = <I extends Record<string, Result<unknown>>>() => {
    return flow(
        map(Object.entries),
        loop(() => chain(value => on2(flow(flat(), path(value[0] ?? []))))),
        map(Object.fromEntries),
        cast<{ [K in keyof I]: Result<I[K]> }>
    )
}

/**
 * Creates a mapper that turns an array of results into a @link Result of an array.
 */
export const flattenArray = <T>() => flow(
    typed<Result<T>[]>,
    flatMap(input => {
        const separated = separate(input)
        if (separated.left.length > 0) {
            return failure(separated.left.flat())
        }
        else {
            return of(separated.right as readonly T[])
        }
    })
)
