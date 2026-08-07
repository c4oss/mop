
import { separate } from "fp-ts/Array"
import { flow } from "fp-ts/function"
import { mapObjIndexed, pick as ramdaPick } from "ramda"
import { InputType, Mapper, OutputType, Result } from "./base.js"
import { constant, noOp } from "./common.js"
import { failure, flatMap, isLeft, map, success } from "./core.js"
import { exec } from "./exec.js"
import { flattenObject } from "./flatten.js"
import { path } from "./path.js"
import { split, swap } from "./tuples.js"
import { cast, typed } from "./types.js"

type OptionalKeys<S> = { [K in keyof S]: undefined extends S[K] ? K : never }[keyof S]
type RequiredKeys<S> = { [K in keyof S]: undefined extends S[K] ? never : K }[keyof S]

export type ObjectSchema = { [K: string]: Mapper<never, unknown> }

export type RawObjectOutput<S extends ObjectSchema> = { [K in keyof S]: Result<S[K]> }

export function rawObject<S extends ObjectSchema>(schema: S) {
    return flow(
        typed<ObjectInput<S>>,
        map(input => mapObjIndexed((mapper, key) => exec(input[key as never] as never, mapper), schema)),
        cast<RawObjectOutput<S>>
    )
}

export type ObjectOutput<S extends ObjectSchema> = { [K in keyof S]: OutputType<S[K]> }
export type ObjectInput<S extends ObjectSchema> = { [K in RequiredKeys<{ [K in keyof S]: InputType<S[K]> }>]: InputType<S[K]> } & { [K in OptionalKeys<{ [K in keyof S]: InputType<S[K]> }>]?: InputType<S[K]> }

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

export function record<K extends string | number | symbol, I, V>(key: Mapper<string, K>, value: (key: K) => Mapper<I, V>): Mapper<Record<string, I>, Record<K, V>> {
    return flow(
        pairs(key, value),
        map(pairs => {
            return Object.fromEntries(pairs) as Record<K, V>
        })
    )
}

export function mappedObject<K extends string | number | symbol, V>(key: Mapper<string | number | symbol, K>, value: (key: K) => Mapper<unknown, V>): Mapper<object, Record<K, V>> {
    return flatMap((input: object) => {
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
        const x = separate(mapped)
        if (x.left.length > 0) {
            return failure(x.left.flat())
        }
        return success(Object.fromEntries(x.right) as Record<K, V>)
    })
}

export function object<S extends ObjectSchema>(schema: S) {
    return flow(
        rawObject(schema),
        flattenObject(),
        cast<ObjectOutput<S>>
    )
}

export type UnknownObjectSchema = { [K: string]: Mapper<unknown, unknown> }

export function unknownObject<S extends UnknownObjectSchema>(schema: S) {
    return flow(
        typed<object>,
        map(input => mapObjIndexed((mapper, key) => exec(input[key as never] as never, mapper), schema)),
        cast<RawObjectOutput<S>>,
        flattenObject(),
        cast<ObjectOutput<S>>
    )
}

/*
discriminated("x", {
    a: {
        x: nonBlankString()
    }
})

type DiscriminatedInput<K extends string | number | symbol, S extends DiscriminatedSchema> = {
    [K in keyof K]: 
    [K in keyof DiscriminatedSchema]: string
}
type DiscriminatedSchema = { [K in keyof object]: ObjectSchema }
export function discriminated<K extends string | number | symbol, S extends DiscriminatedSchema>(key: K, schema: S) {

}
*/

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
 * Creates a mapper that merges a manually provided object.
 */
export const mergeWith = <I extends {}, A extends {}>(add: A) => flow(noOp<I>, split(constant(add)), merge())

/**
 * Creates a mapper that merges a manually provided object.
 */
export const mergeWithBefore = <I extends {}, A extends {}>(add: A) => flow(noOp<I>, split(constant(add)), swap(), merge())
