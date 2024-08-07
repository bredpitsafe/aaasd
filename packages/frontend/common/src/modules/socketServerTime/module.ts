import type { Milliseconds } from '@common/types';
import { getNowMilliseconds, plus } from '@common/utils';
import type { Observable } from 'rxjs';
import { combineLatest, map, timer } from 'rxjs';
import { startWith, throttleTime } from 'rxjs/operators';

import type { TSocketURL } from '../../types/domain/sockets';
import { createObservableBox } from '../../utils/rx';
import type { TSocketServerTimeMap } from './defs';

export const createModule = () => {
    const serverTimeBox = createObservableBox<TSocketServerTimeMap>({});

    const getServerTime = (key: TSocketURL) => serverTimeBox.get()[key];
    const setServerTime = (key: TSocketURL, value: Milliseconds) => {
        serverTimeBox.set((v) => ((v[key] = value), v));
    };

    const getServerTimeMap = () => serverTimeBox.get();
    const upsertServerTimeMap = (data: TSocketServerTimeMap) => {
        serverTimeBox.set((v) => Object.assign(v, data));
    };

    const getServerIncrement$ = (url: TSocketURL) => {
        return serverTimeBox.obs.pipe(map((obj) => obj[url] ?? (0 as Milliseconds)));
    };
    const getServerTime$ = (url: TSocketURL, period = 1000): Observable<Milliseconds> => {
        return combineLatest([
            getServerIncrement$(url),
            timer(0, period).pipe(map(getNowMilliseconds)),
        ]).pipe(
            map(([inc, time]) => plus(inc, time)),
            throttleTime(period, undefined, { leading: false, trailing: true }),
            startWith(plus(getNowMilliseconds(), getServerTime(url) ?? 0) as Milliseconds),
        );
    };

    return {
        serverTimeMap$: serverTimeBox.obs,
        getServerTime$,
        getServerIncrement$,

        getServerTime,
        setServerTime,
        getServerTimeMap,
        upsertServerTimeMap,
    };
};
