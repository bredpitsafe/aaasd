import { NumberEditor } from '@frontend/common/src/components/AgTable/editors/NumericEditor';
import { maxPrecisionNumberFormatter } from '@frontend/common/src/components/AgTable/formatters/number';
import { TColDef } from '@frontend/common/src/components/AgTable/types';
import { isNumber, startCase } from 'lodash-es';
import { useMemo } from 'react';

import { TTableData } from './def';
import { cnEditableCell } from './Table.css';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const DEFAULT_COL_DEF: TColDef<TTableData<any>> = {
    suppressMenu: true,
};

export const useColumns = <T,>(): TColDef<TTableData<T>>[] => {
    return useMemo(() => {
        return [
            {
                field: 'key',
                headerName: 'Parameter',
                sort: 'asc',
                valueFormatter: (params) => startCase(params.value),
            },
            {
                field: 'value',
                editable: true,
                cellDataType: 'text',
                cellClass: () => cnEditableCell,
                valueFormatter: (params) => {
                    if (isNumber(params.value)) {
                        const formatter = maxPrecisionNumberFormatter();
                        return formatter(params);
                    }
                    return params.value;
                },
                cellEditorSelector: (params) => {
                    return {
                        component: isNumber(params.value) ? NumberEditor : 'agTextCellEditor',
                    };
                },
                singleClickEdit: true,
            },
        ];
    }, []);
};
