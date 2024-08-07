import type { TSeriesId } from '@frontend/charter/lib/Parts/def';
import { ElementPopover } from '@frontend/common/src/components/ElementPopover';
import { MousePopover } from '@frontend/common/src/components/MousePopover';
import type { TWithClassname, TWithStyle } from '@frontend/common/src/types/components';
import type { TPoint } from '@frontend/common/src/types/shape';
import { frameInterval } from '@frontend/common/src/utils/observable/frameTasks';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { isNil } from 'lodash-es';
import type { ReactElement, RefObject } from 'react';
import { useMemo } from 'react';
import { map } from 'rxjs/operators';

import type { TChartProps } from '../Chart/types';
import { ChartPoints } from '../ChartPoints/view';

export type TClosestPointData = {
    id: TSeriesId;
    point: TPoint;
    nonNaNPoint?: TPoint;
    canvasPoint?: TPoint;
};

type TChartPointsPopup = TWithClassname &
    TWithStyle & {
        charts: TChartProps[];
        getClosestPoints: () => TClosestPointData[];
        getMouseCoords: () => TPoint;
        chartRef: RefObject<HTMLDivElement>;
    };

const POPUP_PADDING = 8;

export function ChartPointsPopup({
    getClosestPoints,
    getMouseCoords,
    charts,
    chartRef,
}: TChartPointsPopup): ReactElement | null {
    const closestPoints = useSyncObservable(
        useMemo(() => frameInterval(3).pipe(map(getClosestPoints)), [getClosestPoints]),
        [],
    );

    const showWindow = closestPoints.length > 0;

    const mouseCoords = useSyncObservable(
        useMemo(() => frameInterval(1).pipe(map(getMouseCoords)), [getMouseCoords]),
        showWindow ? getMouseCoords() : undefined,
    );

    if (!showWindow) {
        return null;
    }

    const canvasPoint = closestPoints.length === 1 ? closestPoints[0].canvasPoint : undefined;

    const chartPoints = <ChartPoints charts={charts} closestPoints={closestPoints} />;

    return isNil(canvasPoint) ? (
        <MousePopover
            positions={['right', 'left']}
            align="start"
            padding={POPUP_PADDING}
            offsetY={POPUP_PADDING}
            content={chartPoints}
            initialMouseX={mouseCoords?.x}
            initialMouseY={mouseCoords?.y}
        />
    ) : (
        <ElementPopover
            elementRef={chartRef}
            positions={['right', 'left']}
            align="start"
            padding={POPUP_PADDING}
            offsetX={canvasPoint.x}
            offsetY={POPUP_PADDING + canvasPoint.y}
            content={chartPoints}
        />
    );
}
