import { AgTableWithRouterSync } from '@frontend/common/src/components/AgTable/AgTableWithRouterSync';
import { useGridApi } from '@frontend/common/src/components/AgTable/hooks/useGridApi';
import { useSidebar } from '@frontend/common/src/components/AgTable/hooks/useSidebar';
import type { TColDef } from '@frontend/common/src/components/AgTable/types';
import { EColumnFilterType } from '@frontend/common/src/components/AgTable/types';
import { ETableIds } from '@frontend/common/src/modules/clientTableFilters/data';
import type { TWithClassname } from '@frontend/common/src/types/components';
import { TAsset, TAssetId, TAssetRecord } from '@frontend/common/src/types/domain/asset';
import {
    TPortfolioBook,
    TPortfolioBookId,
    TPortfolioBookRecord,
} from '@frontend/common/src/types/domain/portfolioTraсker';
import { ReactElement, useMemo } from 'react';

import { getColAssetId, getColAssetName, getColBookId, getColBookName } from './columns';

export type TTablePortfolioGammaItem = {
    id: string;
    assetId: TAssetId;
    bookId: TPortfolioBookId;
    values: Record<TAssetId, number>;
};

type TTablePortfolioGammaProps = TWithClassname & {
    columnsAssetIds: TAssetId[];
    assetsRecord: undefined | TAssetRecord;
    booksRecord: undefined | TPortfolioBookRecord;
    items: undefined | TTablePortfolioGammaItem[];
};

export function TablePortfolioGamma(props: TTablePortfolioGammaProps): ReactElement {
    const { gridApi, onGridReady } = useGridApi();
    const columns = useMemo<TColDef<TTablePortfolioGammaItem>[]>(
        () => getColumns(props.columnsAssetIds, props.assetsRecord, props.booksRecord),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [props.columnsAssetIds.join(''), props.assetsRecord],
    );

    useSidebar(gridApi);
    return (
        <div className={props.className}>
            <AgTableWithRouterSync<TTablePortfolioGammaItem>
                id={ETableIds.PortfolioGamma}
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
    dynamicColumns: TAssetId[],
    assetsRecord: undefined | Record<TAssetId, TAsset>,
    booksRecord: undefined | Record<TPortfolioBookId, TPortfolioBook>,
): TColDef<TTablePortfolioGammaItem>[] {
    return [
        { ...getColBookId(), hide: true, enableRowGroup: true },
        { ...getColBookName(booksRecord), hide: true, enableRowGroup: true },
        { ...getColAssetId(), hide: true, enableRowGroup: true },
        { ...getColAssetName(assetsRecord), hide: true, rowGroup: true, enableRowGroup: true },
        ...(dynamicColumns.map((assetId) => ({
            field: String(assetId),
            headerName: assetsRecord?.[assetId]?.name,
            valueGetter: (params) => params.data?.values[assetId],
            filter: EColumnFilterType.number,
            enableValue: true,
            aggFunc: 'sum',
        })) as TColDef<TTablePortfolioGammaItem>[]),
    ];
}
