import { ColDef } from '@frontend/ag-grid';
import { EColumnFilterType } from '@frontend/ag-grid/src/types';
import { dateFormatter } from '@frontend/common/src/components/AgTable/formatters/date.ts';
import { TAssetId, TAssetRecord } from '@frontend/common/src/types/domain/asset';
import {
    EInstrumentKindType,
    TInstrument,
    TInstrumentId,
    TInstrumentRecord,
} from '@frontend/common/src/types/domain/instrument';
import {
    TPortfolioBookId,
    TPortfolioBookRecord,
} from '@frontend/common/src/types/domain/portfolioTraсker';
import { ISO, TimeZone } from '@frontend/common/src/types/time';

import {
    createAssetNameValueGetter,
    createBookNameValueGetter,
    createInstrumentFieldValueGetter,
    createInstrumentNameValueGetter,
} from './utils';

export function getColAll<T extends { all: string }>(): ColDef<T> {
    return {
        field: 'all',
    } as ColDef<T>;
}

export function getColBookId<T extends { bookId: TPortfolioBookId }>(): ColDef<T> {
    return {
        field: 'bookId',
        headerName: 'Book ID',
        filter: EColumnFilterType.text,
    } as ColDef<T>;
}

export function getColBookName<T extends { bookId: TPortfolioBookId }>(
    record: undefined | TPortfolioBookRecord,
): ColDef<T> {
    return {
        field: 'bookId',
        headerName: 'Book Name',
        filter: EColumnFilterType.text,
        valueGetter: createBookNameValueGetter(record),
    } as ColDef<T>;
}

export function getColAssetId<T extends { assetId: TAssetId }>(): ColDef<T> {
    return {
        field: 'assetId',
        headerName: 'Asset ID',
        filter: EColumnFilterType.text,
    } as ColDef<T>;
}

export function getColAssetName<T extends { assetId: TAssetId }>(
    record: undefined | TAssetRecord,
): ColDef<T> {
    return {
        field: 'assetId',
        headerName: 'Asset Name',
        filter: EColumnFilterType.text,
        valueGetter: createAssetNameValueGetter(record),
    } as ColDef<T>;
}

export function getColInstrumentId<T extends { instrumentId: TInstrumentId }>(): ColDef<T> {
    return {
        field: 'instrumentId',
        headerName: 'Instrument ID',
        filter: EColumnFilterType.text,
    } as ColDef<T>;
}

export function getColInstrumentName<T extends { instrumentId: TInstrumentId }>(
    record: undefined | TInstrumentRecord,
): ColDef<T> {
    return {
        field: 'instrumentId',
        headerName: 'Instrument Name',
        filter: EColumnFilterType.text,
        valueGetter: createInstrumentNameValueGetter(record),
    } as ColDef<T>;
}

export function getColPlatformTime<T extends { platformTime: ISO }>(timeZone: TimeZone): ColDef<T> {
    return {
        field: 'platformTime',
        headerName: 'Platform Time',
        valueFormatter: dateFormatter(timeZone),
        filter: EColumnFilterType.date,
    } as ColDef<T>;
}

export function getColBaseIndex() {
    return {
        colId: 'baseIndex',
        headerName: 'Base Index(Hardcoded)',
        filter: EColumnFilterType.text,
        valueGetter: () => 'BTCUSDT',
    };
}

export function getColInstrumentExchange<T extends { instrumentId: TInstrumentId }>(
    instrumentsRecord: undefined | TInstrumentRecord,
) {
    return {
        colId: 'exchange',
        headerName: 'Exchange',
        filter: EColumnFilterType.text,
        valueGetter: createInstrumentFieldValueGetter<T>(instrumentsRecord, (v) => v.exchange),
    };
}

export function getColInstrumentBaseAsset<T extends { instrumentId: TInstrumentId }>(
    instrumentsRecord: undefined | TInstrumentRecord,
) {
    return {
        colId: 'baseAsset',
        headerName: 'Base Asset',
        filter: EColumnFilterType.text,
        valueGetter: createInstrumentFieldValueGetter<T>(
            instrumentsRecord,
            ({ kind }: TInstrument) =>
                'baseCurrencyName' in kind ? kind.baseCurrencyName : undefined,
        ),
    };
}
export function getColInstrumentQuoteAsset<T extends { instrumentId: TInstrumentId }>(
    instrumentsRecord: undefined | TInstrumentRecord,
) {
    return {
        colId: 'quoteAsset',
        headerName: 'Quote Asset',
        filter: EColumnFilterType.text,
        valueGetter: createInstrumentFieldValueGetter<T>(
            instrumentsRecord,
            ({ kind }: TInstrument) =>
                'quoteCurrencyName' in kind ? kind.quoteCurrencyName : undefined,
        ),
    };
}

export function getColInstrumentKindType<T extends { instrumentId: TInstrumentId }>(
    instrumentsRecord: undefined | TInstrumentRecord,
) {
    return {
        colId: 'kindType',
        headerName: 'Trade Type',
        filter: EColumnFilterType.text,
        valueGetter: createInstrumentFieldValueGetter<T>(instrumentsRecord, (v) => v.kind.type),
    };
}
export function getColInstrumentOptionType<T extends { instrumentId: TInstrumentId }>(
    instrumentsRecord: undefined | TInstrumentRecord,
) {
    return {
        colId: 'optionType',
        headerName: 'Option Type',
        filter: EColumnFilterType.text,
        valueGetter: createInstrumentFieldValueGetter<T>(instrumentsRecord, (v) =>
            v.kind.type === EInstrumentKindType.Option ? v.kind.optionType : null,
        ),
    };
}
export function getColInstrumentStrikePrice<T extends { instrumentId: TInstrumentId }>(
    instrumentsRecord: undefined | TInstrumentRecord,
) {
    return {
        colId: 'strikePrice',
        headerName: 'Strike Price',
        filter: EColumnFilterType.number,
        valueGetter: createInstrumentFieldValueGetter<T>(instrumentsRecord, (v) =>
            v.kind.type === EInstrumentKindType.Option ? v.kind.strikePrice : null,
        ),
    };
}
export function getColInstrumentStepPrice<T extends { instrumentId: TInstrumentId }>(
    instrumentsRecord: undefined | TInstrumentRecord,
) {
    return {
        colId: 'stepPrice',
        headerName: 'Step Price',
        filter: EColumnFilterType.number,
        valueGetter: createInstrumentFieldValueGetter<T>(
            instrumentsRecord,
            (v) => v.stepPrice.value,
        ),
    };
}
export function getColInstrumentStepQty<T extends { instrumentId: TInstrumentId }>(
    instrumentsRecord: undefined | TInstrumentRecord,
) {
    return {
        colId: 'stepQty',
        headerName: 'Step Qty',
        filter: EColumnFilterType.number,
        valueGetter: createInstrumentFieldValueGetter<T>(instrumentsRecord, (v) => v.stepQty.value),
    };
}
export function getColInstrumentExpirationTime<T extends { instrumentId: TInstrumentId }>(
    timeZone: TimeZone,
    instrumentsRecord: undefined | TInstrumentRecord,
) {
    return {
        colId: 'expirationTime',
        headerName: 'Expiration Time',
        filter: EColumnFilterType.date,
        valueGetter: createInstrumentFieldValueGetter<T>(instrumentsRecord, (v) =>
            v.kind.type === EInstrumentKindType.Option ? v.kind.expirationTime : null,
        ),
        valueFormatter: dateFormatter(timeZone),
    };
}
