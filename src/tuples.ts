
import { flow, pipe } from "fp-ts/function"
import { Mapper } from "./base.js"
import { flatMap, map } from "./core.js"
import { exec } from "./exec.js"
import { loop } from "./internal.js"
import { typed } from "./types.js"

/**
 * Creates a mapper that turns a value into a tuple of the value twice: `[value, value]`.
 */
export const clone = <I>() => map((_: I) => [_, _] as const)

/**
 * Creates a mapper that turns a value into `[value, mapper output]`, so the original is kept alongside the output.
 */
export const split = <I, O>(mapper: Mapper<I, O>) => flow(clone<I>(), on2(mapper))

/**
 * Creates a mapper that runs two mappers on the same value and returns both outputs as a tuple.
 */
export const both = <IA, IB, OA, OB>(mapper1: Mapper<IA, OA>, mapper2: Mapper<IB, OB>) => flow(clone<IA & IB>(), on1(mapper1), on2(mapper2))

/**
 * Creates a mapper that swaps the two elements of a tuple.
 */
export const swap = <A, B>() => map((_: readonly [A, B]) => [_[1], _[0]] as const)

/**
 * Creates a mapper that returns the first element of a tuple.
 */
export const to1 = <A, B>() => map((_: readonly [A, B]) => _[0])

/**
 * Creates a mapper that returns the second element of a tuple.
 */
export const to2 = <A, B>() => map((_: readonly [A, B]) => _[1])

/**
 * Creates a mapper that transforms only the first element of a tuple. The second is left unchanged.
 */
export const on1 = <A, B, O>(mapper: Mapper<A, O>) => flow(typed<readonly [A, B]>, flatMap(value => pipe(exec(value[0], mapper), map(_ => [_, value[1]] as const))))

/**
 * Creates a mapper that transforms only the second element of a tuple. The first is left unchanged.
 */
export const on2 = <A, B, O>(mapper: Mapper<B, O>) => flow(typed<readonly [A, B]>, flatMap(value => pipe(exec(value[1], mapper), map(_ => [value[0], _] as const))))

/**
 * Creates a mapper that transforms the first element of each tuple in an array, choosing the mapper by index.
 * Errors are not prefixed with the index.
 */
export const on1s = <A, B, O>(mapper: (index: number) => Mapper<A, O>) => flow(typed<(readonly [A, B])[]>, loop(index => on1(mapper(index))))

/**
 * Creates a mapper that transforms the second element of each tuple in an array, choosing the mapper by index.
 * Errors are not prefixed with the index.
 */
export const on2s = <A, B, O>(mapper: (index: number) => Mapper<B, O>) => flow(typed<(readonly [A, B])[]>, loop(index => on2(mapper(index))))
