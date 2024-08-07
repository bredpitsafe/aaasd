import type { Nanoseconds } from '@common/types';
import { EDateTimeFormats } from '@common/types';
import { nanoseconds2milliseconds } from '@common/utils';
import type { TWithClassname, TWithStyle } from '@frontend/common/src/types/components';
import { getHexCssColor } from '@frontend/common/src/utils/colors';
import { tryDo } from '@frontend/common/src/utils/tryDo';
import cn from 'classnames';
import dayjs from 'dayjs';
import { isNil } from 'lodash-es';
import type { ReactElement } from 'react';

import { getPanelLabel } from '../../utils/panels';
import type { TChartProps } from '../Chart/types';
import type { TClosestPointData } from '../ChartPointsPopup/view';
import { cnChart, cnName, cnRoot } from './view.css';

type TChartPointsProps = TWithClassname &
    TWithStyle & {
        charts: TChartProps[];
        closestPoints: TClosestPointData[];
    };

export function ChartPoints(props: TChartPointsProps): ReactElement {
    return (
        <div className={cn(cnRoot, props.className)} style={props.style}>
            {props.closestPoints.map((data, index) => {
                const chart = props.charts.find((c) => c.id === data.id);

                if (isNil(chart)) {
                    return null;
                }

                const label = getPanelLabel(chart);
                const color = chart.color;
                let date = '-';
                const time = nanoseconds2milliseconds(data.point.x as unknown as Nanoseconds);
                const [err, dateStr] = tryDo(() =>
                    dayjs(time).format(EDateTimeFormats.DateTimeMilliseconds),
                );

                if (err === null && dateStr !== null) {
                    date = dateStr;
                }

                return (
                    <div key={label + index} className={cnChart}>
                        <div
                            className={cnName}
                            style={{
                                borderBottomColor: getHexCssColor(color),
                            }}
                        >
                            {label}
                        </div>
                        {' : '}
                        {data.point.y}
                        {isNaN(data.point.y) && !isNil(data.nonNaNPoint)
                            ? ` (${data.nonNaNPoint.y})`
                            : ''}
                        , {date}
                    </div>
                );
            })}
        </div>
    );
}
