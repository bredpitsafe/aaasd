import type { Milliseconds } from '@common/types';
import { useMemo } from 'react';
import { useObservable } from 'react-use';
import type { Observable } from 'rxjs';
import { of } from 'rxjs';

export function useNowMillisecondsForLiveCell(
    serverTime$: Observable<Milliseconds>,
    isTimerDependent: boolean,
): Milliseconds {
    return useObservable(
        useMemo(
            () => (isTimerDependent ? serverTime$ : of(0 as Milliseconds)),
            [isTimerDependent, serverTime$],
        ),
        0 as Milliseconds,
    );
}
