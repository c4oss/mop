import { flow } from "fp-ts/function";
import { Mapper, PathComponent } from "./base.js";
import { chain, map } from "./core.js";
import { ArrayOrElement, loop } from "./internal.js";
import { path } from "./path.js";
import { on2 } from "./tuples.js";
import { typed } from "./types.js";

/**
 * Maps every element in a map. The mapper can be determined by the key if necessary.
 */
export function onEach<I, O, K>(mapper: (key: K) => Mapper<I, O>, keyToPath: (key: K) => ArrayOrElement<PathComponent>) {
    return flow(
        typed<Map<K, I>>,
        map(_ => [..._.entries()]),
        loop(() => chain(entry => flow(on2(mapper(entry[0])), path(keyToPath(entry[0]))))),
        map(_ => new Map(_))
    )
}
