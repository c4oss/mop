import { pick as ramdaPick } from "ramda"
import { Mapper, error } from "./base.js"
import { constant, noOp } from "./common.js"
import { map } from "./core.js"
import { failure, flatMap, flow, path, split, success, swap } from "./index.js"
import { typed } from "./types.js"

/**
 * Creates a mapper that plucks a single key from an object.
 */
export const pluck = <I, K extends keyof I>(key: K) => flow(typed<I>, map(i => i[key]))

/**
 * Creates a mapper that picks multiple keys from an object.
 */
export const pick = <I, K extends readonly (keyof I)[]>(keys: K) => flow(
    typed<I>,
    map(value => {
        return ramdaPick(keys, value)
    })
)

/**
 * Creates a mapper that merges a tuple of two objects into one object.
 */
export const merge = <A extends {}, B extends {}>() => map((value: readonly [A, B]): Omit<A, keyof B> & B => {
    return {
        ...value[0],
        ...value[1],
    }
})

/**
 * Creates a mapper that applies another mapper to one key of an object and merge the result back into the object.
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
 * Creates a mapper that drops a single key from an object.
 */
export const dropKey = <I, K extends keyof I>(key: K) => map<I, Omit<I, K>>(i => {
    const { [key]: drop, ...rest } = i
    return rest
})

/**
 * Creates a mapper that moves a key to another key in an object from an object.
 */
export const moveKey = <I, K extends keyof I, N extends string | number | symbol>(oldKey: K, newKey: N) => map((i: I) => {
    const { [oldKey]: _, ...rest } = i
    return {
        ...rest,
        ...<Record<N, I[K]>>{ [newKey]: _ }
    }
})

/**
 * Creates a mapper that fails if any keys not listed are present.
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
 * Creates a mapper that merges a manually provided object.
 */
export const mergeWith = <I extends {}, A extends {}>(add: A) => flow(noOp<I>, split(constant(add)), merge())

/**
 * Creates a mapper that merges a manually provided object.
 */
export const mergeWithBefore = <I extends {}, A extends {}>(add: A) => flow(noOp<I>, split(constant(add)), swap(), merge())
