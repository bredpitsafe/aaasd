import type { TSeriesId } from '@frontend/charter/lib/Parts/def';
import { EVirtualViewport } from '@frontend/charter/src/components/ChartViewport/defs';
import { createTestProps } from '@frontend/common/e2e';
import { EDashboardPageSelectors } from '@frontend/common/e2e/selectors/dashboard/dashboard.page.selectors';
import { Tooltip } from '@frontend/common/src/components/Tooltip';
import type { TIndicator } from '@frontend/common/src/modules/actions/indicators/defs';
import { getChartLegendLabel } from '@frontend/common/src/utils/chartLegends';
import { getHexCssColor } from '@frontend/common/src/utils/colors';
import cn from 'classnames';
import type { MouseEvent, ReactElement } from 'react';

import { getPanelLabel } from '../../utils/panels';
import type { TChartProps } from '../Chart/types';
import {
    cnLeftYAxis,
    cnLegend,
    cnLegendInactive,
    cnLegends,
    cnLegendsViewModeAll,
    cnLegendsViewModeScroll,
    cnLine,
    cnRightYAxis,
    cnRoot,
    cnTextLine,
} from './view.css';

export type TChartLegendsView = {
    className?: string;
    charts: (TChartProps & { background?: string })[];
    mapChartIdToIndicatorValue: ReadonlyMap<TSeriesId, TIndicator | undefined> | undefined;
    isCollapsed: boolean;
    fontSize: number | undefined;
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
        return (
            <ChartLegend
                key={chart.query + index}
                chart={chart}
                value={props.mapChartIdToIndicatorValue?.get(chart.id)?.value}
                fontSize={props.fontSize}
                onClick={props.onClick}
            />
        );
    });

    return (
        <div className={cn(cnRoot, props.className)}>
            <div
                className={cn(cnLegends, {
                    [cnLegendsViewModeAll]: !props.isCollapsed,
                    [cnLegendsViewModeScroll]: props.isCollapsed,
                })}
                {...createTestProps(EDashboardPageSelectors.ChartLegends)}
            >
                {legends}
            </div>
        </div>
    );
}

function ChartLegend(props: {
    chart: TChartProps & { background?: string };
    value?: TIndicator['value'];
    fontSize: number | undefined;
    onClick: TChartLegendClickHandler;
}): ReactElement {
    const { chart, value, fontSize, onClick } = props;

    const label = getChartLegendLabel(chart.labelFormat, getPanelLabel(chart), value);

    return (
        <Tooltip placement="bottom" title={label}>
            <div
                className={cn(cnLegend, {
                    [cnLegendInactive]: !chart.visible,
                })}
                style={{ backgroundColor: chart.background }}
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
                        style={{ fontSize }}
                        className={cn({
                            [cnLeftYAxis]: chart.yAxis === EVirtualViewport.left,
                            [cnRightYAxis]: chart.yAxis === EVirtualViewport.right,
                        })}
                    >
                        {label}
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
