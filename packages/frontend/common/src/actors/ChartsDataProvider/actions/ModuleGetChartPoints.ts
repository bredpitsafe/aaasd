import { identity, Observable } from 'rxjs';

import { DEDUPE_REMOVE_DELAY } from '../../../defs/observables';
import type { TContextRef } from '../../../di';
import type { Assign, Nil } from '../../../types';
import { createObservableProcedure } from '../../../utils/LPC/createObservableProcedure';
import { shareReplayWithDelayedReset } from '../../../utils/Rx/share';
import { mapValueDescriptor } from '../../../utils/Rx/ValueDescriptor2';
import type { TPointStyle } from '../../../utils/Sandboxes/pointStyler';
import { semanticHash } from '../../../utils/semanticHash';
import { uniqueHash } from '../../../utils/uniqueHash';
import type { TValueDescriptor2 } from '../../../utils/ValueDescriptor/types';
import { createSyncedValueDescriptor } from '../../../utils/ValueDescriptor/utils';
import { POINTS_SHARE_RESET_DELAY, TClosestChartPoint } from './defs';
import { createChartPoints, getStyleFactory, getValueFactory } from './ModuleGetChartPoints.utils';
import {
    ModuleGetIndicatorPoints,
    TGetIndicatorPointsProps,
    TGetPointsCoordsReturnType,
} from './ModuleGetIndicatorPoints';

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
                params.live
                    ? identity
                    : shareReplayWithDelayedReset(POINTS_SHARE_RESET_DELAY, Infinity),
            );
        };
    },
    {
        dedobs: {
            normalize: ([props]) =>
                props.live
                    ? uniqueHash.get()
                    : semanticHash.get(props, {
                          style: {},
                      }),
            removeDelay: DEDUPE_REMOVE_DELAY,
        },
    },
);
