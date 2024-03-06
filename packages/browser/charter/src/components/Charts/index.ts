import { Container, Graphics } from 'pixi.js';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { getState } from '../../Charter/methods';
import type { IContext } from '../../types';
import {
    createPixiElement,
    DeclarativeChildrenController,
} from '../../utils/Pixi/DeclarativeChildrenController';
import { PixiComponent } from '../../utils/Pixi/PixiComponent';
import { Chart } from '../Chart';

type TChartsProps = {
    ctx: IContext;
};

export class Charts extends PixiComponent(Container) {
    private declarativeChildren = new DeclarativeChildrenController(this);

    private destroyer$ = new Subject<void>();

    constructor(public props: TChartsProps) {
        super();

        this.mask = new Graphics();
        this.updateMask();
    }

    onMount(): void {
        const { ctx } = this.props;

        ctx.sizeController.getResize$().pipe(takeUntil(this.destroyer$)).subscribe(this.updateMask);

        ctx.chartsController.update$.pipe(takeUntil(this.destroyer$)).subscribe((charts) => {
            this.declarativeChildren.update(
                charts
                    .filter((chart) => chart.visible)
                    .map((chartProps) =>
                        createPixiElement(Chart, {
                            key: chartProps.id,
                            ctx,
                            ...chartProps,
                        }),
                    ),
            );
        });
    }

    onUnmount(): void {
        this.destroyer$.next();
        this.destroyer$.complete();
    }

    private updateMask = (): void => {
        const { viewport } = this.props.ctx;
        const { graphicsGap } = getState(this.props.ctx);
        const mask = this.mask as Graphics;

        mask.clear();
        mask.beginFill(0xffffff);
        mask.drawRect(
            graphicsGap.l,
            graphicsGap.t,
            viewport.screenWidth - graphicsGap.l - graphicsGap.r,
            viewport.screenHeight - graphicsGap.t - graphicsGap.b,
        );
        mask.endFill();
    };
}
