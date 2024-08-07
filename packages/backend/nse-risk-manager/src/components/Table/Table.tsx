import type { CellEditRequestEvent } from '@frontend/ag-grid';
import { AgTable } from '@frontend/common/src/components/AgTable/AgTable';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { isNil } from 'lodash-es';
import { useMemo } from 'react';

import type { TRiskSettingsGroup } from '../../def';
import { DEFAULT_COL_DEF, useColumns } from './columns';
import type { TTableData } from './def';

type TTableProps<T> = {
    fields: (keyof T)[];
    data: T | undefined;
    onEditField: (field: keyof T, value: T[keyof T]) => void;
};

export const Table = (props: TTableProps<TRiskSettingsGroup>) => {
    const columns = useColumns<TRiskSettingsGroup>();

    const data: TTableData<TRiskSettingsGroup>[] | undefined = useMemo(() => {
        if (isNil(props.data)) {
            return;
        }

        return Object.entries(props.data).map(([key, value]) => ({
            key: key as keyof TRiskSettingsGroup,
            value,
        }));
    }, [props.data]);

    const cbCellEditRequest = useFunction(
        (event: CellEditRequestEvent<TTableData<TRiskSettingsGroup>>): void => {
            return props.onEditField(event.data.key, event.newValue);
        },
    );

    return (
        <AgTable
            rowKey="key"
            defaultColDef={DEFAULT_COL_DEF}
            columnDefs={columns}
            rowData={data}
            onCellEditRequest={cbCellEditRequest}
            readOnlyEdit
            suppressRowVirtualisation
            suppressColumnVirtualisation
            domLayout="autoHeight"
        />
    );
};
