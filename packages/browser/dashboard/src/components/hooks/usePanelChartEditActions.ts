import { EChartType } from '@frontend/charter/src/components/Chart/defs';
import { useModule } from '@frontend/common/src/di/react';
import { Promql } from '@frontend/common/src/utils/Promql';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { throwingError } from '@frontend/common/src/utils/throwingError';
import { generateTraceId } from '@frontend/common/src/utils/traceId';
import { firstValueFrom } from 'rxjs';

import { ModuleDashboardActions } from '../../modules/actions';
import type { TChartPanel, TChartPanelChartProps } from '../../types/panel';
import { createChartPanelChartProps } from '../../utils/panels';

export function usePanelChartEditActions(): {
    addChart: (panel: TChartPanel) => unknown;
    deleteChart: (panel: TChartPanel, id: TChartPanelChartProps['id']) => unknown;
    updateChart: (panel: TChartPanel, chart: TChartPanelChartProps) => unknown;
    sortCharts: (panel: TChartPanel, charts: TChartPanelChartProps[]) => unknown;
} {
    const { updatePanel } = useModule(ModuleDashboardActions);

    const updateChart = useFunction(async (panel: TChartPanel, chart: TChartPanelChartProps) => {
        const chartIndex = panel.charts.findIndex((c) => c.id === chart.id);

        if (chartIndex === -1) {
            throwingError('Chart do not exist');
        }

        const nextCharts = panel.charts.slice();

        nextCharts[chartIndex] = createChartPanelChartProps(chart, chartIndex);

        await firstValueFrom(
            updatePanel(generateTraceId(), {
                ...panel,
                charts: nextCharts,
            }),
        );
    });

    const addChart = useFunction(async (panel: TChartPanel) => {
        await firstValueFrom(
            updatePanel(generateTraceId(), {
                ...panel,
                charts: panel.charts.concat(
                    createChartPanelChartProps(
                        {
                            query: Promql.createQuery('indicators', {
                                name: '',
                            }),
                            type: EChartType.stairs,
                        },
                        panel.charts.length,
                    ),
                ),
            }),
        );
    });

    const deleteChart = useFunction(async (panel: TChartPanel, id: TChartPanelChartProps['id']) => {
        await firstValueFrom(
            updatePanel(generateTraceId(), {
                ...panel,
                charts: panel.charts.filter((c) => c.id !== id),
            }),
        );
    });

    const sortCharts = useFunction(async (panel: TChartPanel, charts: TChartPanelChartProps[]) => {
        await firstValueFrom(
            updatePanel(generateTraceId(), {
                ...panel,
                charts,
            }),
        );
    });

    return {
        addChart,
        deleteChart,
        updateChart,
        sortCharts,
    };
}
