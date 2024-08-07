import { generateTraceId } from '@common/utils';
import { EChartType } from '@frontend/charter/src/components/Chart/defs.ts';
import { useModule } from '@frontend/common/src/di/react';
import { Promql } from '@frontend/common/src/utils/Promql.ts';
import { useNotifiedObservableFunction } from '@frontend/common/src/utils/React/useObservableFunction.ts';
import { throwingError } from '@frontend/common/src/utils/throwingError';

import { ModuleUpdatePanel } from '../../modules/actions/dashboards/updatePanel.ts';
import { ModuleUpdatePanels } from '../../modules/actions/dashboards/updatePanels.ts';
import type { TChartPanel, TChartPanelChartProps } from '../../types/panel';
import { createChartPanelChartProps } from '../../utils/panels';
import type { TUpdateChartsDto } from './useChartsEditorFormSaver.tsx';

export function usePanelChartEditActions(): {
    addChart: (panel: TChartPanel) => unknown;
    deleteChart: (panel: TChartPanel, id: TChartPanelChartProps['id']) => unknown;
    updateChart: (panel: TChartPanel, chart: TChartPanelChartProps) => unknown;
    updateCharts: (dto: TUpdateChartsDto) => unknown;
    sortCharts: (panel: TChartPanel, charts: TChartPanelChartProps[]) => unknown;
} {
    const updatePanel = useModule(ModuleUpdatePanel);
    const updatePanels = useModule(ModuleUpdatePanels);

    const [updateCharts] = useNotifiedObservableFunction((dto: TUpdateChartsDto) => {
        const updatedPanels = Object.entries(dto).reduce<Record<string, TChartPanel>>(
            (acc, [panelId, panelData]) => {
                const updatedCharts = panelData.charts.map((chart, index) =>
                    createChartPanelChartProps(chart, index),
                );

                acc[panelId] = { ...panelData, charts: updatedCharts };
                return acc;
            },
            {},
        );

        return updatePanels(updatedPanels, { traceId: generateTraceId() });
    });

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
        updateCharts,
        sortCharts,
    };
}
