import type { TSeriesId } from '../../../lib/Parts/def';
import type { IContext } from '../../types';
import type { EVirtualViewport } from '../ChartViewport/defs';

export enum EChartType {
    lines = 'lines',
    stairs = 'stairs',
    points = 'points',
    area = 'area',
    dots = 'dots',
}

export type TChartProps = {
    ctx: IContext;

    id: TSeriesId;
    type: EChartType;
    striving?: boolean;
    fixedZoom?: number;
    yAxis: EVirtualViewport;
    styleConverter?: string;
    styleIndicator?: string;
};
