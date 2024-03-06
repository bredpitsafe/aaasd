import {
    EConfigEditorLanguages,
    EConfigEditorMode,
    EConfigEditorSchema,
} from '@frontend/common/src/components/Editors/types';
import { Modal } from '@frontend/common/src/components/Modals';
import { Tabs, TabsProps } from '@frontend/common/src/components/Tabs';
import { Title } from '@frontend/common/src/components/Title';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { isEmpty } from 'lodash-es';
import { memo, ReactElement, useMemo, useState } from 'react';
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
import { Suspense } from '@frontend/common/src/components/Suspense';

import {
    cnEditor,
    cnModal,
    cnSection,
    cnTabPane,
    cnTabs,
    cnVisualEditorContainer,
} from './ModalFullDashboardEditor.css';

type TModalFullDashboardEditorProps = TTableChartsEditorHandlers & {
    title: string;
    fullDashboard: TFullDashboard;
    focusPanelId?: TPanelId;
    onClose: VoidFunction;
    onConfigApply: (source: string) => void;
    onConfigDiscard: VoidFunction;
};

export function ModalFullDashboardEditor({
    title,
    fullDashboard,
    focusPanelId,
    onConfigApply,
    onConfigDiscard,
    onChartAdd,
    onChartDelete,
    onChartChange,
    onChartsSort,
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

    const focusToLine = focusPanelId ? findLine(xml, getPanelIdMarkerComment(focusPanelId)) : 0;

    const charts = useMemo(
        () =>
            fullDashboard.dashboard.panels.filter((panel): panel is TChartPanel =>
                isChartPanel(panel),
            ),
        [fullDashboard.dashboard.panels],
    );

    const { value: schema } = useEditorCompletionSchema(EConfigEditorSchema.dashboard);

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
                        modifiedValue={xml}
                        focusToLine={focusToLine}
                        language={EConfigEditorLanguages.xml}
                        schema={schema}
                        viewMode={viewMode}
                        onChangeViewMode={setViewMode}
                        onApply={onConfigApply}
                        onDiscard={onConfigDiscard}
                        originalTitle="Original"
                        modifiedTitle="Edited"
                    />
                </Suspense>
            ),
        },
    ];

    if (!isEmpty(charts)) {
        items.push({
            key: 'Charts',
            label: `Charts`,
            className: cnTabPane,
            children: (
                <div className={cnVisualEditorContainer}>
                    {charts.map((panel, i) => (
                        <Suspense key={panel.panelId}>
                            <TableChartsEditor
                                panel={panel}
                                index={i + 1}
                                onChartAdd={onChartAdd}
                                onChartDelete={onChartDelete}
                                onChartChange={onChartChange}
                                onChartsSort={onChartsSort}
                            />
                        </Suspense>
                    ))}
                </div>
            ),
        });
    }

    return (
        <Modal className={cnModal} title={title} open={true} onCancel={onClose} footer={null}>
            <Tabs className={cnTabs} items={items} />
        </Modal>
    );
}

type TTableChartsEditorHandlers = {
    onChartAdd: (panel: TChartPanel) => unknown;
    onChartDelete: (panel: TChartPanel, id: TChartPanelChartProps['id']) => unknown;
    onChartChange: (panel: TChartPanel, chart: TChartPanelChartProps) => unknown;
    onChartsSort: (panel: TChartPanel, charts: TChartPanelChartProps[]) => unknown;
};

const TableChartsEditor = memo(
    (
        props: {
            panel: TChartPanel;
            index: number;
        } & TTableChartsEditorHandlers,
    ): ReactElement => {
        const { panel } = props;
        const { charts } = props.panel;

        const handleAdd = useFunction(() => props.onChartAdd(props.panel));
        const handleDelete = useFunction((id: TChartPanelChartProps['id']) =>
            props.onChartDelete(props.panel, id),
        );
        const handleChange = useFunction((chart: TChartPanelChartProps) =>
            props.onChartChange(props.panel, chart),
        );
        const handleSort = useFunction((charts: TChartPanelChartProps[]) =>
            props.onChartsSort(props.panel, charts),
        );

        return (
            <div className={cnSection}>
                <Title level={5}>{panel.settings.label || `Panel number ${props.index}`}</Title>
                <TableChartsEditorBase
                    charts={charts}
                    onAdd={handleAdd}
                    onDelete={handleDelete}
                    onChange={handleChange}
                    onSort={handleSort}
                    domLayout="autoHeight"
                />
            </div>
        );
    },
);

function findLine(string: string, substring: string): number {
    return (string.substring(0, string.indexOf(substring)).match(/\n/g) || []).length;
}
