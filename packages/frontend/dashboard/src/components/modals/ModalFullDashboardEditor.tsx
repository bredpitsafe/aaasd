import {
    EConfigEditorLanguages,
    EConfigEditorMode,
    EConfigEditorSchema,
} from '@frontend/common/src/components/Editors/types';
import { Modal } from '@frontend/common/src/components/Modals';
import { Suspense } from '@frontend/common/src/components/Suspense';
import type { TabsProps } from '@frontend/common/src/components/Tabs';
import { Tabs } from '@frontend/common/src/components/Tabs';
import { Title } from '@frontend/common/src/components/Title';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useSyncState } from '@frontend/common/src/utils/React/useSyncState';
import { isEmpty } from 'lodash-es';
import type { ReactElement } from 'react';
import { memo, useMemo, useState } from 'react';
import { lazily } from 'react-lazily';

import type { TFullDashboard } from '../../types/fullDashboard';
import type { TChartPanel, TChartPanelChartProps, TPanelId } from '../../types/panel';
import { isChartPanel } from '../../types/panel/guards';
import {
    convertDashboardToExportableDashboardEditor,
    convertDashboardToXml,
} from '../../utils/dashboards/converters';
import { getPanelIdMarkerComment } from '../../utils/panels';
import { useEditorCompletionSchema } from '../hooks/useEditorCompletionSchema';

const { ConfigFullEditor } = lazily(
    () => import('@frontend/common/src/components/Editors/ConfigFullEditor'),
);

const { TableChartsEditor: TableChartsEditorBase } = lazily(
    () => import('../Tables/TableChartsEditor'),
);

import type { TSeriesId } from '@frontend/charter/lib/Parts/def';
import {
    DashboardEditModalProps,
    EDashboardEditModal,
} from '@frontend/common/e2e/selectors/dashboard/dashboard.edit.modal';

import { ChartsEditorActions } from '../ChartsEditorActions/view';
import type { TUpdateChartsDto, TValueType } from '../hooks/useChartsEditorFormSaver';
import { useChartsEditorFormSaver } from '../hooks/useChartsEditorFormSaver';
import { cnEditorTable } from '../Tables/TableChartsEditor/index.css';
import {
    cnChartsEditorActions,
    cnEditor,
    cnModal,
    cnSection,
    cnTabPane,
    cnTabs,
    cnVisualEditorContainer,
} from './ModalFullDashboardEditor.css';

type TModalFullDashboardEditorProps = {
    title: string;
    fullDashboard: TFullDashboard;
    focusPanelId?: TPanelId;
    onClose: VoidFunction;
    onConfigApply: (source: string) => void;
    onChartsChange: (dto: TUpdateChartsDto) => unknown;
};

export function ModalFullDashboardEditor({
    title,
    fullDashboard,
    focusPanelId,
    onConfigApply,
    onChartsChange,
    onClose,
}: TModalFullDashboardEditorProps): ReactElement {
    const [viewMode, setViewMode] = useState<EConfigEditorMode>(EConfigEditorMode.single);

    const xml = useMemo(
        () =>
            convertDashboardToXml(
                convertDashboardToExportableDashboardEditor(fullDashboard.dashboard),
            ),
        [fullDashboard.dashboard],
    );

    const [currentXml, setCurrentXml] = useSyncState<string>(xml, [xml]);
    const discardChanges = useFunction(() => setCurrentXml(xml));

    const focusToLine = focusPanelId ? findLine(xml, getPanelIdMarkerComment(focusPanelId)) : 0;

    const panels = useMemo(
        () =>
            fullDashboard.dashboard.panels.filter((panel): panel is TChartPanel =>
                isChartPanel(panel),
            ),
        [fullDashboard.dashboard.panels],
    );

    const { value: schema } = useEditorCompletionSchema(EConfigEditorSchema.dashboard);

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
    } = useChartsEditorFormSaver(onChartsChange, panels);

    const items = useMemo<TabsProps['items']>(() => {
        const items: TabsProps['items'] = [
            {
                key: 'Config',
                label: `Config`,
                className: cnTabPane,
                children: (
                    <Suspense>
                        <ConfigFullEditor
                            className={cnEditor}
                            value={xml}
                            modifiedValue={currentXml}
                            focusToLine={focusToLine}
                            language={EConfigEditorLanguages.xml}
                            onChangeValue={setCurrentXml}
                            schema={schema}
                            viewMode={viewMode}
                            onChangeViewMode={setViewMode}
                            onApply={onConfigApply}
                            onDiscard={discardChanges}
                            originalTitle="Original"
                            modifiedTitle="Edited"
                        />
                    </Suspense>
                ),
            },
        ];

        if (!isEmpty(changedFields)) {
            items.push({
                key: 'Charts',
                label: `Charts`,
                className: cnTabPane,
                children: (
                    <div className={cnVisualEditorContainer}>
                        <div className={cnEditorTable}>
                            {panels.map((panel, index) => (
                                <Suspense key={panel.panelId}>
                                    <TableChartsEditor
                                        panel={panel}
                                        index={index + 1}
                                        formCharts={changedFields[panel.panelId]}
                                        onChartAdd={handleAddChart}
                                        onChartDelete={handleDeleteChart}
                                        onChartsChange={handleEditCharts}
                                        onChartsSort={handleSortCharts}
                                        onSetValidationError={handleSetError}
                                    />
                                </Suspense>
                            ))}
                        </div>
                        <ChartsEditorActions
                            handleApply={handleApply}
                            handleDiscard={handleDiscard}
                            className={cnChartsEditorActions}
                            isProcessing={isProcessing}
                            isDirty={isDirty}
                            isAllFieldsValid={isAllFieldsValid}
                        />
                    </div>
                ),
            });
        }

        return items;
    }, [
        currentXml,
        discardChanges,
        focusToLine,
        onConfigApply,
        schema,
        setCurrentXml,
        viewMode,
        xml,
        handleEditCharts,
        changedFields,
        handleApply,
        handleDiscard,
        isProcessing,
        isDirty,
        handleSetError,
        isAllFieldsValid,
        panels,
        handleAddChart,
        handleDeleteChart,
        handleSortCharts,
    ]);

    return (
        <Modal className={cnModal} title={title} open onCancel={onClose} footer={null}>
            <Tabs className={cnTabs} items={items} />
        </Modal>
    );
}

type TTableChartsEditorHandlers = {
    onChartAdd: (panelId: TPanelId) => void;
    onChartDelete: (panelId: TPanelId, chartId: TSeriesId) => void;
    onChartsChange: (
        panelId: TPanelId,
        chartId: TSeriesId,
        field: keyof TChartPanelChartProps,
        value: TValueType,
    ) => void;
    onChartsSort: (panelId: TPanelId, charts: TChartPanelChartProps[]) => unknown;
    onSetValidationError: (chartId: TChartPanelChartProps['id'], error: string | undefined) => void;
};

const TableChartsEditor = memo(
    (
        props: {
            panel: TChartPanel;
            index: number;
            formCharts: TChartPanelChartProps[];
        } & TTableChartsEditorHandlers,
    ): ReactElement => {
        const { panel, formCharts } = props;

        const onAddChart = useFunction(() => props.onChartAdd(panel.panelId));
        const onDeleteChart = useFunction((id: TChartPanelChartProps['id']) =>
            props.onChartDelete(panel.panelId, id),
        );

        const onSortCharts = useFunction((charts: TChartPanelChartProps[]) => {
            return props.onChartsSort(panel.panelId, charts);
        });

        const onUpdateCharts = useFunction(
            (
                chartId: TChartPanelChartProps['id'],
                field: keyof TChartPanelChartProps,
                value: TValueType,
            ) => props.onChartsChange(panel.panelId, chartId, field, value),
        );

        const handleSetError = useFunction(
            (chartId: TChartPanelChartProps['id'], validationError: string | undefined) => {
                return props.onSetValidationError(chartId, validationError);
            },
        );

        return (
            <div {...DashboardEditModalProps[EDashboardEditModal.ChartsForm]} className={cnSection}>
                <Title level={5}>{panel.settings.label || `Panel number ${props.index}`}</Title>
                <TableChartsEditorBase
                    charts={formCharts}
                    onAdd={onAddChart}
                    onDelete={onDeleteChart}
                    onChange={onUpdateCharts}
                    onSort={onSortCharts}
                    onSetError={handleSetError}
                    domLayout="autoHeight"
                />
            </div>
        );
    },
);

function findLine(string: string, substring: string): number {
    return (string.substring(0, string.indexOf(substring)).match(/\n/g) || []).length;
}
