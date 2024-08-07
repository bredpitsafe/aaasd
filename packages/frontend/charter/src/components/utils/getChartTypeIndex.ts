import { EChartType } from '../Chart/defs';

export function getChartTypeIndex(type: EChartType): number {
    switch (type) {
        case EChartType.points:
            return 0;
        case EChartType.lines:
            return 1;
        case EChartType.stairs:
            return 2;
        case EChartType.area:
            return 3;
        case EChartType.dots:
            return 4;
        default:
            return 0;
    }
}
