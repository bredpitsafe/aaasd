import { generateTraceId } from '@common/utils';
import type { IPlugin } from '@frontend/charter/src/plugins/Plugin';
import { useModule } from '@frontend/common/src/di/react';
import { createDragAction } from '@frontend/common/src/hooks/useDragAndDrop/actions';
import { ETDragonActionType } from '@frontend/common/src/hooks/useDragAndDrop/def';
import { ModuleModals } from '@frontend/common/src/lib/modals';
import type { TWithClassname } from '@frontend/common/src/types/components';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useNotifiedObservableFunction } from '@frontend/common/src/utils/React/useObservableFunction.ts';
import { isNil } from 'lodash-es';
import type { ReactElement } from 'react';
import { useMemo } from 'react';

import { ModuleOpenModalFullDashboardEditor } from '../../../modules/actions/modals/openModalFullDashboardConfig.tsx';
import type { TDashboardItemKey } from '../../../types/fullDashboard';
import { isStorageDashboardItemKey } from '../../../types/fullDashboard/guards';
import type { TPanel, TPanelId } from '../../../types/panel';
import { DEFAULT_GRID_CELL } from '../../../utils/layout';
import { createPanelId } from '../../../utils/panels';
import {
    convertPanelToEditConfigPanelXml,
    convertPanelToExportablePanelEditor,
} from '../../../utils/panels/converters';
import type { TPanelTab, TPanelViewProps } from '../../Panel/view';
import { PanelView } from '../../Panel/view';
import { usePanelCollapsedSettings } from '../../Settings/hooks/usePanelCollapsedSettings';
import { usePanelDefaultCollapseSettings } from '../../Settings/hooks/usePanelDefaultCollapseSettings';
import { usePanelDeleteConfirmSettings } from '../../Settings/hooks/usePanelDeleteConfirmSettings';
import { usePanelNameInCompactMode } from '../../Settings/hooks/usePanelNameInCompactMode';
import { useConnectedMainTab } from '../hooks/useConnectedMainTab';
import { useConnectedPanelTabConfig } from '../hooks/useConnectedPanelTabConfig';
import { useConnectedPanelTabForm } from '../hooks/useConnectedPanelTabForm';

type TConnectedPanelProps = TWithClassname &
    Omit<
        TPanelViewProps,
        'panelId' | 'tabs' | 'onClose' | 'onEdit' | 'onDragStart' | 'onFullscreen'
    > & {
        panel: TPanel;
        activeLayout: string | undefined;
        dashboardItemKey: TDashboardItemKey;
        plugins: IPlugin[];
        onClose?: (panelId: TPanelId) => void;
        onFullscreen?: (panelId: TPanelId) => void;
    };

export function ConnectedPanel({
    panel,
    activeLayout,
    dashboardItemKey,
    ...props
}: TConnectedPanelProps): ReactElement | null {
    const { confirm } = useModule(ModuleModals);
    const openModalFullDashboardEditor = useModule(ModuleOpenModalFullDashboardEditor);

    const [showLabelsInCompactMode] = usePanelNameInCompactMode();

    const label = panel?.settings.label;

    const [isLegendCollapsed, handleLegendCollapse] = usePanelCollapsedSettings(panel.panelId);
    const [isDefaultCollapsed] = usePanelDefaultCollapseSettings();
    const [confirmPanelDelete] = usePanelDeleteConfirmSettings();

    const handleFullscreen = useFunction(() => {
        props.onFullscreen?.(panel.panelId);
    });

    const handleClose: VoidFunction = useFunction(async () => {
        const res = confirmPanelDelete
            ? await confirm(`Do you want to delete panel${label ? ` '${label}'` : ''}?`)
            : true;
        if (res) {
            props.onClose?.(panel.panelId);
        }
    });
    const [handleEdit] = useNotifiedObservableFunction(() => {
        return openModalFullDashboardEditor(
            {
                dashboardItemKey: dashboardItemKey,
                focusPanelId: panel.panelId,
            },
            {
                traceId: generateTraceId(),
            },
        );
    });

    const handleDragStart = useMemo(() => {
        if (isNil(panel)) {
            return undefined;
        }

        const from = !isStorageDashboardItemKey(dashboardItemKey)
            ? undefined
            : {
                  dashboardId: dashboardItemKey.storageId,
                  panelId: panel.panelId,
              };

        const layout = panel.layouts.find(({ name }) => name === activeLayout) ?? DEFAULT_GRID_CELL;

        return () => ({
            action: createDragAction(ETDragonActionType.ClonePanel, {
                from,
                panelXML: convertPanelToEditConfigPanelXml(
                    convertPanelToExportablePanelEditor({
                        ...panel,
                        panelId: createPanelId(),
                        layouts: [],
                    }),
                ),
                panelRelWidth: layout.relWidth,
                panelRelHeight: layout.relHeight,
            }),
            onSuccess: () => handleClose(),
        });
    }, [panel, dashboardItemKey, activeLayout, handleClose]);

    return (
        <FulledPanelView
            {...props}
            key={panel.panelId}
            panel={panel}
            label={label}
            showLabelsInCompactMode={showLabelsInCompactMode}
            isLegendCollapsed={isLegendCollapsed}
            onToggleLegendCollapse={isDefaultCollapsed ? undefined : handleLegendCollapse}
            onEdit={handleEdit}
            onClose={handleClose}
            onDragStart={handleDragStart}
            onFullscreen={handleFullscreen}
        />
    );
}

function FulledPanelView({
    panel,
    plugins,
    ...props
}: { panel: TPanel; plugins: IPlugin[] } & Pick<
    TPanelViewProps,
    | 'key'
    | 'className'
    | 'compactMode'
    | 'label'
    | 'showLabelsInCompactMode'
    | 'isLegendCollapsed'
    | 'onToggleLegendCollapse'
    | 'onEdit'
    | 'onClose'
    | 'onDragStart'
    | 'onFullscreen'
>): ReactElement {
    const mainTab = useConnectedMainTab(panel, plugins);
    const configTab = useConnectedPanelTabConfig(panel);
    const formTab = useConnectedPanelTabForm(panel);
    const tabs = useMemo(
        () => [mainTab, configTab, formTab].filter((v): v is TPanelTab => v !== undefined),
        [mainTab, configTab, formTab],
    );

    return <PanelView panel={panel} {...props} tabs={tabs} />;
}
