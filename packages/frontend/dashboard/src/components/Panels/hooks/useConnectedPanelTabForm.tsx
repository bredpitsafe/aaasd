import { OrderedListOutlined } from '@ant-design/icons';
import { Suspense } from '@frontend/common/src/components/Suspense';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { isNil } from 'lodash-es';
import { lazily } from 'react-lazily';

import type { TChartPanel, TChartPanelChartProps, TPanel } from '../../../types/panel';
import { isChartPanel } from '../../../types/panel/guards';
import { ChartsEditorActions } from '../../ChartsEditorActions/view';
import type { TValueType } from '../../hooks/useChartsEditorFormSaver';
import { useChartsEditorFormSaver } from '../../hooks/useChartsEditorFormSaver';
import { usePanelChartEditActions } from '../../hooks/usePanelChartEditActions';
import { cnVisualEditorContainer } from '../../modals/ModalFullDashboardEditor.css';
import type { TPanelTab } from '../../Panel/view';
import { cnEditorTable } from '../../Tables/TableChartsEditor/index.css';

const { TableChartsEditor } = lazily(() => import('../../Tables/TableChartsEditor'));

export function useConnectedPanelTabForm(panel: TPanel): undefined | TPanelTab {
    return useConnectedChartPanelTabForm(isChartPanel(panel) ? panel : undefined);
}

function useConnectedChartPanelTabForm(panel: undefined | TChartPanel): TPanelTab | undefined {
    const isChartPanel = !isNil(panel);
    const { updateCharts } = usePanelChartEditActions();

    const {
        handleEditCharts,
        handleApply,
        handleDiscard,
        isProcessing,
        isDirty,
        handleSetError,
        isAllFieldsValid,
        changedFields,
        handleSortCharts,
        handleDeleteChart,
        handleAddChart,
    } = useChartsEditorFormSaver(updateCharts, isChartPanel ? [panel] : undefined);

    const onAddChart = useFunction(() =>
        isChartPanel ? handleAddChart(panel.panelId) : undefined,
    );
    const onDeleteChart = useFunction((id: TChartPanelChartProps['id']) =>
        isChartPanel ? handleDeleteChart(panel.panelId, id) : undefined,
    );

    const onSortCharts = useFunction((charts: TChartPanelChartProps[]) => {
        return isChartPanel ? handleSortCharts(panel.panelId, charts) : undefined;
    });

    const onUpdateCharts = useFunction(
        (
            chartId: TChartPanelChartProps['id'],
            field: keyof TChartPanelChartProps,
            value: TValueType,
        ) => (isChartPanel ? handleEditCharts(panel.panelId, chartId, field, value) : undefined),
    );

    const onSetValidationError = useFunction(
        (chartId: TChartPanelChartProps['id'], validationError: string | undefined) => {
            if (isChartPanel) {
                return handleSetError(chartId, validationError);
            }
            return undefined;
        },
    );

    if (isNil(panel) || !isChartPanel) {
        return undefined;
    }

    return {
        name: 'Charts',
        icon: <OrderedListOutlined />,
        child: (
            <Suspense>
                <div className={cnVisualEditorContainer}>
                    <TableChartsEditor
                        className={cnEditorTable}
                        charts={changedFields[panel.panelId]}
                        onAdd={onAddChart}
                        onDelete={onDeleteChart}
                        onChange={onUpdateCharts}
                        onSort={onSortCharts}
                        onSetError={onSetValidationError}
                    />
                    <ChartsEditorActions
                        handleApply={handleApply}
                        handleDiscard={handleDiscard}
                        isProcessing={isProcessing}
                        isDirty={isDirty}
                        isAllFieldsValid={isAllFieldsValid}
                    />
                </div>
            </Suspense>
        ),
    };
}
