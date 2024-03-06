import {
    BehaviorSubject,
    combineLatest,
    fromEvent,
    interval,
    merge,
    mergeMap,
    of,
    Subject,
    throwError,
} from 'rxjs';
import { fromFetch } from 'rxjs/fetch';
import { distinctUntilChanged, mapTo, takeUntil, tap, throttleTime } from 'rxjs/operators';

import { getPathToRoot } from '../../utils/getPathToRoot';
import { progressiveRetry } from '../../utils/Rx/progressiveRetry';

export class NetworkStatus {
    private static URL1x1 = getPathToRoot() + '/1x1.png';
    private static TIMEOUT = 5_000;
    private static MAX_TIMEOUT = 30_000;

    online$ = new BehaviorSubject<boolean>(navigator.onLine);

    private windowSource$ = new BehaviorSubject<boolean>(navigator.onLine);
    private fetchSource$ = new BehaviorSubject<boolean>(navigator.onLine);

    private destroyer$ = new Subject<void>();

    constructor() {
        combineLatest([this.windowSource$, this.fetchSource$])
            .pipe(
                takeUntil(this.destroyer$),
                throttleTime(3_000),
                distinctUntilChanged(compareBooleanArrays),
            )
            .subscribe(([windowStatus, fetchStatus]) =>
                this.online$.next(windowStatus && fetchStatus),
            );

        merge(
            fromEvent(window, 'online').pipe(mapTo(true)),
            fromEvent(window, 'offline').pipe(mapTo(false)),
        )
            .pipe(takeUntil(this.destroyer$))
            .subscribe((status) => this.windowSource$.next(status));

        interval(NetworkStatus.TIMEOUT)
            .pipe(
                takeUntil(this.destroyer$),
                mergeMap(() =>
                    fromFetch(NetworkStatus.URL1x1, {
                        cache: 'no-cache',
                        selector: (res) =>
                            res === undefined || res.ok === false
                                ? throwError(() => new Error())
                                : of(true),
                    }).pipe(
                        // almost immediate retry if network blinked
                        progressiveRetry({ initialInterval: 300, maxRetries: 1 }),
                    ),
                ),
                tap({
                    next: () => this.fetchSource$.next(true),
                    error: () => this.fetchSource$.next(false),
                }),
                progressiveRetry({
                    maxInterval: NetworkStatus.MAX_TIMEOUT,
                    initialInterval: NetworkStatus.TIMEOUT,
                }),
            )
            .subscribe();
    }

    destroy(): void {
        this.destroyer$.next();
        this.destroyer$.complete();
    }
}

function compareBooleanArrays(a: boolean[], b: boolean[]): boolean {
    return a.reduce((acc, v) => acc && v, true) === b.reduce((acc, v) => acc && v, true);
}
