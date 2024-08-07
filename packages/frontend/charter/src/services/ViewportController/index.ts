import type { Milliseconds } from '@common/types';
import { plus } from '@common/utils';
import { createIntersectionObserver$ } from '@frontend/common/src/utils/observable/createIntersectionObserver';
import { documentVisibilityState$ } from '@frontend/common/src/utils/observable/documentVisibilityState';
import { combineLatest, fromEvent, merge, Subject } from 'rxjs';
import { distinctUntilChanged, filter, map, takeUntil } from 'rxjs/operators';

import {
    createLocalState,
    getState,
    millisecondsToSomeseconds,
    setClientTimeIncrement,
} from '../../Charter/methods';
import type { TBaseViewportEvent } from '../../components/ChartViewport/defs';
import { ViewportEvent } from '../../components/ChartViewport/defs';
import { DragPlugin } from '../../components/ChartViewport/plugins/DragPlugin';
import { WheelPlugin } from '../../components/ChartViewport/plugins/WheelPlugin';
import type { IContext } from '../../types';
import { isWideScaled } from '../MinMaxController/utils';
import { createFreeModeSwitcher } from './createFreeModeSwitcher$';
import { createZoomSwitcher$ } from './createZoomSwitcher$';

export class ViewportController {
    private readonly state: {
        visible: boolean;
        freeMode: boolean;
        timestampStep: number;
    };

    private destroy$ = new Subject<void>();

    constructor(private ctx: IContext) {
        const state = (this.state = createLocalState(
            ctx,
            'ViewportController',
            (state) =>
                state ?? {
                    visible: false,
                    freeMode: false,
                    // one year at someseconds
                    timestampStep:
                        365 *
                        24 *
                        60 *
                        60 *
                        millisecondsToSomeseconds(ctx.state, 1000 as Milliseconds), // 1sec;
                },
        ));

        const { tickerController, viewport } = ctx;

        tickerController.add(this.update, this);

        merge(
            fromEvent<TBaseViewportEvent>(viewport, ViewportEvent.ZoomH),
            fromEvent<TBaseViewportEvent>(viewport, ViewportEvent.MoveH),
        )
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => this.onMoved());

        combineLatest([
            createIntersectionObserver$(ctx.targetView, {
                rootMargin: '0px',
                threshold: [0, 1],
            }).pipe(
                map(({ isIntersecting }) => isIntersecting),
                distinctUntilChanged(),
            ),
            documentVisibilityState$,
        ])
            .pipe(takeUntil(this.destroy$))
            .subscribe(([isIntersecting, documentVisible]) => {
                state.visible = isIntersecting && documentVisible;
            });

        createFreeModeSwitcher(ctx.targetView)
            .pipe(takeUntil(this.destroy$))
            .subscribe((enable) => {
                state.freeMode = enable;
                DragPlugin.upsertOptions(ctx.viewport, {
                    disableY: !enable,
                });
                WheelPlugin.upsertOptions(ctx.viewport, {
                    disableX: false,
                    disableY: !enable,
                });
            });

        const { zoomOnlyY$, zoomOnlyX$ } = createZoomSwitcher$(ctx.targetView);

        combineLatest([zoomOnlyX$, zoomOnlyY$])
            .pipe(
                filter(() => state.freeMode),
                takeUntil(this.destroy$),
            )
            .subscribe(([onlyX, onlyY]) => {
                WheelPlugin.upsertOptions(ctx.viewport, {
                    disableX: onlyY && !onlyX,
                    disableY: onlyX && !onlyY,
                });
            });
    }

    destroy(): void {
        this.ctx.tickerController.remove(this.update, this);

        this.destroy$.next();
        this.destroy$.complete();
    }

    isVisible = (): boolean => {
        return this.state.visible;
    };

    private update(): void {
        if (!this.state.freeMode) {
            this.updateViewportByMinMax();
        }
    }

    private onMoved(): void {
        this.updateClientTimeIncrement();
    }

    private updateClientTimeIncrement(): void {
        const state = getState(this.ctx);
        const { viewport } = this.ctx;
        const { timestampStep } = this.state;
        const left = viewport.getLeft();

        if (Math.abs(left) > timestampStep) {
            const step = Math.sign(left) * timestampStep;

            setClientTimeIncrement(state, plus(state.clientTimeIncrement, step));

            // "moveLeft" initiates cascade sync where clientTimeIncrement is required, so we need to call
            // "setClientTimeIncrement" before "moveLeft"
            viewport.moveLeft(left - step, 'updateClientTimeIncrement');
        }
    }

    private updateViewportByMinMax(): void {
        const { viewport, minMaxController } = this.ctx;
        const { graphicsGap } = getState(this.ctx);
        const { screenHeight } = viewport;
        const minMax = minMaxController.getMinMax();

        if (!isWideScaled(minMax)) {
            const min = minMax[0];
            const max = minMax[1];

            const visualGap = screenHeight / 16;
            const height = screenHeight - visualGap * 2 - graphicsGap.b - graphicsGap.t;

            viewport.setScaleCenterY(height / (max - min));
            viewport.position.y = visualGap + height / 2 + ((max + min) / 2) * viewport.scale.y;
        }
    }
}
