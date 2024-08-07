import { isClamped } from '@frontend/common/src/utils/isClamped';
import { createIntersectionObserver$ } from '@frontend/common/src/utils/observable/createIntersectionObserver';
import { frameInterval } from '@frontend/common/src/utils/observable/frameTasks';
import { Ticker } from 'pixi.js';
import type { Observable } from 'rxjs';
import {
    BehaviorSubject,
    EMPTY,
    fromEvent,
    interval,
    merge,
    mergeMap,
    of,
    Subject,
    switchMap,
    withLatestFrom,
} from 'rxjs';
import {
    debounceTime,
    distinctUntilChanged,
    filter,
    groupBy,
    map,
    mapTo,
    takeUntil,
    tap,
} from 'rxjs/operators';

import { getTimeNow } from '../Charter/methods';
import { ViewportEventNS } from '../components/ChartViewport/defs';
import type { IContext } from '../types';
import { viewportFocusedOnNow } from '../utils/ctx';
import { createPartsChangeDetector } from '../utils/Detectors/createPartsChangeDetector';

const MIN_FPS = 5;
const MAX_FPS = 60;
// Get max fps when user work with current chart (mouse interaction)
const FOCUS_FPS = MAX_FPS;
// 36 fps looks smoothly for unfocused chart
const UNFOCUS_FPS = 36;
// When viewport look at "now", we should update chart, for draw striving lines
const VIEWPORT_NOW_FPS = 36;
// 20 fps enough for resize chart, is a rear operation
const RESIZE_FPS = 20;
// 10 fps enough for update changed charts/parts
const CHANGE_CHARTS_FPS = 10;
// 500 - the number chosen empirically (for 10 fps it's 5 frames)
const TICKER_DELAY_DOWN = 500;

export class TickerController {
    private fps$ = new BehaviorSubject<number>(MIN_FPS);
    private ticker$ = new Subject<void>();
    private started$ = new BehaviorSubject<boolean>(false);

    private destroyer$ = new Subject<void>();

    private ticker: Ticker = new Ticker();
    private fpsController = new FPSController(MIN_FPS);
    private partsChangeDetector = createPartsChangeDetector();

    constructor(private ctx: IContext) {
        this.prepareTicker();
    }

    destroy(): void {
        this.destroyer$.next();
        this.destroyer$.complete();
        this.ticker.destroy();
        // @ts-ignore
        this.ticker = undefined;
    }

    isStarted$(): Observable<boolean> {
        return this.started$.pipe(distinctUntilChanged());
    }

    getTicker$(): Observable<void> {
        return this.ticker$;
    }

    start(): void {
        if (!this.started$.getValue()) {
            this.started$.next(true);
        }
    }

    stop(): void {
        if (this.started$.getValue()) {
            this.started$.next(false);
        }
    }

    add(...arg: Parameters<typeof Ticker.prototype.add>): void {
        // @ts-ignore
        this.ticker?.add(...arg);
    }

    remove(...arg: Parameters<typeof Ticker.prototype.remove>): void {
        // @ts-ignore
        this.ticker?.remove(...arg);
    }

    startControlFPS(): void {
        const { ticker } = this;
        const { isFocusedWindow$, isFocusedApp$ } = this.ctx.focusController;
        const emitTick = () => this.ticker$.next();

        this.fps$.pipe(takeUntil(this.destroyer$)).subscribe((fps) => (ticker.maxFPS = fps));

        this.started$
            .pipe(
                switchMap((state) => (state ? frameInterval(1) : EMPTY)),
                takeUntil(this.destroyer$),
            )
            .subscribe(() => ticker.update());

        this.add(emitTick);
        this.destroyer$.subscribe(() => this.remove(emitTick));

        merge(
            // Initial fps
            of(MAX_FPS),
            this.getMouseTrigger$().pipe(mapTo(FOCUS_FPS)),
            this.getPseudoMouseTrigger$().pipe(mapTo(UNFOCUS_FPS)),
            this.getViewportTrigger$().pipe(mapTo(UNFOCUS_FPS)),
            this.getViewportOnNowTrigger$().pipe(mapTo(VIEWPORT_NOW_FPS)),
            this.getResizeTrigger$().pipe(mapTo(RESIZE_FPS)),
            this.getChartsChangeTrigger$().pipe(mapTo(CHANGE_CHARTS_FPS)),
            this.getPartsChangeTrigger$().pipe(mapTo(CHANGE_CHARTS_FPS)),
            this.getTimeZoneTrigger$().pipe(mapTo(CHANGE_CHARTS_FPS)),
            this.getVisibilityAdaptiveFps$(),
        )
            .pipe(
                withLatestFrom(isFocusedWindow$, isFocusedApp$),
                map(([fps, isFocusedWindow, isFocusedApp]) => {
                    return isFocusedWindow || isFocusedApp
                        ? fps
                        : Math.max(Math.floor(fps / 2), MIN_FPS);
                }),
                tap((fps) => {
                    this.start();
                    this.fps$.next(this.fpsController.add(fps).getMaxFPS());
                }),
                groupBy((fps) => fps),
                mergeMap((fps$) =>
                    fps$.pipe(
                        debounceTime(TICKER_DELAY_DOWN),
                        tap((fps) => {
                            this.fps$.next(this.fpsController.delete(fps).getMaxFPS());
                        }),
                    ),
                ),
                takeUntil(this.destroyer$),
            )
            .subscribe();

        interval(2_000)
            .pipe(
                filter(() => !viewportFocusedOnNow(this.ctx) && this.fps$.getValue() === MIN_FPS),
                takeUntil(this.destroyer$),
            )
            .subscribe(() => this.stop());
    }

    private prepareTicker() {
        const { ticker } = this;

        ticker.stop();
        ticker.minFPS = MIN_FPS;
        // Don't use inner ticker methods
        ticker.start = () => this.start();
        ticker.stop = () => this.stop();
    }

    private getVisibilityAdaptiveFps$(): Observable<number> {
        const { targetView } = this.ctx;

        return createIntersectionObserver$(targetView, {
            rootMargin: '0px',
            threshold: [0, 0.1, 0.5, 0.9, 1],
        }).pipe(
            map(({ intersectionRatio }) => Math.round(intersectionRatio * UNFOCUS_FPS)),
            distinctUntilChanged(),
        );
    }

    private getMouseTrigger$() {
        const { targetView } = this.ctx;

        return merge(
            fromEvent(targetView, 'mousemove', { passive: true }),
            fromEvent(targetView, 'wheel', { passive: true }),
        );
    }

    private getPseudoMouseTrigger$() {
        return this.ctx.mouseController.pseudoMouseCoords$;
    }

    private getChartsChangeTrigger$() {
        const { chartsController } = this.ctx;

        return chartsController.update$;
    }

    private getPartsChangeTrigger$() {
        const { partsController } = this.ctx;

        return frameInterval(1).pipe(
            map(() => partsController.getAllVisibleParts()),
            filter((parts) => this.partsChangeDetector(parts)),
        );
    }

    private getViewportTrigger$() {
        const { viewport } = this.ctx;

        return merge(
            fromEvent(viewport, ViewportEventNS.ApplyMove),
            fromEvent(viewport, ViewportEventNS.ApplyZoom),
        );
    }

    private getViewportOnNowTrigger$() {
        const { state, viewport } = this.ctx;

        return frameInterval(5).pipe(
            filter(() => {
                const now = getTimeNow(state) - state.serverTimeIncrement;
                return isClamped(now, viewport.getLeft(), viewport.getRight());
            }),
        );
    }

    private getResizeTrigger$() {
        const { sizeController } = this.ctx;

        return sizeController.getResize$();
    }

    private getTimeZoneTrigger$() {
        const { timeZoneController } = this.ctx;

        return timeZoneController.timeZone$;
    }
}

class FPSController {
    private current = new Set<number>();

    constructor(private fallback: number) {}

    add(fps: number): this {
        this.current.add(fps);
        return this;
    }

    delete(fps: number): this {
        this.current.delete(fps);
        return this;
    }

    getMaxFPS(): number {
        return this.current.size > 0 ? Math.max(...this.current) : this.fallback;
    }
}
