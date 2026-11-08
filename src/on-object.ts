import { pick as ramdaPick } from "ramda"
import { Mapper, error } from "./base.js"
import { constant, noOp } from "./common.js"
import { map } from "./core.js"
import { failure, flatMap, flow, path, split, success, swap } from "./index.js"
import { typed } from "./types.js"

/**
 * Creates a mapper that returns the value of a single key of an object.
 */
export const pluck = <I, K extends keyof I>(key: K) => flow(typed<I>, map(i => i[key]))

/**
 * Creates a mapper that returns a new object containing only the listed keys.
 */
export const pick = <I, K extends readonly (keyof I)[]>(keys: K) => flow(
    typed<I>,
    map(value => {
        return ramdaPick(keys, value)
    })
)

/**
 * Creates a mapper that merges a tuple of two objects into one. Keys in the second object win.
 */
export const merge = <A extends {}, B extends {}>() => map((value: readonly [A, B]): Omit<A, keyof B> & B => {
    return {
        ...value[0],
        ...value[1],
    }
})

/**
 * Creates a mapper that runs another mapper on one key of an object and puts the output back at that key.
 * Errors are prefixed with the key.
 */
export const onKey = <I extends {}, K extends (keyof I) & string, A>(key: K, mapper: Mapper<I[K], A>) => {
    return flow(
        split(
            flow(
                pluck(key),
                mapper,
                path(key),
                map(_ => <Record<K, A>>{ [key]: _ })
            )
        ),
        merge()
    )
}

/**
 * Creates a mapper that removes a key from an object.
 */
export const dropKey = <I, K extends keyof I>(key: K) => map<I, Omit<I, K>>(i => {
    const { [key]: drop, ...rest } = i
    return rest
})

/**
 * Creates a mapper that renames a key of an object.
 */
export const moveKey = <I, K extends keyof I, N extends string | number | symbol>(oldKey: K, newKey: N) => map((i: I) => {
    const { [oldKey]: _, ...rest } = i
    return {
        ...rest,
        ...<Record<N, I[K]>>{ [newKey]: _ }
    }
})

/**
 * Creates a mapper that is meant to fail if the object has any keys other than the listed ones.
 * Note: it currently compares against `Object.keys(keys)` (the indexes "0", "1", ...) rather than the keys themselves.
 */
export function onlyHasKeys<T extends object>(...keys: readonly string[]) {
    return flatMap((object: T) => {
        const allowed = Object.keys(keys)
        const disallowed = Object.keys(object).filter(key => !allowed.includes(key))
        if (disallowed.length > 0) {
            return failure(error("Invalid keys: " + disallowed.join(", "), object))
        }
        return success(object)
    })
}

/**
 * Creates a mapper that merges a fixed object into the input. Keys in `add` win.
 */
export const mergeWith = <I extends {}, A extends {}>(add: A) => flow(noOp<I>, split(constant(add)), merge())

/**
 * Creates a mapper that merges the input into a fixed object. Keys in the input win, so `add` acts as defaults.
 */
export const mergeWithBefore = <I extends {}, A extends {}>(add: A) => flow(noOp<I>, split(constant(add)), swap(), merge())
