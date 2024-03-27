import { IAggFuncParams, ValueGetterParams } from '@frontend/ag-grid';
import type { TColDef } from '@frontend/ag-grid/src/types';
import { EColumnFilterType } from '@frontend/ag-grid/src/types';
import { AgTableWithRouterSync } from '@frontend/common/src/components/AgTable/AgTableWithRouterSync';
import { useGridApi } from '@frontend/common/src/components/AgTable/hooks/useGridApi';
import { useSidebar } from '@frontend/common/src/components/AgTable/hooks/useSidebar';
import { ETableIds } from '@frontend/common/src/modules/clientTableFilters/data';
import type { TWithClassname } from '@frontend/common/src/types/components';
import { TInstrument, TInstrumentId } from '@frontend/common/src/types/domain/instrument';
import {
    TPortfolioBook,
    TPortfolioBookId,
    TPortfolioPosition,
} from '@frontend/common/src/types/domain/portfolioTraсker';
import { TimeZone } from '@frontend/common/src/types/time';
import { sprintf } from '@frontend/common/src/utils/sprintf/sprintf';
import { isNil } from 'lodash-es';
import { ReactElement, useMemo } from 'react';

import {
    getColBaseIndex,
    getColBookId,
    getColBookName,
    getColInstrumentBaseAsset,
    getColInstrumentExchange,
    getColInstrumentExpirationTime,
    getColInstrumentId,
    getColInstrumentKindType,
    getColInstrumentName,
    getColInstrumentOptionType,
    getColInstrumentQuoteAsset,
    getColInstrumentStepPrice,
    getColInstrumentStepQty,
    getColInstrumentStrikePrice,
    getColPlatformTime,
} from './columns';

type TTablePortfolioPositionsItem = TPortfolioPosition;

type TTablePortfolioPositionsProps = TWithClassname & {
    items: undefined | TTablePortfolioPositionsItem[];
    timeZone: TimeZone;
    booksRecord: undefined | Record<TPortfolioBookId, TPortfolioBook>;
    instrumentsRecord: undefined | Record<TInstrumentId, TInstrument>;
};

export function TablePortfolioPositions(props: TTablePortfolioPositionsProps): ReactElement {
    const { gridApi, onGridReady } = useGridApi();
    const columns = useMemo<TColDef<TTablePortfolioPositionsItem>[]>(
        () => getColumns(props.timeZone, props.booksRecord, props.instrumentsRecord),
        [props.booksRecord, props.instrumentsRecord, props.timeZone],
    );

    useSidebar(gridApi);

    return (
        <div className={props.className}>
            <AgTableWithRouterSync
                id={ETableIds.PortfolioPositions}
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
    timeZone: TimeZone,
    booksRecord: undefined | Record<TPortfolioBookId, TPortfolioBook>,
    instrumentsRecord: undefined | Record<TInstrumentId, TInstrument>,
): TColDef<TTablePortfolioPositionsItem>[] {
    return [
        { ...getColBookId(), hide: true, enableRowGroup: true },
        { ...getColBookName(booksRecord), hide: true, enableRowGroup: true },
        { ...getColInstrumentId(), hide: true, enableRowGroup: true },
        {
            ...getColInstrumentName(instrumentsRecord),
            hide: true,
            rowGroup: true,
            enableRowGroup: true,
        },
        {
            field: 'amount',
            headerName: 'Notional amount',
            filter: EColumnFilterType.number,
            aggFunc: 'sum',
        },
        {
            headerName: 'Avg Price',
            filter: EColumnFilterType.number,
            valueGetter: (params: ValueGetterParams<TTablePortfolioPositionsItem>) => {
                return {
                    amount: params.data?.amount,
                    avgPrice: params.data?.avgPrice,
                    toString: () =>
                        params.data === undefined ? '' : sprintf('%.4f', params.data.avgPrice),
                };
            },
            aggFunc: (
                params: IAggFuncParams<
                    TTablePortfolioPositionsItem,
                    Pick<TTablePortfolioPositionsItem, 'amount' | 'avgPrice'>
                >,
            ) => {
                const sumPrice = params.values.reduce((acc, value) => {
                    if (isNil(value)) {
                        return acc;
                    }
                    return acc + value.avgPrice * value.amount;
                }, 0);
                const sumAmount = params.values.reduce((acc, value) => {
                    if (isNil(value)) {
                        return acc;
                    }
                    return acc + value.amount;
                }, 0);

                return {
                    amount: sumAmount,
                    avgPrice: sumPrice / sumAmount,
                    toString: () => sprintf('%.4f', sumPrice / sumAmount),
                };
            },
        },
        {
            field: 'lastPrice',
            headerName: 'Last Price',
            filter: EColumnFilterType.number,
            aggFunc: 'last',
        },
        { ...getColBaseIndex(), aggFunc: 'last' },
        { ...getColInstrumentExchange(instrumentsRecord), aggFunc: 'last' },
        { ...getColInstrumentBaseAsset(instrumentsRecord), aggFunc: 'last' },
        { ...getColInstrumentQuoteAsset(instrumentsRecord), aggFunc: 'last' },
        { ...getColInstrumentKindType(instrumentsRecord), aggFunc: 'last' },
        { ...getColInstrumentOptionType(instrumentsRecord), aggFunc: 'last' },
        { ...getColInstrumentStrikePrice(instrumentsRecord), aggFunc: 'last' },
        { ...getColInstrumentStepPrice(instrumentsRecord), aggFunc: 'last' },
        { ...getColInstrumentStepQty(instrumentsRecord), aggFunc: 'last' },
        { ...getColInstrumentExpirationTime(timeZone, instrumentsRecord), aggFunc: 'last' },
        { ...getColPlatformTime(timeZone), aggFunc: 'last' },
    ];
}
