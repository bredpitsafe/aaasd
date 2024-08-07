import { Container } from 'pixi.js';

import type { TPart } from '../../../lib/Parts/def';
import type { VirtualViewport } from '../../services/VirtualViewportController/VirtualViewport';
import { createPartsChangeDetector } from '../../utils/Detectors/createPartsChangeDetector';
import { createValueChangeDetector } from '../../utils/Detectors/createValueChangeDetector';
import {
    createPixiElement,
    DeclarativeChildrenController,
} from '../../utils/Pixi/DeclarativeChildrenController';
import { PixiComponent } from '../../utils/Pixi/PixiComponent';
import { ChartParts } from '../ChartParts';
import type { TChartProps } from './defs';

export class Chart extends PixiComponent(Container) {
    private declarativeChildren = new DeclarativeChildrenController(this);
    private partsChangeDetector = createPartsChangeDetector();
    private viewportChangeDetector = createValueChangeDetector<VirtualViewport, number>(
        (viewport: VirtualViewport) => viewport.getHash(),
    );
    private propsChangeDetector = createValueChangeDetector<
        Pick<TChartProps, 'yAxis' | 'type'>,
        string
    >(({ yAxis, type }: Pick<TChartProps, 'yAxis' | 'type'>) => yAxis + type);

    constructor(public props: TChartProps) {
        super();
    }

    updateTransform() {
        this.syncWithViewport();

        const visibleParts = this.props.ctx.partsController.getVisibleParts(this.props.id);

        if (this.shouldUpdateChildren(visibleParts)) {
            this.updateChildren(visibleParts);
        }

        super.updateTransform();
    }

    protected shouldUpdateChildren(parts: TPart[]): boolean {
        const { ctx, yAxis } = this.props;
        const virtualViewport = ctx.virtualViewportController.getVirtualViewport(yAxis);
        const virtualViewportChanges = this.viewportChangeDetector(virtualViewport);
        const partsChanges = this.partsChangeDetector(parts);

        const propsChanged = this.propsChangeDetector(this.props);

        return virtualViewportChanges || partsChanges || propsChanged;
    }

    private updateChildren(parts: TPart[]): void {
        const { ctx, type, striving } = this.props;

        this.declarativeChildren.update([
            createPixiElement(ChartParts, {
                key: `Parts`,
                ctx,
                type,
                parts,
                striving,
            }),
        ]);
    }

    private syncWithViewport() {
        const { partsCoordsController, virtualViewportController } = this.props.ctx;
        const shift = partsCoordsController.getChartDelta(this.props.id);
        const vv = virtualViewportController.getVirtualViewport(this.props.yAxis)!;

        this.x = (shift.x - vv.absLeft) * vv.scale.x;
        this.y = vv.y - shift.y * vv.scale.y;
        this.scale = vv.scale;
    }
}
