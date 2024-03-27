import type { TClosestPointData } from '@frontend/charter/src/services/MouseClosestPointsController';
import { ElementPopover } from '@frontend/common/src/components/ElementPopover';
import { MousePopover } from '@frontend/common/src/components/MousePopover';
import type { TWithClassname, TWithStyle } from '@frontend/common/src/types/components';
import { isNil } from 'lodash-es';
import { ReactElement, RefObject, useMemo } from 'react';
import { useObservable } from 'react-use';
import { timer } from 'rxjs';
import { map } from 'rxjs/operators';

import { TChartProps } from '../../types';
import { ChartPoints } from '../ChartPoints/view';

type TChartPointsPopup = TWithClassname &
    TWithStyle & {
        chartRef: RefObject<HTMLDivElement>;
        charts: TChartProps[];
        getClosestPoints: () => TClosestPointData[];
    };

const PopupPadding = 8;

export function ChartPointsPopup(props: TChartPointsPopup): ReactElement | null {
    const closestPoints = useObservable(
        useMemo(() => timer(0, 350).pipe(map(props.getClosestPoints)), [props.getClosestPoints]),
        [],
    );

    if (closestPoints.length === 0) {
        return null;
    }

    const canvasPoint = closestPoints.length === 1 ? closestPoints[0].canvasPoint : undefined;

    const chartPoints = <ChartPoints charts={props.charts} closestPoints={closestPoints} />;

    return isNil(canvasPoint) ? (
        <MousePopover
            positions={['right', 'left']}
            align={'start'}
            padding={PopupPadding}
            offsetY={PopupPadding}
            content={chartPoints}
        />
    ) : (
        <ElementPopover
            elementRef={props.chartRef}
            positions={['right', 'left']}
            align={'start'}
            padding={PopupPadding}
            offsetX={canvasPoint.x}
            offsetY={PopupPadding + canvasPoint.y}
            content={chartPoints}
        />
    );
}
