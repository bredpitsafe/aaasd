import { TChartProps as TBaseChartProps } from '@frontend/charter/src/services/ChartsController';

import { EServerTimeUnit } from './components/Chart/def';

export type TChartProps = TBaseChartProps & {
    width: number;
    color: number | string;
    opacity: number;
};

export type TChartWithItems = TChartProps & {
    items: number[];
};

export type TChartJSON = TChartWithItems & {
    items: number[];
    timeUnit: EServerTimeUnit;
    timeIncrement: number;
};
