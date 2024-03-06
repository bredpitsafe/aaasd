import { GetMainMenuItems } from 'ag-grid-community/dist/lib/entities/gridOptions';

import { useFunction } from '../../../utils/React/useFunction';
import { applyAutoSize } from '../utils';

export function useGetMainMenuItems(): GetMainMenuItems {
    return useFunction((params) => {
        return params.defaultItems.map((v) => {
            if (v === 'autoSizeAll') {
                return {
                    name: `Autosize All Columns`,
                    action: applyAutoSize.bind(null, params.columnApi),
                };
            }
            if (v === 'resetColumns') {
                return {
                    name: `Reset Columns`,
                    action: () => {
                        params.columnApi.resetColumnState();
                        applyAutoSize(params.columnApi);
                    },
                };
            }

            return v;
        });
    });
}
