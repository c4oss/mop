
/**
 * The keys of `S` whose value type accepts `undefined`.
 */
export type OptionalKeys<S> = { readonly [K in keyof S]: undefined extends S[K] ? K : never }[keyof S]

/**
 * The keys of `S` whose value type does not accept `undefined`.
 */
export type RequiredKeys<S> = { readonly [K in keyof S]: undefined extends S[K] ? never : K }[keyof S]
