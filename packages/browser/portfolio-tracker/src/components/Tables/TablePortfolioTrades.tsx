import { AgTableWithRouterSync } from '@frontend/common/src/components/AgTable/AgTableWithRouterSync';
import type { TColDef } from '@frontend/common/src/components/AgTable/types';
import { EColumnFilterType } from '@frontend/common/src/components/AgTable/types';
import { ETableIds } from '@frontend/common/src/modules/clientTableFilters/data';
import type { TWithClassname } from '@frontend/common/src/types/components';
import { TAsset, TAssetId } from '@frontend/common/src/types/domain/asset';
import { TInstrument, TInstrumentId } from '@frontend/common/src/types/domain/instrument';
import {
    TPortfolioBook,
    TPortfolioBookId,
    TPortfolioTrade,
} from '@frontend/common/src/types/domain/portfolioTraсker';
import { TimeZone } from '@frontend/common/src/types/time';
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
import { createAssetNameValueGetter } from './utils';

type TTablePortfolioTradesItem = TPortfolioTrade;

type TTablePortfolioTradesProps = TWithClassname & {
    items: undefined | TTablePortfolioTradesItem[];
    timeZone: TimeZone;
    booksRecord: undefined | Record<TPortfolioBookId, TPortfolioBook>;
    assetsRecord: undefined | Record<TAssetId, TAsset>;
    instrumentsRecord: undefined | Record<TInstrumentId, TInstrument>;
};

export function TablePortfolioTrades(props: TTablePortfolioTradesProps): ReactElement {
    const columns = useMemo<TColDef<TTablePortfolioTradesItem>[]>(
        () =>
            getColumns(
                props.timeZone,
                props.booksRecord,
                props.assetsRecord,
                props.instrumentsRecord,
            ),
        [props.assetsRecord, props.booksRecord, props.instrumentsRecord, props.timeZone],
    );

    return (
        <div className={props.className}>
            <AgTableWithRouterSync<TTablePortfolioTradesItem>
                id={ETableIds.PortfolioTrades}
                rowKey="tradeId"
                rowData={props.items}
                columnDefs={columns}
                asyncTransactionWaitMillis={1000}
                suppressAnimationFrame={false}
            />
        </div>
    );
}

function getColumns(
    timeZone: TimeZone,
    booksRecord: undefined | Record<TPortfolioBookId, TPortfolioBook>,
    assetsRecord: undefined | Record<TAssetId, TAsset>,
    instrumentsRecord: undefined | Record<TInstrumentId, TInstrument>,
): TColDef<TTablePortfolioTradesItem>[] {
    return [
        {
            field: 'tradeId',
            headerName: 'Trade ID',
            filter: EColumnFilterType.number,
        },
        getColBookId(),
        getColBookName(booksRecord),
        getColInstrumentId(),
        getColInstrumentName(instrumentsRecord),
        { field: 'amount', headerName: 'Notional Amount', filter: EColumnFilterType.number },
        {
            colId: 'feeAmount',
            field: 'fee',
            headerName: 'Fee',
            filter: EColumnFilterType.number,
            valueGetter: (params) => params.data?.fee.amount,
        },
        {
            colId: 'feeAssetId',
            field: 'fee',
            headerName: 'Fee Asset Id',
            filter: EColumnFilterType.number,
            valueGetter: (params) => params.data?.fee.assetId,
            hide: true,
        },
        {
            colId: 'feeAssetName',
            field: 'fee',
            headerName: 'Fee Currency',
            filter: EColumnFilterType.number,
            valueGetter: createAssetNameValueGetter(assetsRecord, (data) => data.fee.assetId),
        },
        {
            field: 'side',
            headerName: 'Side',
            filter: EColumnFilterType.text,
        },
        {
            field: 'price',
            headerName: 'Price',
            filter: EColumnFilterType.number,
        },
        getColBaseIndex(),
        getColInstrumentExchange(instrumentsRecord),
        getColInstrumentBaseAsset(instrumentsRecord),
        getColInstrumentQuoteAsset(instrumentsRecord),
        getColInstrumentKindType(instrumentsRecord),
        getColInstrumentOptionType(instrumentsRecord),
        getColInstrumentStrikePrice(instrumentsRecord),
        getColInstrumentStepPrice(instrumentsRecord),
        getColInstrumentStepQty(instrumentsRecord),
        getColInstrumentExpirationTime(timeZone, instrumentsRecord),
        getColPlatformTime(timeZone),
    ];
}
