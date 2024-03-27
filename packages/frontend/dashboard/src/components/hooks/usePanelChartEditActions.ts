import { EChartType } from '@frontend/charter/src/components/Chart/defs';
import { useModule } from '@frontend/common/src/di/react';
import { Promql } from '@frontend/common/src/utils/Promql';
import { useNotifiedObservableFunction } from '@frontend/common/src/utils/React/useObservableFunction.ts';
import { throwingError } from '@frontend/common/src/utils/throwingError';
import { generateTraceId } from '@frontend/common/src/utils/traceId';

import { ModuleUpdatePanel } from '../../modules/actions/dashboards/updatePanel.ts';
import type { TChartPanel, TChartPanelChartProps } from '../../types/panel';
import { createChartPanelChartProps } from '../../utils/panels';

export function usePanelChartEditActions(): {
    addChart: (panel: TChartPanel) => unknown;
    deleteChart: (panel: TChartPanel, id: TChartPanelChartProps['id']) => unknown;
    updateChart: (panel: TChartPanel, chart: TChartPanelChartProps) => unknown;
    sortCharts: (panel: TChartPanel, charts: TChartPanelChartProps[]) => unknown;
} {
    const updatePanel = useModule(ModuleUpdatePanel);

    const [updateChart] = useNotifiedObservableFunction(
        (panel: TChartPanel, chart: TChartPanelChartProps) => {
            const chartIndex = panel.charts.findIndex((c) => c.id === chart.id);

            if (chartIndex === -1) {
                throwingError('Chart do not exist');
            }

            const nextCharts = panel.charts.slice();

            nextCharts[chartIndex] = createChartPanelChartProps(chart, chartIndex);

            return updatePanel(
                {
                    ...panel,
                    charts: nextCharts,
                },
                { traceId: generateTraceId() },
            );
        },
    );

    const [addChart] = useNotifiedObservableFunction((panel: TChartPanel) => {
        return updatePanel(
            {
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
            },
            { traceId: generateTraceId() },
        );
    });

    const [deleteChart] = useNotifiedObservableFunction(
        (panel: TChartPanel, id: TChartPanelChartProps['id']) => {
            return updatePanel(
                {
                    ...panel,
                    charts: panel.charts.filter((c) => c.id !== id),
                },
                { traceId: generateTraceId() },
            );
        },
    );

    const [sortCharts] = useNotifiedObservableFunction(
        (panel: TChartPanel, charts: TChartPanelChartProps[]) => {
            return updatePanel(
                {
                    ...panel,
                    charts,
                },
                { traceId: generateTraceId() },
            );
        },
    );

    return {
        addChart,
        deleteChart,
        updateChart,
        sortCharts,
    };
}
