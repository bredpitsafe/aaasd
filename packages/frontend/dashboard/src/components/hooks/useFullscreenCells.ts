import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { isNil } from 'lodash-es';
import type { RefObject } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useEvent } from 'react-use';

import type { TFullDashboard } from '../../types/fullDashboard';
import type { TPanel, TPanelGridCell, TPanelId } from '../../types/panel';
import { DEFAULT_GRID_CELL } from '../../utils/layout';

type TUseFullscreenCellReturnType = {
    isFullscreen: boolean;
    fullscreenPanelId: TPanelId | null;
    cells: TRenderCell[];
    containerRef: RefObject<HTMLDivElement>;
    onSelectFullscreenCell: (panelId: TPanelId) => void;
};

type TRenderCell = {
    panel: TPanel;
    panelGridCell: TPanelGridCell;
};

export function useFullscreenCell({ dashboard }: TFullDashboard): TUseFullscreenCellReturnType {
    const [fullscreenPanelId, setFullscreenCellId] = useState<TPanelId | null>(null);

    const onSelectFullscreenCell = useFunction((panelId: TPanelId) => {
        setFullscreenCellId(panelId === fullscreenPanelId ? null : panelId);
    });

    // Scroll to top when selecting or changing fullscreen panel ID
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (fullscreenPanelId !== null) {
            containerRef.current?.scrollTo(0, 0);
        }
    }, [fullscreenPanelId]);

    // Listen to `Esc` to exit fullscreen mode when active
    useEvent('keyup', (e: KeyboardEvent) => {
        if (e.key === 'Escape' && fullscreenPanelId) {
            setFullscreenCellId(null);
        }
    });

    const cells = useMemo(
        () =>
            dashboard.panels.reduce((acc, panel) => {
                const isDefaultLayout = isNil(dashboard.activeLayout);
                const gridCell =
                    panel.layouts.find(({ name }) =>
                        isNil(name) ? isDefaultLayout : name === dashboard.activeLayout,
                    ) ?? DEFAULT_GRID_CELL;

                const panelGridCell: TPanelGridCell = {
                    ...gridCell,
                    panelId: panel.panelId,
                };

                if (panel.panelId !== fullscreenPanelId) {
                    acc.push({
                        panel,
                        panelGridCell,
                    });
                } else {
                    // Fullscreen must be the first one in the list
                    acc.unshift({
                        panel,
                        panelGridCell: {
                            ...panelGridCell,
                            relX: 0,
                            relY: 0,
                            relWidth: 1,
                            relHeight: 1,
                        },
                    });
                }

                return acc;
            }, [] as TRenderCell[]),
        [dashboard, fullscreenPanelId],
    );

    return {
        isFullscreen: fullscreenPanelId !== null,
        fullscreenPanelId,
        cells,
        onSelectFullscreenCell,
        containerRef,
    };
}
