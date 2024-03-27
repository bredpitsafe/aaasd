import { fromEvent, merge, Subscription } from 'rxjs';

import { createLocalState } from '../../../Charter/methods';
import type { IContext } from '../../../types';
import { IChartViewport, TBaseViewportEvent, ViewportEventNS } from '../defs';
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
                    x: viewport.x,
                    y: viewport.y,
                    scale: { x: viewport.scale.x, y: viewport.scale.y },
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
