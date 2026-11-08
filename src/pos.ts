import { map } from "./core.js"

/**
 * Creates a mapper that selects the item at an index of an array. Negative indexes count from the end.
 * Returns `undefined` if there is no item at that index.
 */
export const at = <I>(at: number) => map((i: readonly I[]) => i.at(at))

/**
 * Creates a mapper that selects the first item of an array, or `undefined` if it is empty.
 */
export const first = <I>() => at<I>(0)

/**
 * Creates a mapper that selects the last item of an array, or `undefined` if it is empty.
 */
export const last = <I>() => at<I>(-1)
