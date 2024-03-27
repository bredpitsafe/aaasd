import { createHookContextMenu } from '@frontend/common/src/components/ContextMenu';
import { ReactElement } from 'react';

import { chartContextMenuId, ChartContextMenuView, TChartContextMenuProps } from './view';

export const createChartContextMenu =
    createHookContextMenu<TChartContextMenuProps>(chartContextMenuId);

export const ChartContextMenu = (): ReactElement | null => {
    return <ChartContextMenuView />;
};
