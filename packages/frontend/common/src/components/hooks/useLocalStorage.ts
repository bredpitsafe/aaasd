import { isNil } from 'lodash-es';
import { useMemo } from 'react';

import { useFunction } from '../../utils/React/useFunction';
import { useSyncState } from '../../utils/React/useSyncState';

export function useLocalStorage<T>(
    storageKey: string,
    defaultValue?: T,
): [T | undefined, (value: T) => void, () => void] {
    const initialValue = useMemo(
        () => readLocalStorageValue<T>(storageKey) ?? defaultValue,
        [storageKey, defaultValue],
    );

    const [storageValue, setStorageValue] = useSyncState<T | undefined>(initialValue, [storageKey]);

    const setValue = useFunction((value: T) => {
        setStorageValue(value);
        localStorage.setItem(storageKey, JSON.stringify(value));
    });

    const deleteValue = useFunction(() => {
        setStorageValue(undefined);
        localStorage.removeItem(storageKey);
    });

    return [storageValue, setValue, deleteValue];
}

function readLocalStorageValue<T>(storageKey: string): T | undefined {
    const stringValue = localStorage.getItem(storageKey);

    return isNil(stringValue) || stringValue === '' ? undefined : (JSON.parse(stringValue) as T);
}
