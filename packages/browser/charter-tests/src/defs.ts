import { TChartProps } from '@frontend/charter/src/services/ChartsController';
import { TPackedRGBA } from '@frontend/common/src/utils/packRGBA';

export type TTestChartProps = TChartProps & {
    width?: number;
    color?: number;
    opacity?: number;
    getRGBA?: (index: number) => TPackedRGBA;
    getWidth?: (index: number) => number;
};
