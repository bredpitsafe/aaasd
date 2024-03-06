import { LoadingOverlay } from '@frontend/common/src/components/overlays/LoadingOverlay';
import { EGrpcErrorCode } from '@frontend/common/src/types/GrpcError';
import { TComponentValueDescriptor } from '@frontend/common/src/utils/React/useValueDescriptorObservable';
import { EValueDescriptorPendingState } from '@frontend/common/src/utils/ValueDescriptor/types';
import { isEmptyValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils';
import { isNil } from 'lodash-es';
import { useMemo } from 'react';

import type { TFullDashboard } from '../../types/fullDashboard';
import type { TPanelGridCell, TPanelId } from '../../types/panel';
import { WidgetNav } from '../../widgets/Nav/WidgetNav';
import type { TSyncViewportSyncData } from '../Chart/plugins/SyncViewport/defs';
import { Panels } from '../Panels/view';
import { ConnectedDragAndDrop } from './components/ConnectedDragAndDrop';
import { DashboardError } from './components/DashboardError';
import { DashboardInfo } from './components/DashboardInfo';
import {
    cnDashboardContainer,
    cnDashboardDragAndDrop,
    cnDashboardPanels,
    cnNavigationPanel,
} from './styles.css';

export function DashboardView({
    dashboardDescriptor,
    syncMode,
    syncSeedData,
    compactMode,
    onDeletePanel,
    onUpdateLayouts,
}: {
    showDashboardSidebar: boolean;
    dashboardDescriptor: TComponentValueDescriptor<TFullDashboard>;
    syncMode: boolean;
    syncSeedData?: TSyncViewportSyncData;
    compactMode: boolean;
    onDeletePanel?: (panel: TPanelId) => Promise<void>;
    onUpdateLayouts?: (layouts: TPanelGridCell[]) => Promise<void>;
}) {
    const dashboardPlaceHolder = useMemo(() => {
        const { value, fail, meta } = dashboardDescriptor;

        if (!isNil(value)) {
            return (
                <Panels
                    className={cnDashboardPanels}
                    syncMode={syncMode}
                    syncSeedData={syncSeedData}
                    compactMode={compactMode}
                    fullDashboard={value}
                    onDeletePanel={onDeletePanel}
                    onUpdateLayouts={onUpdateLayouts}
                />
            );
        }

        switch (true) {
            case isEmptyValueDescriptor(dashboardDescriptor):
                return null;
            case meta?.pendingState === EValueDescriptorPendingState.WaitingArguments:
                return <DashboardInfo title="Select dashboard" />;
            case meta?.pendingState === EValueDescriptorPendingState.Loading:
                return <LoadingOverlay text="Loading dashboard..." />;
            case fail?.code === EGrpcErrorCode.NOT_FOUND:
                return <DashboardError title="Not Found" />;
            case fail?.code === EGrpcErrorCode.PERMISSION_DENIED:
                return <DashboardError title="Access Denied" description={fail?.meta?.message} />;
            case fail?.code === EGrpcErrorCode.UNKNOWN:
            default:
                return <DashboardError title="Unknown error" description={fail?.meta?.message} />;
        }
    }, [compactMode, dashboardDescriptor, onDeletePanel, onUpdateLayouts, syncMode, syncSeedData]);

    return (
        <div className={cnDashboardContainer}>
            <WidgetNav className={cnNavigationPanel} />

            {dashboardPlaceHolder}

            <ConnectedDragAndDrop className={cnDashboardDragAndDrop} />
        </div>
    );
}
