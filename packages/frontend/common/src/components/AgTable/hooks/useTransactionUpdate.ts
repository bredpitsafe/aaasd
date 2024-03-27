import type { GridApi } from '@frontend/ag-grid';
import { isNil } from 'lodash-es';
import { useEffect, useMemo, useRef } from 'react';

import { shallowMapDiff } from '../../../utils/shallowMapDiff';

export type TKeysChangeHandler<T, TKey extends keyof T> = (keys: T[TKey][]) => void;

export function useTransactionMapUpdate<T, TKey extends keyof T>(
    gridApi: GridApi<T> | undefined,
    keyProp: TKey,
    map: ReadonlyMap<T[typeof keyProp], T> | undefined,
    equalsComparer: (a: T, b: T) => boolean,
    callbacks?: {
        onAdd?: TKeysChangeHandler<T, TKey>;
        onUpdate?: TKeysChangeHandler<T, TKey>;
        onDelete?: TKeysChangeHandler<T, TKey>;
    },
): void {
    const previousMapRef = useRef<ReadonlyMap<T[TKey], T>>();

    const onAdd = callbacks?.onAdd;
    const onUpdate = callbacks?.onUpdate;
    const onDelete = callbacks?.onDelete;

    useEffect(() => {
        if (isNil(gridApi) || previousMapRef.current === map) {
            return;
        }

        const {
            added: add,
            updated: update,
            deleted: remove,
        } = shallowMapDiff<T>(keyProp, previousMapRef.current, map, equalsComparer);

        if (add.length === 0 && update.length === 0 && remove.length === 0) {
            return;
        }

        if (add.length > 0) {
            onAdd?.(add.map(({ [keyProp]: key }) => key));
        }

        if (update.length > 0) {
            onUpdate?.(update.map(({ [keyProp]: key }) => key));
        }

        if (remove.length > 0) {
            onDelete?.(remove.map(({ [keyProp]: key }) => key));
        }

        gridApi.applyTransaction({ add, update, remove });

        previousMapRef.current = map;
    }, [gridApi, map, equalsComparer, keyProp, onAdd, onUpdate, onDelete]);
}

export function useTransactionArrayUpdate<T, TKey extends keyof T>(
    gridApi: GridApi<T> | undefined,
    keyProp: TKey,
    array: T[] | undefined,
    equalsComparer: (a: T, b: T) => boolean,
    callbacks?: {
        onAdd?: TKeysChangeHandler<T, TKey>;
        onUpdate?: TKeysChangeHandler<T, TKey>;
        onDelete?: TKeysChangeHandler<T, TKey>;
    },
): void {
    const map = useMemo(
        () =>
            array?.reduce((map, item) => {
                map.set(item[keyProp], item);
                return map;
            }, new Map<T[typeof keyProp], T>()),
        [keyProp, array],
    );

    useTransactionMapUpdate<T, TKey>(gridApi, keyProp, map, equalsComparer, callbacks);
}
