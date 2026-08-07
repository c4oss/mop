import { flow } from "fp-ts/function";
import { Mapper } from "./base.js";
import { map } from "./core.js";
import { exec } from "./exec.js";
import { flattenArray } from "./flatten.js";

/**
 * A union between a type and an array of the type.
 */
export type ArrayOrElement<T> = T | readonly T[]

/**
 * Converts an array or element to an array.
 */
export function arrayOrElement<T>(value: ArrayOrElement<T>) {
    if (Array.isArray(value)) {
        return value as T[]
    }
    return [value as T]
}

/**
 * Applies a mapper to each element of an array. This does NOT append anything to the error path. For internal use only. Used for multiple traversals.
 */
export function loop<I, O>(mapper: (index: number) => Mapper<I, O>) {
    return flow(
        map((input: readonly I[]) => input.map((value, index) => exec(value, mapper(index)))),
        flattenArray()
    )
}

/**
 * Converts a union to an intersection.
 */
export type UnionToIntersection<T> = (T extends any ? (x: T) => any : never) extends (x: infer R) => any ? R : never
