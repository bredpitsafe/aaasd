import { mapGet } from '@common/utils';
import type { TPoint } from '@frontend/common/src/types/shape';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import type { TPart, TSeriesId } from '../../lib/Parts/def';
import { getMinTimeStart } from '../../lib/Parts/utils/point';
import type { IContext } from '../types';

export class PartsCoordsController {
    private destroy$ = new Subject();
    private deltaMap = new Map<TSeriesId, TPoint>();

    constructor(private ctx: IContext) {
        ctx.tickerController
            .getTicker$()
            .pipe(filter(ctx.viewportController.isVisible), takeUntil(this.destroy$))
            .subscribe(this.updateDeltaMap);
    }

    getChartDelta(id: TSeriesId): TPoint {
        return this.deltaMap.get(id) ?? EMPTY_POINT;
    }

    getPartDelta(p: TPart): TPoint {
        const delta = this.getChartDelta(p.seriesId);

        return {
            x: p.interval[0] - delta.x,
            y: p.baseValue - delta.y,
        };
    }

    private updateDeltaMap = () => {
        const ids = this.ctx.chartsController.getVisibleChartsIds();

        for (const id of ids) {
            const parts = this.ctx.partsController.getVisiblePartsUnsorted(id);
            const point = mapGet(this.deltaMap, id, getEmptyPoint);
            const minX = getMinTimeStart(parts);
            const minY = parts.reduce(reduceMinBaseValue, Infinity);

            point.x = isFinite(minX) ? minX : 0;
            point.y = isFinite(minY) ? minY : 0;
        }
    };
}

const EMPTY_POINT = { x: 0, y: 0 };
const getEmptyPoint = () => Object.assign({}, EMPTY_POINT);
const reduceMinBaseValue = (min: number, part: TPart) =>
    part.size === 0 ? min : part.baseValue > min ? min : part.baseValue;
