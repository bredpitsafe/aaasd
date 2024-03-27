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
    onDeletePanel?: (panel: TPanelId) => unknown;
    onUpdateLayouts?: (layouts: TPanelGridCell[]) => unknown;
}) {
    const { fail, meta, value } = dashboardDescriptor;

    const child = useMemo(() => {
        switch (true) {
            case fail?.code === EGrpcErrorCode.NOT_FOUND:
                return <DashboardError title="Not Found" />;
            case fail?.code === EGrpcErrorCode.PERMISSION_DENIED:
                return <DashboardError title="Access Denied" description={fail?.meta?.message} />;
            case fail?.code === EGrpcErrorCode.UNKNOWN:
            case !isNil(fail):
                return <DashboardError title="Unknown error" description={fail?.meta?.message} />;
            case !isNil(value):
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
            case isEmptyValueDescriptor(dashboardDescriptor):
                return null;
            case meta?.pendingState === EValueDescriptorPendingState.WaitingArguments:
                return <DashboardInfo title="Select dashboard" />;
            case meta?.pendingState === EValueDescriptorPendingState.Loading:
                return <LoadingOverlay text="Loading dashboard..." />;
            default:
                return null;
        }
    }, [
        compactMode,
        value,
        dashboardDescriptor,
        fail,
        meta,
        onDeletePanel,
        onUpdateLayouts,
        syncMode,
        syncSeedData,
    ]);

    return (
        <div className={cnDashboardContainer}>
            <WidgetNav className={cnNavigationPanel} />

            {child}

            <ConnectedDragAndDrop className={cnDashboardDragAndDrop} />
        </div>
    );
}
