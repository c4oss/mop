import { map } from "./core.js"

/**
 * Selects the item at the provided index from an array.
 */
export const at = <I>(at: number) => map((i: readonly I[]) => i.at(at))

/**
 * Selects the first item from an array.
 */
export const first = <I>() => at<I>(0)

/**
 * Selects the last item from an array.
 */
export const last = <I>() => at<I>(-1)
