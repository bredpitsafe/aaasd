import type { GridApi, IRowNode } from '@frontend/ag-grid';
import type { TCoinId } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { isNil, omit } from 'lodash-es';
import { useEffect } from 'react';

export function useGridCoinFilter<RecordType extends { coin: unknown }>(
    gridApi: GridApi<RecordType> | undefined,
    coin: TCoinId | undefined,
): {
    isExternalFilterPresent: () => boolean;
    doesExternalFilterPass: (node: IRowNode<RecordType>) => boolean;
} {
    const isExternalFilterPresent = useFunction(() => !isNil(coin));

    const doesExternalFilterPass = useFunction(
        (node: IRowNode<RecordType>) => isNil(coin) || node.data?.coin === coin,
    );

    useEffect(() => {
        if (isNil(gridApi)) {
            return;
        }

        if (!isNil(coin)) {
            const model = gridApi.getFilterModel();

            if (!isNil(model) && !isNil(model['coin'])) {
                gridApi.setFilterModel(omit(model, 'coin'));
            }
        }

        gridApi.onFilterChanged();
    }, [gridApi, coin]);

    return { isExternalFilterPresent, doesExternalFilterPass };
}
