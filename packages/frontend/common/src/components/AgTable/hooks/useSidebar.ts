import type { GridApi, SideBarDef } from '@frontend/ag-grid';
import { useEffect } from 'react';

const DEFAULT_SIDE_BAR: SideBarDef = {
    position: 'right',
    hiddenByDefault: true,
    defaultToolPanel: 'columns',
    toolPanels: ['columns', 'filters'],
};

export function useSidebar(gridApi?: GridApi, options: SideBarDef = DEFAULT_SIDE_BAR) {
    useEffect(() => {
        gridApi?.setSideBar(options);
        // one more bug in ag-grid
        gridApi?.setSideBarVisible(true);
    }, [gridApi, options]);
}
