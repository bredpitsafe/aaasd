import { AgTableWithRouterSync } from '@frontend/common/src/components/AgTable/AgTableWithRouterSync';
import { numberFormatter } from '@frontend/common/src/components/AgTable/formatters/number';
import { useGridApi } from '@frontend/common/src/components/AgTable/hooks/useGridApi';
import { useSidebar } from '@frontend/common/src/components/AgTable/hooks/useSidebar';
import type { TColDef } from '@frontend/common/src/components/AgTable/types';
import { EColumnFilterType } from '@frontend/common/src/components/AgTable/types';
import { ETableIds } from '@frontend/common/src/modules/clientTableFilters/data';
import type { TWithClassname } from '@frontend/common/src/types/components';
import { TAssetRecord } from '@frontend/common/src/types/domain/asset';
import {
    TPortfolioBookRecord,
    TPortfolioRisks,
} from '@frontend/common/src/types/domain/portfolioTraсker';
import { isNil } from 'lodash-es';
import { ReactElement, useMemo } from 'react';

import { getColAll, getColAssetId, getColAssetName, getColBookId, getColBookName } from './columns';

type TTablePortfolioRisksItem = TPortfolioRisks;
type TInternalItem = TTablePortfolioRisksItem & {
    all: string;
};

type TTablePortfolioRisksProps = TWithClassname & {
    items: undefined | TTablePortfolioRisksItem[];
    booksRecord: undefined | TPortfolioBookRecord;
    assetsRecord: undefined | TAssetRecord;
};

export function TablePortfolioRisks(props: TTablePortfolioRisksProps): ReactElement {
    const { gridApi, onGridReady } = useGridApi();

    const columns = useMemo(
        () => getColumns(props.booksRecord, props.assetsRecord),
        [props.assetsRecord, props.booksRecord],
    );
    const items = useMemo(
        () =>
            props.items?.map((item): TInternalItem => {
                return { ...item, all: 'All' };
            }),
        [props.items],
    );

    useSidebar(gridApi);

    return (
        <div className={props.className}>
            <AgTableWithRouterSync<TInternalItem>
                id={ETableIds.PortfolioRisks}
                rowKey="id"
                rowData={items}
                columnDefs={columns}
                asyncTransactionWaitMillis={1000}
                suppressAnimationFrame={false}
                onGridReady={onGridReady}
            />
        </div>
    );
}

function getColumns(
    booksRecord: undefined | TPortfolioBookRecord,
    assetsRecord: undefined | TAssetRecord,
): TColDef<TInternalItem>[] {
    return [
        {
            ...getColAll(),
            hide: true,
            enableRowGroup: true,
        },
        { ...getColBookId(), hide: true, enableRowGroup: true },
        { ...getColBookName(booksRecord), hide: true, rowGroup: true, enableRowGroup: true },
        { ...getColAssetId(), hide: true, enableRowGroup: true },
        { ...getColAssetName(assetsRecord), enableRowGroup: true },
        {
            field: 'cashBalance',
            headerName: 'Cache Balance',
            filter: EColumnFilterType.number,
            valueFormatter: numberFormatter('%.4f'),
            enableValue: true,
            aggFunc: 'sum',
        },
        {
            field: 'deltaFxAtm',
            headerName: 'Δ ATM',
            filter: EColumnFilterType.number,
            valueFormatter: numberFormatter('%.4f'),
            enableValue: true,
            aggFunc: 'sum',
        },
        {
            colId: 'atm',
            headerName: 'ATM',
            filter: EColumnFilterType.number,
            valueGetter: (params) => {
                return isNil(params.data) ? null : params.data.deltaFxAtm + params.data.cashBalance;
            },
            valueFormatter: numberFormatter('%.4f'),
            enableValue: true,
            aggFunc: 'sum',
        },
        {
            field: 'deltaFxSkew',
            headerName: 'Δ Skew',
            filter: EColumnFilterType.number,
            valueFormatter: numberFormatter('%.4f'),
            enableValue: true,
            aggFunc: 'sum',
        },
        {
            colId: 'skew',
            headerName: 'Skew',
            filter: EColumnFilterType.number,
            valueGetter: (params) => {
                return isNil(params.data)
                    ? null
                    : params.data.deltaFxSkew + params.data.cashBalance;
            },
            valueFormatter: numberFormatter('%.4f'),
            enableValue: true,
            aggFunc: 'sum',
        },
        {
            field: 'convertRate',
            headerName: 'Convert',
            filter: EColumnFilterType.number,
            valueFormatter: numberFormatter('%.4f'),
            enableValue: true,
            aggFunc: 'sum',
        },
        {
            field: 'dv',
            headerName: 'DV',
            filter: EColumnFilterType.number,
            valueFormatter: numberFormatter('%.4f'),
            enableValue: true,
            aggFunc: 'sum',
        },
    ];
}
