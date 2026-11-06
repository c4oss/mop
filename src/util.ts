
export type OptionalKeys<S> = { readonly [K in keyof S]: undefined extends S[K] ? K : never }[keyof S]
export type RequiredKeys<S> = { readonly [K in keyof S]: undefined extends S[K] ? never : K }[keyof S]
