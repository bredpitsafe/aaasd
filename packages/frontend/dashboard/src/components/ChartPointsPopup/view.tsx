import { TSeriesId } from '@frontend/charter/lib/Parts/def';
import { ElementPopover } from '@frontend/common/src/components/ElementPopover';
import { MousePopover } from '@frontend/common/src/components/MousePopover';
import type { TWithClassname, TWithStyle } from '@frontend/common/src/types/components';
import type { TPoint } from '@frontend/common/src/types/shape';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { isNil } from 'lodash-es';
import { ReactElement, RefObject, useMemo } from 'react';
import { timer } from 'rxjs';
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
        chartRef: RefObject<HTMLDivElement>;
        charts: TChartProps[];
        getClosestPoints: () => TClosestPointData[];
        getMouseCoords: () => TPoint;
    };

const PopupPadding = 8;

export function ChartPointsPopup({
    getClosestPoints,
    getMouseCoords,
    charts,
    chartRef,
}: TChartPointsPopup): ReactElement | null {
    const closestPoints = useSyncObservable(
        useMemo(() => timer(0, 350).pipe(map(getClosestPoints)), [getClosestPoints]),
        [],
    );

    const showWindow = closestPoints.length > 0;

    const initialMousePosition = useMemo(
        () => (showWindow ? getMouseCoords() : undefined),
        [showWindow, getMouseCoords],
    );

    if (!showWindow) {
        return null;
    }

    const canvasPoint = closestPoints.length === 1 ? closestPoints[0].canvasPoint : undefined;

    const chartPoints = <ChartPoints charts={charts} closestPoints={closestPoints} />;

    return isNil(canvasPoint) ? (
        <MousePopover
            positions={['right', 'left']}
            align={'start'}
            padding={PopupPadding}
            offsetY={PopupPadding}
            content={chartPoints}
            initialMouseX={initialMousePosition?.x}
            initialMouseY={initialMousePosition?.y}
        />
    ) : (
        <ElementPopover
            elementRef={chartRef}
            positions={['right', 'left']}
            align={'start'}
            padding={PopupPadding}
            offsetX={canvasPoint.x}
            offsetY={PopupPadding + canvasPoint.y}
            content={chartPoints}
        />
    );
}
