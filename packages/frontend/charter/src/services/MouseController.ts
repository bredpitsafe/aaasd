import type { TPoint } from '@frontend/common/src/types/shape';
import { BehaviorSubject, fromEvent, merge, Subject } from 'rxjs';
import { map, mapTo, takeUntil } from 'rxjs/operators';

import type { IContext } from '../types';
import type { VirtualViewport } from './VirtualViewportController/VirtualViewport';

export const START_POINT = { x: 0, y: 0 };

export class MouseController {
    mouseCoords$ = new BehaviorSubject<TPoint>(START_POINT);
    pseudoMouseCoords$ = new BehaviorSubject<TPoint>(START_POINT);

    private destroy$ = new Subject<void>();

    constructor(private ctx: IContext) {
        merge(
            fromEvent<MouseEvent>(ctx.targetView, 'mousemove').pipe(
                map(({ offsetX: x, offsetY: y }) => ({ x, y })),
            ),
            fromEvent(ctx.targetView, 'mouseout').pipe(mapTo(START_POINT)),
            fromEvent(ctx.targetView, 'mouseleave').pipe(mapTo(START_POINT)),
        )
            .pipe(takeUntil(this.destroy$))
            .subscribe((point) => this.mouseCoords$.next(point));
    }

    destroy(): void {
        this.mouseCoords$.complete();
        this.pseudoMouseCoords$.complete();
    }

    getCanvasMouseCoords(): TPoint {
        return this.mouseCoords$.getValue();
    }

    getChartMouseCoords(viewport: VirtualViewport, point = this.getCanvasMouseCoords()): TPoint {
        return this.fromCanvasToChartPoint(point, viewport);
    }

    setPseudoCanvasMouseCoords(point: TPoint): void {
        this.pseudoMouseCoords$.next({ x: point.x, y: point.y });
    }

    getPseudoCanvasMouseCoords(): TPoint {
        return this.pseudoMouseCoords$.getValue();
    }

    getPseudoChartMouseCoords(
        viewport: VirtualViewport,
        point = this.getPseudoCanvasMouseCoords(),
    ): TPoint {
        return this.fromCanvasToChartPoint(point, viewport);
    }

    private fromCanvasToChartPoint(point: TPoint, vv: VirtualViewport): TPoint {
        const x = vv.absLeft + point.x / vv.scale.x;
        const y = (vv.y - point.y) / vv.scale.y;

        return { x, y };
    }
}
