import { separate } from "fp-ts/lib/Array.js"
import { Mapper } from "./base.js"
import { failure, flatMap, flow, isLeft, map, success } from "./core.js"
import { exec } from "./exec.js"
import { path } from "./path.js"
import { typed } from "./types.js"

/**
 * Creates a mapper that transforms every key and value of an object into a list of `[key, value]` pairs.
 * Errors are prefixed with the original key. Fails with the errors of every failing entry.
 * @param key The mapper for each key.
 * @param value Returns the mapper for a value, given its mapped key. Not called if the key fails.
 */
export function pairs<K, I, V>(key: Mapper<string, K>, value: (key: K) => Mapper<I, V>): Mapper<Record<string, I>, readonly (readonly [K, V])[]> {
    return flatMap((input: Record<string, I>) => {
        const entries = Object.entries(input)
        const mapped = entries.map(([k, v]) => {
            const mappedKey = exec(k, flow(key, path(k)))
            if (isLeft(mappedKey)) {
                return mappedKey
            }
            const mappedValue = exec(v, flow(value(mappedKey.right), path(k)))
            if (isLeft(mappedValue)) {
                return mappedValue
            }
            return success([
                mappedKey.right,
                mappedValue.right
            ] as const)
        })
        const separated = separate(mapped)
        if (separated.left.length > 0) {
            return failure(separated.left.flat())
        }
        return success(separated.right)
    })
}

/**
 * Creates a mapper that transforms every value of an object, choosing the mapper by key.
 * Errors are prefixed with the key.
 */
export function record<I, V>(value: (key: string) => Mapper<I, V>): Mapper<Record<string, I>, Record<string, V>> {
    return flow(
        pairs(typed<string>, value),
        map(pairs => {
            return Object.fromEntries(pairs)
        })
    )
}
