import { flow } from "fp-ts/function";
import { Mapper } from "./base.js";
import { map } from "./core.js";
import { exec } from "./exec.js";
import { flattenArray } from "./flatten.js";

/**
 * Either a single value or a readonly array of values.
 */
export type ArrayOrElement<T> = T | readonly T[]

/**
 * Wraps a single value in an array. Arrays are returned unchanged.
 */
export function arrayOrElement<T>(value: ArrayOrElement<T>) {
    if (Array.isArray(value)) {
        return value as T[]
    }
    return [value as T]
}

/**
 * Applies a mapper to each element of an array and collects the results. Fails with the errors of every failing element.
 * This does NOT add the index to the error path. For internal use, as the building block for other traversals.
 * @param mapper Returns the mapper to use for the element at each index.
 */
export function loop<I, O>(mapper: (index: number) => Mapper<I, O>) {
    return flow(
        map((input: readonly I[]) => input.map((value, index) => exec(value, mapper(index)))),
        flattenArray()
    )
}

/**
 * Converts a union type into an intersection type (`A | B` becomes `A & B`).
 */
export type UnionToIntersection<T> = (T extends any ? (x: T) => any : never) extends (x: infer R) => any ? R : never
