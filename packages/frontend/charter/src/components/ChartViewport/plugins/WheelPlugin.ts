import { defaults } from 'lodash-es';
import type { Subscription } from 'rxjs';
import { fromEvent } from 'rxjs';
import { filter, tap } from 'rxjs/operators';

import type { IChartViewport } from '../defs';
import { ViewportEvent } from '../defs';
import { mapPositionToPoint } from '../utils';
import type { IPlugin } from './defs';

type TWheelOptions = {
    disableX: boolean;
    disableY: boolean;
    reverse: boolean;
    lineHeight: number;
    multiplier: number;
};

const DEFAULT_OPTIONS = {
    disableX: false,
    disableY: true,
    reverse: false,
    lineHeight: 20,
    multiplier: 1,
};

const EVENT_WHEEL = 'user.wheel';

export class WheelPlugin implements IPlugin {
    static upsertOptions(viewport: IChartViewport, options: Partial<TWheelOptions>): void {
        return viewport.findPlugin(WheelPlugin)?.upsertOptions(options);
    }

    private options: TWheelOptions;
    private subscription: undefined | Subscription;

    constructor(
        private canvasElement: HTMLCanvasElement,
        private eventsElement: HTMLElement,
        private resolution: number,
        options?: Partial<TWheelOptions>,
    ) {
        this.options = defaults({}, options, DEFAULT_OPTIONS);
    }

    connect(viewport: IChartViewport) {
        this.subscription = fromEvent<WheelEvent>(this.eventsElement, 'wheel')
            .pipe(
                filter((event) => event.target === this.eventsElement),
                tap((event) => {
                    event.preventDefault();
                }),
                filter((event) => event.buttons === 0),
            )
            .subscribe((event: WheelEvent) => {
                viewport.emit(ViewportEvent.StartUserAction);
                this.wheel(event, viewport);
                viewport.emit(ViewportEvent.StopUserAction);
            });
    }

    destroy() {
        this.subscription?.unsubscribe();
        // @ts-ignore
        this.eventsElement = undefined;
        // @ts-ignore
        this.eventSystem = undefined;
    }

    wheel(event: WheelEvent, viewport: IChartViewport) {
        const { lineHeight, reverse, multiplier, disableY, disableX } = this.options;
        const point = mapPositionToPoint(
            this.canvasElement,
            this.eventsElement,
            this.resolution,
            event.clientX,
            event.clientY,
        );
        const sign = reverse ? -1 : 1;
        const step = (sign * -event.deltaY * (event.deltaMode ? lineHeight : 1)) / 500;
        const change = Math.pow(2, multiplier * step);

        if (!disableX) {
            viewport.setScaleX(viewport.scale.x * change, viewport.toLocal(point), EVENT_WHEEL);
        }

        if (!disableY) {
            viewport.setScaleY(viewport.scale.y * change, viewport.toLocal(point), EVENT_WHEEL);
        }
    }

    upsertOptions(options: Partial<TWheelOptions>) {
        Object.assign(this.options, options);
    }
}
