import type { EVirtualViewport } from '../ChartViewport/defs';

export const DefaultColorLines = 0x000000;
export const DefaultAltColorLines = 0x0000ff;

export const LINE_WIDTH = 1;
export const NOTCH_X_WIDTH = 8;
export const NOTCH_Y_WIDTH = 20;

type TChartLevelBase = {
    yAxis: EVirtualViewport;
    color: number;
    opacity: number;
};

export type TChartLevelLine = TChartLevelBase & {
    value: number;
    width: number;
};

type TChartLevelFilledArea = TChartLevelBase & {
    top: number;
    bottom: number;
};

export type TChartLevel = TChartLevelLine | TChartLevelFilledArea;
