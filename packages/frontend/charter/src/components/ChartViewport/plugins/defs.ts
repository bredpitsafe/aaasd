import type { IChartViewport } from '../defs';

export interface IPlugin {
    connect(viewport: IChartViewport): void;
    destroy(): void;
}
