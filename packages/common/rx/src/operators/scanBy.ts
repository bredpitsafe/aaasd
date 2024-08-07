import { mapGet } from '@common/utils';
import { map, pipe, scan } from 'rxjs';

interface ILikeCache<K, V> {
    has(key: K): boolean;
    get(key: K): V | undefined;
    set(key: K, value: V): this;
}

export function scanBy<Val, Acc, Cache extends ILikeCache<string, Acc>>(
    getKey: (v: Val) => string,
    predicate: (acc: Acc, v: Val) => Acc,
    getAcc: (key: string) => Acc,
    cache: Cache = new Map<string, Acc>() as unknown as Cache,
) {
    return pipe(
        scan<Val, { acc: Acc; value: Val; cache: Cache }>(
            ({ cache }, value) => {
                const key = getKey(value);
                const acc = mapGet(cache, key, getAcc) as Acc;
                cache.set(key, predicate(acc, value));

                return { cache, acc, value };
            },
            {
                acc: undefined as unknown as Acc,
                value: undefined as unknown as Val,
                cache,
            },
        ),
        map(({ acc, value }) => ({ acc, value })),
    );
}
