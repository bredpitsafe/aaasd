import { DragAndDrop } from '@frontend/common/src/components/DragAndDrop';
import { Title } from '@frontend/common/src/components/Title';
import type { TDragAction } from '@frontend/common/src/hooks/useDragAndDrop/def';
import { ETDragonActionType } from '@frontend/common/src/hooks/useDragAndDrop/def';
import type { TWithClassname } from '@frontend/common/src/types/components';
import { getTextFromBlob } from '@frontend/common/src/utils/fileSaver';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { isSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils';
import { isNil } from 'lodash-es';
import type { ReactElement } from 'react';
import { useMemo } from 'react';

import { isStorageDashboard } from '../../../types/fullDashboard/guards';
import type { TPanelXMLConfigWithoutLayout } from '../../../types/panel';
import { useImportDashboardFile } from '../../hooks/useImportDashboardFile';
import { useImportPanel } from '../../hooks/useImportPanel';
import { useConnectedDashboard } from '../hooks/useConnectedDashboard';

export function ConnectedDragAndDrop(props: TWithClassname): ReactElement {
    const importDashboardFile = useImportDashboardFile();
    const importPanel = useImportPanel();

    const dashboardDescriptor = useConnectedDashboard();
    const fullDashboard = useMemo(
        () =>
            !isNil(dashboardDescriptor) && isSyncedValueDescriptor(dashboardDescriptor)
                ? dashboardDescriptor.value
                : undefined,
        [dashboardDescriptor],
    );

    const filterDrop = useFunction((event: DragEvent, action?: TDragAction): boolean => {
        switch (action?.type) {
            case ETDragonActionType.ClonePanel:
                if (isNil(fullDashboard)) {
                    return false;
                }

                return (
                    isNil(action.payload.from) ||
                    !isStorageDashboard(fullDashboard) ||
                    action.payload.from.dashboardId !== fullDashboard.item.id
                );
            default:
                return true;
        }
    });
    const handleDrop = useFunction(async (action: TDragAction): Promise<boolean> => {
        if (action.type === ETDragonActionType.Native && action.payload.kind === 'file') {
            const file = action.payload.getAsFile();

            if (isNil(file)) {
                return false;
            }

            try {
                const config = await getTextFromBlob(file);
                await importDashboardFile(config);
                return true;
            } catch {
                return false;
            }
        }

        if (action.type === ETDragonActionType.ClonePanel) {
            await importPanel(
                action.payload.panelXML as TPanelXMLConfigWithoutLayout,
                action.payload.panelRelWidth,
                action.payload.panelRelHeight,
            );
        }

        return false;
    });

    return (
        <DragAndDrop className={props.className} onDrop={handleDrop} filterDrop={filterDrop}>
            <Title level={2}>Drop Dashboard config here</Title>
        </DragAndDrop>
    );
}
