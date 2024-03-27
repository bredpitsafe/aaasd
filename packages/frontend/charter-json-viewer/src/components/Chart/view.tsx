import type { TClosestPointData } from '@frontend/charter/src/services/MouseClosestPointsController';
import type { TWithClassname } from '@frontend/common/src/types/components';
import cn from 'classnames';
import { ForwardedRef, forwardRef, ReactElement, useRef } from 'react';
import { useHoverDirty } from 'react-use';

import { TChartProps } from '../../types';
import { ChartCanvasView } from '../ChartCanvas/view';
import type { TChartLegendClickHandler } from '../ChartLegends/view';
import { ChartLegendsView } from '../ChartLegends/view';
import { ChartPointsPopup } from '../ChartPointsPopup/view';
import { cnCanvas, cnRoot } from './view.css';

type TChartViewProps = TWithClassname & {
    view: HTMLElement;
    charts: TChartProps[];
    onClickLegend: TChartLegendClickHandler;
    getChartClosestPoints: () => TClosestPointData[];
};
export const ChartView = forwardRef(
    (props: TChartViewProps, ref: ForwardedRef<HTMLDivElement>): ReactElement => {
        const canvasRef = useRef<HTMLDivElement>(null);
        const chartHovered = useHoverDirty(canvasRef);

        return (
            <div ref={ref} className={cn(props.className, cnRoot)}>
                <ChartLegendsView charts={props.charts} onClick={props.onClickLegend} />
                <ChartCanvasView ref={canvasRef} className={cnCanvas} view={props.view} />
                {chartHovered && (
                    <ChartPointsPopup
                        chartRef={canvasRef}
                        charts={props.charts}
                        getClosestPoints={props.getChartClosestPoints}
                    />
                )}
            </div>
        );
    },
);
