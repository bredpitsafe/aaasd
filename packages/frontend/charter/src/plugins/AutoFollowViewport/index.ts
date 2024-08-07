import type { Someseconds } from '@common/types';
import { minus, plus } from '@common/utils';
import { isClamped } from '@frontend/common/src/utils/isClamped';
import { frameInterval } from '@frontend/common/src/utils/observable/frameTasks';
import { isNil } from 'lodash-es';
import type { Observable } from 'rxjs';
import { BehaviorSubject, combineLatest, EMPTY, fromEvent, merge, of, Subject } from 'rxjs';
import {
    distinctUntilChanged,
    filter,
    map,
    mapTo,
    scan,
    startWith,
    switchMap,
    takeUntil,
} from 'rxjs/operators';

import { getLastAbsPointTime } from '../../../lib/Parts/utils/point';
import type { TBaseViewportEvent } from '../../components/ChartViewport/defs';
import { ViewportEvent } from '../../components/ChartViewport/defs';
import type { TimeseriesCharter } from '../../index';
import { Plugin } from '../Plugin';
import { EFollowMode, EVENT_AUTO_FOLLOW, FRAME_DELAY } from './def';

const POSITION_MULTIPLAYER = 0.7;

export class AutoFollowViewport extends Plugin {
    private mode$ = new BehaviorSubject<EFollowMode>(EFollowMode.permament);
    private stop$ = new Subject<void>();

    constructor(mode?: EFollowMode) {
        super();
        !isNil(mode) && this.setFollowMode(mode);
    }

    connect(host: TimeseriesCharter): void {
        super.connect(host);
        this.startFollow(host);
    }

    disconnect(host: TimeseriesCharter): void {
        super.disconnect(host);
        this.stopFollow();
    }

    setFollowMode(mode: EFollowMode): void {
        this.mode$.next(mode);
    }

    private startFollow(host: TimeseriesCharter): void {
        this.mode$
            .pipe(
                switchMap((mode) =>
                    canAutoFollow$(host, mode).pipe(
                        switchMap((canAutoFollow) =>
                            canAutoFollow
                                ? triggerAutoFollow$(host).pipe(
                                      map((offset): [EFollowMode, number] => [mode, offset]),
                                  )
                                : EMPTY,
                        ),
                    ),
                ),

                takeUntil(this.stop$),
            )
            .subscribe(([mode, offset]) => execAutoFollow(host, mode, offset));
    }

    private stopFollow(): void {
        this.stop$.next();
    }
}

function getNow(host: TimeseriesCharter): Someseconds {
    const timeNow = host.getTimeNow();
    const serverTimeIncrement = host.getServerTimeIncrement();
    return minus(timeNow, serverTimeIncrement);
}

function getViewportBounds(host: TimeseriesCharter): [Someseconds, Someseconds] {
    const viewport = host.getViewport();
    const clientTimeIncrement = host.getClientTimeIncrement();

    const left = plus(clientTimeIncrement, viewport.getLeft());
    const right = plus(clientTimeIncrement, viewport.getRight());

    return [left, right];
}

function getLastPointTime(host: TimeseriesCharter): Someseconds {
    return host.getAllVisibleParts().reduce((acc, part) => {
        return Math.max(acc, part.size === 0 ? 0 : getLastAbsPointTime(part)!);
    }, 0) as Someseconds;
}

function viewPortChanged$(host: TimeseriesCharter): Observable<string> {
    const viewport = host.getViewport();
    return merge(
        fromEvent<TBaseViewportEvent>(viewport, ViewportEvent.ZoomH),
        fromEvent<TBaseViewportEvent>(viewport, ViewportEvent.MoveH),
    ).pipe(
        map(({ type }) => type ?? 'unknown'),
        startWith('initial'),
    );
}

function canAutoFollow$(host: TimeseriesCharter, mode: EFollowMode): Observable<boolean> {
    if (mode === EFollowMode.none) {
        return of(true);
    }

    return combineLatest([hasUserAction$(host), everyChartShowingLastLivePart$(host)]).pipe(
        map(([hasUserAction, showingLivePart]) => !hasUserAction && showingLivePart),
        switchMap((passedPrerequisite) =>
            passedPrerequisite
                ? viewPortChanged$(host).pipe(
                      map(() => {
                          const size = getViewportBounds(host);

                          return isClamped(
                              mode === EFollowMode.lastPoint
                                  ? getLastPointTime(host)
                                  : getNow(host),
                              size[0],
                              size[1],
                          );
                      }),
                  )
                : of(false),
        ),
        distinctUntilChanged(),
    );
}

function hasUserAction$(host: TimeseriesCharter): Observable<boolean> {
    const viewport = host.getViewport();

    return merge(
        fromEvent<TBaseViewportEvent>(viewport, ViewportEvent.StartUserAction).pipe(mapTo(1)),
        fromEvent<TBaseViewportEvent>(viewport, ViewportEvent.StopUserAction).pipe(mapTo(-1)),
    ).pipe(
        scan((counter, current) => counter + current, 0),
        startWith(0),
        map((counter) => counter > 0),
        distinctUntilChanged(),
    );
}

function everyChartShowingLastLivePart$(host: TimeseriesCharter): Observable<boolean> {
    return frameInterval(FRAME_DELAY).pipe(
        map(() => host.everyChartShowingLastLivePart()),
        distinctUntilChanged(),
    );
}

function triggerAutoFollow$(host: TimeseriesCharter): Observable<number> {
    return viewPortChanged$(host).pipe(
        filter((type) => type !== EVENT_AUTO_FOLLOW),
        map(() => {
            const now = getNow(host);
            const [left] = getViewportBounds(host);
            return Math.max(now - left, 0);
        }),
        distinctUntilChanged(),
        switchMap((offset) => frameInterval(FRAME_DELAY).pipe(mapTo(offset))),
    );
}

function execAutoFollow(host: TimeseriesCharter, mode: EFollowMode, offset: number): void {
    const viewport = host.getViewport();
    const now = getNow(host);
    const clientTimeIncrement = host.getClientTimeIncrement();
    const viewportNow = now - clientTimeIncrement;

    switch (mode) {
        // In permanent mode chart follows `now` point every FRAME_DELAY frames
        case EFollowMode.permament: {
            viewport.moveLeft(viewportNow - offset, EVENT_AUTO_FOLLOW);
            return;
        }
        // In rare mode `now` point is allowed to reach right side of the viewport.
        // After reaching the side, `now` point is aligned with `delta` point.
        case EFollowMode.rare: {
            if (now > getViewportBounds(host)[1]) {
                viewport.moveLeft(
                    viewportNow - viewport.getWorldScreenWidth() * POSITION_MULTIPLAYER,
                    EVENT_AUTO_FOLLOW,
                );
            }
            return;
        }
        case EFollowMode.lastPoint: {
            const lastPointTime = getLastPointTime(host);

            if (lastPointTime > getViewportBounds(host)[1]) {
                viewport.moveLeft(
                    lastPointTime -
                        clientTimeIncrement -
                        viewport.getWorldScreenWidth() * POSITION_MULTIPLAYER,
                    EVENT_AUTO_FOLLOW,
                );
            }
            return;
        }
    }
}
