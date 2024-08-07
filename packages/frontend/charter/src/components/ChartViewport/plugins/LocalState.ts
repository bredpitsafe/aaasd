import type { Subscription } from 'rxjs';
import { fromEvent, merge } from 'rxjs';

import { createLocalState } from '../../../Charter/methods';
import type { IContext } from '../../../types';
import type { IChartViewport, TBaseViewportEvent } from '../defs';
import { ViewportEventNS } from '../defs';
import type { IPlugin } from './defs';

export class LocalState implements IPlugin {
    private subscription: Subscription | undefined = undefined;

    constructor(private readonly ctx: IContext) {}

    connect(viewport: IChartViewport) {
        const state = createLocalState<{
            x: number;
            y: number;
            scale: {
                x: number;
                y: number;
            };
        }>(
            this.ctx,
            'Viewport',
            (state) =>
                state ?? {
                    x: viewport.x ?? 0,
                    y: viewport.y ?? 0,
                    scale: { x: viewport.scale.x ?? 0, y: viewport.scale.y ?? 0 },
                },
        );

        Object.assign(viewport, state);

        this.subscription = merge(
            fromEvent<TBaseViewportEvent>(viewport, ViewportEventNS.ApplyZoom),
            fromEvent<TBaseViewportEvent>(viewport, ViewportEventNS.ApplyMove),
        ).subscribe(() => {
            state.x = viewport.x;
            state.y = viewport.y;
            state.scale.x = viewport.scale.x;
            state.scale.y = viewport.scale.y;
        });
    }

    destroy() {
        this.subscription?.unsubscribe();
    }
}
