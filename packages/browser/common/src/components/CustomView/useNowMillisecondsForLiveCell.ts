import { useMemo } from 'react';
import { useObservable } from 'react-use';
import { Observable, of } from 'rxjs';

import type { Milliseconds } from '../../types/time';

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
