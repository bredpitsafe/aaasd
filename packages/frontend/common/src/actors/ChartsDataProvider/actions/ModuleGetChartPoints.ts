import type { Assign, Nil } from '@common/types';
import type { Observable } from 'rxjs';

import { DEDUPE_REMOVE_DELAY } from '../../../defs/observables';
import type { TContextRef } from '../../../di';
import { getSocketUrlHash } from '../../../utils/hash/getSocketUrlHash.ts';
import { createObservableProcedure } from '../../../utils/LPC/createObservableProcedure';
import { DEDOBS_SKIP_KEY } from '../../../utils/observable/memo.ts';
import { mapValueDescriptor } from '../../../utils/Rx/ValueDescriptor2';
import type { TPointStyle } from '../../../utils/Sandboxes/pointStyler';
import { semanticHash } from '../../../utils/semanticHash';
import type { TValueDescriptor2 } from '../../../utils/ValueDescriptor/types';
import { createSyncedValueDescriptor } from '../../../utils/ValueDescriptor/utils';
import type { TClosestChartPoint } from './defs';
import { POINTS_SHARE_RESET_DELAY } from './defs';
import { createChartPoints, getStyleFactory, getValueFactory } from './ModuleGetChartPoints.utils';
import type {
    TGetIndicatorPointsProps,
    TGetPointsCoordsReturnType,
} from './ModuleGetIndicatorPoints';
import { ModuleGetIndicatorPoints } from './ModuleGetIndicatorPoints';

export type TGetChartPointsProps = TGetIndicatorPointsProps & {
    style: TPointStyle;
    styler: undefined | string;
    formula: undefined | string;
    live: boolean;
};

export type TGetChartPointsReturnType = Assign<
    TGetPointsCoordsReturnType,
    {
        absLeftPoint: Nil | TClosestChartPoint;
        absRightPoint: Nil | TClosestChartPoint;
    }
>;

export const ModuleGetChartPoints = createObservableProcedure(
    (ctx: TContextRef) => {
        const getPointsCoords = ModuleGetIndicatorPoints(ctx);

        return (
            params: TGetChartPointsProps,
            options,
        ): Observable<TValueDescriptor2<TGetChartPointsReturnType>> => {
            return getPointsCoords(params, options).pipe(
                mapValueDescriptor(({ value: points }) => {
                    const getValue = getValueFactory(params.formula);
                    const getStyle = getStyleFactory(params.style, params.styler);

                    return createSyncedValueDescriptor(
                        createChartPoints(points, getValue, getStyle),
                    );
                }),
            );
        };
    },
    {
        dedobs: {
            normalize: ([props]) =>
                props.live
                    ? DEDOBS_SKIP_KEY
                    : semanticHash.get(props, {
                          target: semanticHash.withHasher(getSocketUrlHash),
                          style: {},
                      }),
            resetDelay: POINTS_SHARE_RESET_DELAY,
            removeDelay: DEDUPE_REMOVE_DELAY,
        },
    },
);
