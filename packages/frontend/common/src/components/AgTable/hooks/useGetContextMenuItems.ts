import type { GetContextMenuItemsParams, GridOptions, MenuItemDef } from '@frontend/ag-grid';
import { isEmpty, isNil } from 'lodash-es';

import { clipboardWrite } from '../../../utils/clipboard';
import { EMPTY_ARRAY } from '../../../utils/const';
import { useFunction } from '../../../utils/React/useFunction';
import { getCellValue } from '../utils';

type TUseGetContextMenuItemsParams<T> = {
    getContextMenuItems: GridOptions<T>['getContextMenuItems'];
    onCopyTableState?: VoidFunction;
    includeDefaultContextMenuItems?: boolean;
};

export function useGetContextMenuItems<T>(
    params: TUseGetContextMenuItemsParams<T>,
): GridOptions<T>['getContextMenuItems'] {
    const { getContextMenuItems, onCopyTableState, includeDefaultContextMenuItems = true } = params;
    return useFunction((params) => {
        const customItems = getContextMenuItems?.(params);
        if (!includeDefaultContextMenuItems) {
            return customItems ?? EMPTY_ARRAY;
        }
        const defaultItems = getDefaultContextMenuItems(params, onCopyTableState);
        return customItems ? [...customItems, ...defaultItems] : defaultItems;
    });
}

export enum EDefaultContextMenuItemName {
    Copy = 'copy',
    CopyWithHeaders = 'copyWithHeaders',
    Separator = 'separator',
    Export = 'export',
    CopyWithGroupHeaders = 'copyWithGroupHeaders',
}

function getDefaultContextMenuItems<T>(
    params: GetContextMenuItemsParams<T>,
    onCopyTableState: undefined | VoidFunction,
): (EDefaultContextMenuItemName | MenuItemDef)[] {
    const cellData = getCellValue(params);

    const baseActions = [
        EDefaultContextMenuItemName.Copy,
        EDefaultContextMenuItemName.CopyWithHeaders,
        {
            name: 'Copy Cell',
            action: () => {
                void clipboardWrite(cellData!);
            },
            icon: `<span class="ag-icon ag-icon-copy"></span>`,
            shortcut: 'Ctrl+Shift+C',
            disabled: isEmpty(cellData),
        },
        EDefaultContextMenuItemName.Separator,
        EDefaultContextMenuItemName.Export,
        EDefaultContextMenuItemName.Separator,
    ];

    return isNil(onCopyTableState)
        ? baseActions
        : [
              ...baseActions,
              {
                  name: 'Copy Table State',
                  action: onCopyTableState,
                  icon: `<span class="ag-icon ag-icon-copy"></span>`,
              },
          ];
}
