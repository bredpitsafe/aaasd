import { isUndefined } from 'lodash-es';
import { useEffect, useState } from 'react';
import { useToggle } from 'react-use';
import type { Observable } from 'rxjs';

import type { SocketStreamError } from '../../lib/SocketStream/SocketStreamError';
import type { Milliseconds } from '../../types/time';
import { getNowMilliseconds } from '../../utils/time';

export type TWithLiveUpdates = {
    live: boolean;
    loading: boolean;
    toggleLive: (live?: boolean) => void;
    updateTime: Milliseconds | undefined;
    error?: Error;
};

type TUseLiveUpdatesReturnValue<T> = TWithLiveUpdates & {
    value: T | undefined;
};

export function useLiveUpdates<T>(
    obs$: Observable<T | undefined | SocketStreamError>,
    defaultState?: boolean,
): TUseLiveUpdatesReturnValue<T> {
    const [value, setValue] = useState<undefined | T>(undefined);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<undefined | Error>(undefined);
    const [live, toggleLive] = useToggle(defaultState !== undefined ? defaultState : true);
    const [updateTime, setUpdateTime] = useState<undefined | Milliseconds>(undefined);

    useEffect(() => {
        if (live) {
            setValue(undefined);
            setError(undefined);
            setUpdateTime(undefined);
            setLoading(true);
            const sub = obs$.subscribe((nextValue) => {
                if (nextValue instanceof Error) {
                    setValue(undefined);
                    setError(nextValue);
                    setLoading(false);
                } else if (isUndefined(nextValue)) {
                    setValue(undefined);
                    setError(undefined);
                    setUpdateTime(undefined);
                    setLoading(true);
                } else {
                    setError(undefined);
                    setLoading(false);
                    setValue(nextValue);
                    setUpdateTime(getNowMilliseconds());
                }
            });

            return () => {
                setError(undefined);
                setLoading(false);
                sub.unsubscribe();
            };
        }
    }, [obs$, live]);

    // Re-enable live mode when observable has changed
    useEffect(() => {
        if (!live) {
            toggleLive(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [obs$]);

    return {
        value,
        live,
        updateTime,
        toggleLive,
        loading,
        error,
    };
}
