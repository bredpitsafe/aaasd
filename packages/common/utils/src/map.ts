interface IMapLike<K, V> {
    has(k: K): boolean;
    get(k: K): undefined | V;
    set(k: K, v: V): this;
}

export function mapGet<K, V>(map: IMapLike<K, V>, key: K, fallback: (key: K) => V): V {
    if (!map.has(key)) {
        map.set(key, fallback(key));
    }
    return map.get(key)!;
}

export function weakMapGet<K extends object, V>(map: WeakMap<K, V>, key: K, fallback: () => V): V {
    if (!map.has(key)) {
        map.set(key, fallback());
    }
    return map.get(key)!;
}

export function mapSet<T extends IMapLike<K, V>, K, V>(map: T, key: K, value: V): V {
    map.set(key, value);
    return value;
}

export function weakMapSet<T extends WeakMap<K, V>, K extends object, V>(
    map: T,
    key: K,
    value: V,
): V {
    map.set(key, value);
    return value;
}
