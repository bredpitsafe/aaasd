import type { TPart } from '../../../lib/Parts/def';
import type { EVirtualViewport } from '../../components/ChartViewport/defs';

export type TViewportData = {
    parts: TPart[];
    groupedParts: TPart[][];
    yAxis: EVirtualViewport;
};

export type TAllViewportData = {
    parts: TPart[];
    viewports: TViewportData[];
};

export type TPartialMinMax = [undefined | number, undefined | number];
export type TMinMax = [number, number];
