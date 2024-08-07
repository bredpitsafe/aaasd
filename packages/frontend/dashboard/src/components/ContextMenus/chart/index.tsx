import { createHookContextMenu } from '@frontend/common/src/components/ContextMenu';
import type { ReactElement } from 'react';

import type { TChartContextMenuProps } from './view';
import { chartContextMenuId, ChartContextMenuView } from './view';

export const createChartContextMenu =
    createHookContextMenu<TChartContextMenuProps>(chartContextMenuId);

export const ChartContextMenu = (): ReactElement | null => {
    return <ChartContextMenuView />;
};
