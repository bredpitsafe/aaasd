import { Alert } from '@frontend/common/src/components/Alert';
import type { TWithClassname } from '@frontend/common/src/types/components';
import { useEffect, useMemo } from 'react';
import { useUnmount } from 'react-use';

import type { TFullDashboard } from '../../types/fullDashboard';
import { isStorageDashboard } from '../../types/fullDashboard/guards';
import type { TPanelGridCell, TPanelId } from '../../types/panel';
import { getDashboardItemKeyFromDashboard } from '../../utils/dashboards';
import { RestoreViewportPlugin } from '../Chart/plugins/RestoreViewport';
import { SyncPseudoMouseCoordsPlugin } from '../Chart/plugins/SyncPseudoMouseCoords';
import { SyncViewportPlugin } from '../Chart/plugins/SyncViewport';
import type { TSyncViewportSyncData } from '../Chart/plugins/SyncViewport/defs';
import { Grid } from '../DashboardGrid/Grid';
import { useFullscreenCell } from '../hooks/useFullscreenCells';
import { ConnectedPanel } from './components/ConnectedPanel';
import { cnPanel } from './view.css';

type TPanelsProps = TWithClassname & {
    syncMode?: boolean;
    syncSeedData?: TSyncViewportSyncData;
    compactMode: boolean;
    fullDashboard: TFullDashboard;
    onAddPanel?: () => void;
    onDeletePanel?: (panel: TPanelId) => void;
    onUpdateLayouts?: (layout: TPanelGridCell[]) => void;
};

export function Panels({
    className,
    fullDashboard,
    syncMode,
    syncSeedData,
    compactMode,
    onDeletePanel,
    onUpdateLayouts,
}: TPanelsProps) {
    const fullDashboardId = isStorageDashboard(fullDashboard) ? fullDashboard.item.id : undefined;
    const restoreViewportPlugin = useMemo(() => {
        return fullDashboardId
            ? new RestoreViewportPlugin(`RestoreViewportPlugin:${fullDashboardId}`)
            : undefined;
    }, [fullDashboardId]);
    const syncViewportPlugin = useMemo(() => {
        return new SyncViewportPlugin(`SyncViewportPlugin`, syncSeedData);
    }, [syncSeedData]);
    const syncPseudoMouseCoordsPlugin = useMemo(() => {
        return new SyncPseudoMouseCoordsPlugin(`SyncPseudoMouseCoordsPlugin`);
    }, []);

    useEffect(() => {
        if (syncMode) {
            syncViewportPlugin.enable();
            syncPseudoMouseCoordsPlugin.enable();
        } else {
            syncViewportPlugin.disable();
            syncPseudoMouseCoordsPlugin.disable();
        }
    }, [syncMode, syncPseudoMouseCoordsPlugin, syncViewportPlugin]);

    useUnmount(() => {
        restoreViewportPlugin?.destroy();
        syncViewportPlugin.destroy();
        syncPseudoMouseCoordsPlugin.destroy();
    });

    const plugins = useMemo(() => {
        return [restoreViewportPlugin, syncViewportPlugin, syncPseudoMouseCoordsPlugin].filter(
            (p): p is Exclude<typeof p, undefined> => p !== undefined,
        );
    }, [restoreViewportPlugin, syncPseudoMouseCoordsPlugin, syncViewportPlugin]);

    const { containerRef, fullscreenPanelId, isFullscreen, cells, onSelectFullscreenCell } =
        useFullscreenCell(fullDashboard);

    const dashboardItemKey = useMemo(
        () => getDashboardItemKeyFromDashboard(fullDashboard),
        [fullDashboard],
    );

    const dashboardGrid = useMemo(() => {
        if (fullDashboard.dashboard.panels.length === 0) {
            return <Alert style={{ margin: 24 }} message="Dashboard is empty" />;
        }

        return (
            <Grid
                colsCount={fullDashboard.dashboard.grid.colsCount}
                rowsCount={fullDashboard.dashboard.grid.rowsCount}
                margin={fullDashboard.dashboard.grid.margin}
                cells={cells.map(({ panelGridCell }) => panelGridCell)}
                onLayoutChange={onUpdateLayouts}
                isFixed={isFullscreen}
            >
                {cells.map(({ panel }) => (
                    <div key={panel.panelId}>
                        <ConnectedPanel
                            className={cnPanel}
                            compactMode={compactMode}
                            plugins={plugins}
                            dashboardItemKey={dashboardItemKey}
                            activeLayout={fullDashboard.dashboard.activeLayout}
                            panel={panel}
                            label="Test label"
                            isDraggable={!isFullscreen}
                            isFullscreen={fullscreenPanelId === panel.panelId}
                            onClose={onDeletePanel}
                            onFullscreen={onSelectFullscreenCell}
                        />
                    </div>
                ))}
            </Grid>
        );
    }, [
        fullDashboard.dashboard.panels.length,
        fullDashboard.dashboard.grid.colsCount,
        fullDashboard.dashboard.grid.rowsCount,
        fullDashboard.dashboard.grid.margin,
        fullDashboard.dashboard.activeLayout,
        cells,
        isFullscreen,
        onUpdateLayouts,
        compactMode,
        plugins,
        dashboardItemKey,
        fullscreenPanelId,
        onDeletePanel,
        onSelectFullscreenCell,
    ]);

    return (
        <div ref={containerRef} className={className}>
            {dashboardGrid}
        </div>
    );
}
