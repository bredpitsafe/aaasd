import { createLocalState } from '../../Charter/methods';
import { EVirtualViewport } from '../../components/ChartViewport/defs';
import type { IContext } from '../../types';
import type { TMinMax } from '../MinMaxController/defs';
import { isWideScaled } from '../MinMaxController/utils';
import { VirtualViewport } from './VirtualViewport';

export class VirtualViewportController {
    private readonly state: {
        currentVisibleVirtualViewports: EVirtualViewport[];
    };
    private readonly currentVirtualViewportMap: Record<EVirtualViewport, VirtualViewport>;

    constructor(private ctx: IContext) {
        this.state = createLocalState(
            ctx,
            'VirtualViewportController',
            (state) =>
                state ?? {
                    currentVisibleVirtualViewports: [EVirtualViewport.left],
                },
        );
        this.currentVirtualViewportMap = {
            [EVirtualViewport.left]: new VirtualViewport(ctx, EVirtualViewport.left),
            [EVirtualViewport.right]: new VirtualViewport(ctx, EVirtualViewport.right),
        };

        ctx.tickerController.add(this.update, this);
    }

    destroy(): void {
        this.ctx.tickerController.remove(this.update, this);
    }

    getVirtualViewport(virtualViewportName: EVirtualViewport): VirtualViewport {
        return this.currentVirtualViewportMap[virtualViewportName];
    }

    getVisibleVirtualViewportNames(): EVirtualViewport[] {
        return this.state.currentVisibleVirtualViewports;
    }

    isVirtualViewportVisible(virtualViewportName: EVirtualViewport): boolean {
        return this.state.currentVisibleVirtualViewports.includes(virtualViewportName);
    }

    private update() {
        const { minMaxController, chartsController } = this.ctx;
        const { currentVisibleVirtualViewports } = this.state;
        const virtualViewportsMinMax = minMaxController.getVirtualViewportsMinMax();
        const visibleChartsProps = chartsController.getVisibleChartsProps();

        if (
            !chartsController.hasChartsOnAxis(EVirtualViewport.left) ||
            hasSingleScale(virtualViewportsMinMax)
        ) {
            this.currentVirtualViewportMap[EVirtualViewport.right].reset();
        } else {
            const [leftMin, leftMax] = virtualViewportsMinMax[EVirtualViewport.left];
            const [rightMin, rightMax] = virtualViewportsMinMax[EVirtualViewport.right];

            this.currentVirtualViewportMap[EVirtualViewport.right].setVirtualParameters(
                rightMin,
                rightMax,
                leftMin,
                leftMax,
            );
        }

        if (visibleChartsProps.length > 0) {
            currentVisibleVirtualViewports.length = 0;
            visibleChartsProps.forEach(({ yAxis }) => currentVisibleVirtualViewports.push(yAxis));
        }
    }
}

function hasSingleScale(minMax: Record<EVirtualViewport, TMinMax>): boolean {
    const left = minMax[EVirtualViewport.left];
    const right = minMax[EVirtualViewport.right];

    return isWideScaled(left) || isWideScaled(right) || isEqualMinMax(left, right);
}

function isEqualMinMax(a: TMinMax, b: TMinMax) {
    return a[0] === b[0] && a[1] === b[1];
}
