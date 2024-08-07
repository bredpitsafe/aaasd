import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import type { IContext } from '../types';

export type IRenderController = ReturnType<typeof createRenderController>;

export function createRenderController(ctx: IContext) {
    const destroy$ = new Subject<void>();

    ctx.tickerController
        .getTicker$()
        .pipe(filter(ctx.viewportController.isVisible), takeUntil(destroy$))
        .subscribe(render);

    function render() {
        ctx.sharedRenderer.renderStage(ctx.stage);
        ctx.sharedRenderer.transferImageToCanvas(ctx.targetContext);
    }

    function destroy() {
        destroy$.next();
        destroy$.complete();
    }

    return { destroy };
}
