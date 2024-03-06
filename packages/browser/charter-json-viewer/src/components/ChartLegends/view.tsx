import { EVirtualViewport } from '@frontend/charter/src/components/ChartViewport/defs';
import { Tooltip } from '@frontend/common/src/components/Tooltip';
import { getHexCssColor } from '@frontend/common/src/utils/colors';
import cn from 'classnames';
import { MouseEvent, ReactElement } from 'react';

import { TChartProps } from '../../types';
import {
    cnLeftYAxis,
    cnLegend,
    cnLegendInactive,
    cnLegends,
    cnLine,
    cnRightYAxis,
    cnRoot,
    cnTextLine,
} from './view.css';

type TChartLegendsView = {
    className?: string;
    charts: TChartProps[];
    onClick: TChartLegendClickHandler;
};

export type TChartLegendClickModifiers = Pick<
    MouseEvent,
    'ctrlKey' | 'altKey' | 'shiftKey' | 'metaKey'
>;

export type TChartLegendClickHandler = (
    chart: TChartProps,
    modifiers: TChartLegendClickModifiers,
) => void;

export function ChartLegendsView(props: TChartLegendsView): ReactElement {
    const legends = props.charts.map((chart, index) => {
        return <ChartLegend key={chart.id + index} chart={chart} onClick={props.onClick} />;
    });

    return (
        <div className={cn(cnRoot, props.className)}>
            <div className={cnLegends}>{legends}</div>
        </div>
    );
}

function ChartLegend(props: {
    chart: TChartProps;
    onClick: TChartLegendClickHandler;
}): ReactElement {
    const { chart, onClick } = props;

    return (
        <Tooltip placement="bottom" title={chart.id}>
            <div
                className={cn(cnLegend, {
                    [cnLegendInactive]: !chart.visible,
                })}
                onClick={(event: MouseEvent) => {
                    event.preventDefault();
                    onClick(chart, {
                        altKey: event.altKey,
                        shiftKey: event.shiftKey,
                        ctrlKey: event.ctrlKey,
                        metaKey: event.metaKey,
                    });
                }}
            >
                <div className={cnTextLine}>
                    <div
                        className={cn({
                            [cnLeftYAxis]: chart.yAxis === EVirtualViewport.left,
                            [cnRightYAxis]: chart.yAxis === EVirtualViewport.right,
                        })}
                    >
                        {chart.id}
                    </div>
                    <div
                        className={cnLine}
                        style={{
                            backgroundColor: getHexCssColor(chart.color),
                            opacity: chart.opacity,
                        }}
                    />
                </div>
            </div>
        </Tooltip>
    );
}
