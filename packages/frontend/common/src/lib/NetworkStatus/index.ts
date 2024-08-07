import {
    BehaviorSubject,
    combineLatest,
    EMPTY,
    fromEvent,
    interval,
    merge,
    of,
    Subject,
    throwError,
} from 'rxjs';
import { fromFetch } from 'rxjs/fetch';
import {
    catchError,
    concatMap,
    distinctUntilChanged,
    mapTo,
    takeUntil,
    tap,
    throttleTime,
    timeout,
} from 'rxjs/operators';

import { isBrowser } from '../../utils/environment.ts';
import { APP_ROOT_PATH } from '../../utils/getPathToRoot';

export class NetworkStatus {
    private static URL1x1 = APP_ROOT_PATH + '/1x1.png';
    private static TIMEOUT = 3_000;

    private onlineSubject$ = new BehaviorSubject<boolean>(false);
    public online$ = this.onlineSubject$.pipe(distinctUntilChanged());

    private windowSource$ = new BehaviorSubject<boolean>(isBrowser() ? navigator.onLine : true);
    private fetchSource$ = new BehaviorSubject<boolean>(false);

    private destroyer$ = new Subject<void>();

    constructor() {
        combineLatest([this.windowSource$, this.fetchSource$])
            .pipe(
                takeUntil(this.destroyer$),
                throttleTime(NetworkStatus.TIMEOUT),
                distinctUntilChanged(compareBooleanArrays),
            )
            .subscribe(([windowStatus, fetchStatus]) =>
                this.onlineSubject$.next(windowStatus && fetchStatus),
            );

        if (isBrowser()) {
            merge(
                fromEvent(window, 'online').pipe(mapTo(true)),
                fromEvent(window, 'offline').pipe(mapTo(false)),
            )
                .pipe(takeUntil(this.destroyer$))
                .subscribe((status) => this.windowSource$.next(status));
        }

        interval(NetworkStatus.TIMEOUT)
            .pipe(
                takeUntil(this.destroyer$),
                concatMap(() =>
                    fromFetch(NetworkStatus.URL1x1, {
                        cache: 'no-cache',
                        selector: (res) =>
                            res === undefined || res.ok === false
                                ? throwError(() => new Error('fetch not ok'))
                                : of(true),
                    }).pipe(
                        timeout(NetworkStatus.TIMEOUT),
                        tap({
                            next: () => this.fetchSource$.next(true),
                            error: () => this.fetchSource$.next(false),
                        }),
                        catchError(() => EMPTY),
                    ),
                ),
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
