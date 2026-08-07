
import { flow, pipe } from "fp-ts/function"
import { Mapper } from "./base.js"
import { flatMap, map } from "./core.js"
import { exec } from "./exec.js"
import { loop } from "./internal.js"
import { typed } from "./types.js"

/**
 * Split a value into itself twice as a tuple.
 */
export const clone = <I>() => map((_: I) => [_, _] as const)

/**
 * Split a value into a tuple using another mapper on the second half only.
 */
export const split = <I, O>(mapper: Mapper<I, O>) => flow(clone<I>(), on2(mapper))

/**
 * Map a value using two mappers, split the result into a tuple.
 */
export const bisect = <IA, IB, OA, OB>(mapper1: Mapper<IA, OA>, mapper2: Mapper<IB, OB>) => flow(clone<IA & IB>(), on1(mapper1), on2(mapper2))

/**
 * Swaps a tuple's elements.
 */
export const swap = <A, B>() => map((_: readonly [A, B]) => [_[1], _[0]] as const)

/**
 * Maps the first half of a tuple only. Leaves the second intact.
 */
export const on1 = <A, B, O>(mapper: Mapper<A, O>) => flow(typed<readonly [A, B]>, flatMap(value => pipe(exec(value[0], mapper), map(_ => [_, value[1]] as const))))

/**
 * Maps the first half of a tuple array only. Leaves the second intact.
 */
export const on1s = <A, B, O>(mapper: (index: number) => Mapper<A, O>) => flow(typed<(readonly [A, B])[]>, loop(index => on1(mapper(index))))

/**
 * Turns a tuple into its first value.
 */
export const to1 = <A, B>() => map((_: readonly [A, B]) => _[0])

/** 
 * Maps the second half of a tuple only. Leaves the first intact.
 */
export const on2 = <A, B, O>(mapper: Mapper<B, O>) => flow(typed<readonly [A, B]>, flatMap(value => pipe(exec(value[1], mapper), map(_ => [value[0], _] as const))))

/**
 * Maps the second half of a tuple array only. Leaves the first intact.
 */
export const on2s = <A, B, O>(mapper: (index: number) => Mapper<B, O>) => flow(typed<(readonly [A, B])[]>, loop(index => on2(mapper(index))))

/**
 * Turns a tuple into its second value.
 */
export const to2 = <A, B>() => map((_: readonly [A, B]) => _[1])
