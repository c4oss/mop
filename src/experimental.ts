import { separate } from "fp-ts/Array"
import { flow, pipe } from "fp-ts/function"
import { error, ErrorFactory, MapError, Mapper, Result } from "./base.js"
import { chain, failure, flat, flatMap, map, mapFail, of, orElse, success } from "./core.js"
import { exec } from "./exec.js"
import { loop } from "./internal.js"
import { path } from "./path.js"
import { on2 } from "./tuples.js"
import { cast, typed } from "./types.js"

/**
 * Transforms each value of an object, choosing the mapper by key. Errors are prefixed with the key.
 * This is not type safe. We recommend using a map instead.
 */
export function onEachKey<I, O, K extends string | number>(mapper: (key: K) => Mapper<I, O>) {
    return flow(
        typed<Record<K, I>>,
        map(Object.entries),
        cast<(readonly [K, I])[]>,
        loop(() => chain(value => on2(flow(mapper(value[0]), path(value[0]))))),
        map(Object.fromEntries),
        cast<Record<K, O>>,
    )
}

/**
 * Creates a mapper that runs every mapper on the input and returns the first successful output.
 * Every mapper runs, even after one succeeds.
 * @param errorFactory The error to use if all mappers fail. Receives `[input, errors from every mapper]`.
 */
export const tryAll = <I, O>(mappers: Mapper<I, O>[], errorFactory: ErrorFactory<[I, readonly MapError[]]>) => flatMap((input: I) => {
    const results = mappers.map(_ => _(of(input)))
    const separated = separate(results)
    const first = separated.right.at(0)
    if (first === undefined) {
        return failure(error(errorFactory, [input, separated.left.flat()]))
    }
    return success(first as O)
})

/**
 * Creates a mapper that runs `a`, and if it fails, runs `b` on the original value. Only one needs to succeed.
 * @param errorFactory The error to use if both fail. Receives `[input, errors from a and b]`.
 */
export const tryBoth = <I, A, B>(a: Mapper<I, A>, b: Mapper<I, B>, errorFactory: ErrorFactory<[I, readonly MapError[]]>) => chain((value: I) => {
    return flow(
        a,
        orElse(ae => exec(value, flow(b, mapFail(be => [...ae, ...be])))),
        mapFail(errors => error(errorFactory, [value, errors]))
    )
})

/**
 * Creates a mapper that runs `a` and then `detour` on its output. If `a` fails, runs `b` on the original value instead.
 * Failures from `detour` or `b` are returned as-is.
 */
export const tryDetour = <I, A, B, C>(a: Mapper<I, A>, detour: Mapper<A, C>, b: Mapper<I, B>) => chain((input: I) => {
    return flow(
        a,
        map(flow(of, detour)),
        orElse(() => pipe(input, of, b, of)),
        typed<Result<C | B>>,
        flat()
    )
})
