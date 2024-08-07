import type { Key } from 'react';
import { useState } from 'react';
import { useUpdateEffect } from 'react-use';

const keeper = new Map<Key, unknown>();

export function useTabState<S>(
    key: Key,
    initialState?: S,
    initialSetState?: (value: S) => void,
): [undefined | S, (value: S) => void] {
    const [state, setState] = useState<undefined | S>(
        keeper.has(key) ? (keeper.get(key) as S) : initialState,
    );

    useUpdateEffect(() => {
        keeper.set(key, initialState);
        setState(initialState);
    }, [initialState]);

    return [
        state,
        (nextState: S) => {
            keeper.set(key, nextState);
            setState(nextState);
            initialSetState?.(nextState);
        },
    ];
}
