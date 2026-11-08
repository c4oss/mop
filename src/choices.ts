import { flow } from "fp-ts/function"
import { indexBy } from "ramda"
import { error, ErrorFactory, Mapper } from "./base.js"
import { failure, flatMap, of } from "./core.js"
import { predicate } from "./test.js"

/**
 * Creates a mapper that looks up the input with a finder function. Fails if the finder returns `undefined`.
 * @param finder Returns the value for a key, or `undefined` if there is none.
 * @param errorFactory The error to use when nothing is found. Receives the input key.
 */
export const lookup = <K, V>(finder: (key: K) => V | undefined, errorFactory: ErrorFactory<K> = "This is not a valid choice") => {
    return flatMap((input: K) => {
        const found = finder(input)
        if (found === undefined) {
            return failure(error(errorFactory, input))
        }
        return of(found)
    })
}

/**
 * Creates a mapper that looks up the input among a list of items, using `index` to compute each item's key.
 * Fails if no item has that key.
 */
export function choicesIndexed<K extends string | number, V>(items: readonly V[], index: (value: V) => K, error?: ErrorFactory<K> | undefined) {
    return choices(indexBy(index, items), error)
}

/**
 * Creates a mapper that uses the input as a key into a record and returns the value. Fails if the key has no value.
 */
export const choices = <K extends string | number | symbol, V>(record: Record<K, V>, error?: ErrorFactory<K> | undefined) => lookup(key => record[key], error)

/**
 * Creates a mapper that finds the input among the values of a record and returns its key. Fails if no value matches.
 */
export const choicesByValue = <K extends string | number | symbol, V>(record: Record<K, V>, error?: ErrorFactory<V> | undefined) => lookup(key => Object.entries(record).filter(_ => _[1] === key).map(_ => _[0] as K)[0], error)

/**
 * Creates a mapper that uses the input as a key into a `Map` and returns the value. Fails if the key has no value.
 */
export const mapChoices = <K, V>(map: Map<K, V>, error?: ErrorFactory<K> | undefined) => lookup(key => map.get(key), error)

/**
 * Creates a mapper that requires the input to be one of the items of an array, narrowing its type. Fails if it is not found.
 */
export const arrayChoices = <I, O extends I>(array: readonly O[], error?: ErrorFactory<I> | undefined) => lookup(_ => array.find(option => _ === option), error)

/**
 * Creates a mapper that requires the input to be one of the items of an array.
 */
export const isIn = <T>(array: readonly T[], error?: ErrorFactory<T>) => flow(predicate(_ => array.includes(_), error))

/**
 * Creates a mapper that requires the input to be in a set.
 */
export const isInSet = <T>(set: Set<T>, error?: ErrorFactory<T>) => predicate(_ => set.has(_), error)

/**
 * Creates a mapper that requires the input to equal one of two values, narrowing its type to their union.
 */
export const narrow = <I, A extends I, B extends I>(a: A, b: B, errorFactory: ErrorFactory<I> = "This is not a valid option."): Mapper<I, A | B> => flatMap((value: I) => {
    if (value === a || value === b) {
        return of(value as A | B);
    }
    return failure(error(errorFactory, value))
})

/**
 * Creates a mapper that requires the input to equal one of three values, narrowing its type to their union.
 */
export const narrow3 = <I, A extends I, B extends I, C extends I>(a: A, b: B, c: C, errorFactory: ErrorFactory<I> = "This is not a valid option."): Mapper<I, A | B | C> => flatMap((value: I) => {
    if (value === a || value === b || value === c) {
        return of(value as A | B | C);
    }
    return failure(error(errorFactory, value))
})
