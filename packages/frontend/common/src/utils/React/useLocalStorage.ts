import { useMemo } from 'react';

import { EMPTY_OBJECT } from '../const';
import { logger } from '../Tracing';
import { useFunction } from './useFunction';
import { useSyncState } from './useSyncState';

type TSerializer<T> = (v: undefined | T) => undefined | string;
type TDeserializer<T> = (v: undefined | string) => undefined | T;

const defaultSerialize = <T>(v: undefined | T): undefined | string => {
    return v === undefined ? undefined : JSON.stringify(v);
};
const defaultDeserialize = <T>(v: undefined | string): undefined | T => {
    return v === undefined || v.trim() === '' ? undefined : (JSON.parse(v) as T);
};

export function useLocalStorage<T>(
    key: undefined | string,
    options: {
        serialize?: TSerializer<T>;
        deserialize?: TDeserializer<T>;
    } = EMPTY_OBJECT,
): [undefined | T, (v: T) => void] {
    if (key === '') logger.error('Local storage empty key');

    const seedValue = useMemo(
        () =>
            key === undefined
                ? undefined
                : (options.deserialize ?? defaultDeserialize<T>)(getValueFromLocalStorage(key)),
        [key, options.deserialize],
    );
    const syncState = useSyncState<undefined | T>(seedValue, [key]);
    const setState = useFunction((value: T) => {
        syncState[1](value);
        key !== undefined &&
            setValueToLocalStorage(key, (options.serialize ?? defaultSerialize)(value));
    });

    return [syncState[0], setState];
}

function getValueFromLocalStorage(key: string): undefined | string {
    const value = localStorage.getItem(key);
    return value === undefined || value === null ? undefined : value;
}

function setValueToLocalStorage(key: string, value: undefined | string): void {
    if (value === undefined) {
        localStorage.removeItem(key);
    } else {
        localStorage.setItem(key, value);
    }
}
