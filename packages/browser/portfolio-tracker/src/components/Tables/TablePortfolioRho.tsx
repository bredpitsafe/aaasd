import { AgTableWithRouterSync } from '@frontend/common/src/components/AgTable/AgTableWithRouterSync';
import { numberFormatter } from '@frontend/common/src/components/AgTable/formatters/number';
import { useGridApi } from '@frontend/common/src/components/AgTable/hooks/useGridApi';
import { useSidebar } from '@frontend/common/src/components/AgTable/hooks/useSidebar';
import type { TColDef } from '@frontend/common/src/components/AgTable/types';
import { EColumnFilterType } from '@frontend/common/src/components/AgTable/types';
import { ETableIds } from '@frontend/common/src/modules/clientTableFilters/data';
import type { TWithClassname } from '@frontend/common/src/types/components';
import { TAsset, TAssetId } from '@frontend/common/src/types/domain/asset';
import {
    EGreekByPeriodName,
    GREEK_BY_PERIOD_NAMES,
} from '@frontend/common/src/types/domain/portfolioTraсker';
import { ReactElement, useMemo } from 'react';

import { getColAssetId, getColAssetName } from './columns';

export type TTablePortfolioRhoItem = {
    id: string;
    assetId: TAssetId;
    total: number;
    values: Record<EGreekByPeriodName, number>;
};

type TTablePortfolioRhoProps = TWithClassname & {
    assetsRecord: undefined | Record<TAssetId, TAsset>;
    items: undefined | TTablePortfolioRhoItem[];
};

export function TablePortfolioRho(props: TTablePortfolioRhoProps): ReactElement {
    const { gridApi, onGridReady } = useGridApi();
    const columns = useMemo<TColDef<TTablePortfolioRhoItem>[]>(
        () => getColumns(props.assetsRecord),
        [props.assetsRecord],
    );

    useSidebar(gridApi);

    return (
        <div className={props.className}>
            <AgTableWithRouterSync<TTablePortfolioRhoItem>
                id={ETableIds.PortfolioRho}
                rowKey="id"
                rowData={props.items}
                columnDefs={columns}
                asyncTransactionWaitMillis={1000}
                suppressAnimationFrame={false}
                onGridReady={onGridReady}
            />
        </div>
    );
}

function getColumns(
    assetsRecord: undefined | Record<TAssetId, TAsset>,
): TColDef<TTablePortfolioRhoItem>[] {
    return [
        { ...getColAssetId(), hide: true, enableRowGroup: true },
        { ...getColAssetName(assetsRecord), hide: true, rowGroup: true, enableRowGroup: true },
        ...(GREEK_BY_PERIOD_NAMES.map((name) => ({
            colId: name,
            headerName: name,
            filter: EColumnFilterType.number,
            valueGetter: (params) => params.data?.values[name],
            valueFormatter: numberFormatter('%.4f'),
            enableValue: true,
            aggFunc: 'sum',
        })) as TColDef<TTablePortfolioRhoItem>[]),
        {
            field: 'total',
            headerName: 'Total',
            filter: EColumnFilterType.number,
            valueFormatter: numberFormatter('%.4f'),
        },
    ];
}
