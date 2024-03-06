import { dateFormatter } from '@frontend/common/src/components/AgTable/formatters/date';
import { EColumnFilterType, TColDef } from '@frontend/common/src/components/AgTable/types';
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

export function getColAll<T extends { all: string }>(): TColDef<T> {
    return {
        field: 'all',
    } as TColDef<T>;
}

export function getColBookId<T extends { bookId: TPortfolioBookId }>(): TColDef<T> {
    return {
        field: 'bookId',
        headerName: 'Book ID',
        filter: EColumnFilterType.text,
    } as TColDef<T>;
}

export function getColBookName<T extends { bookId: TPortfolioBookId }>(
    record: undefined | TPortfolioBookRecord,
): TColDef<T> {
    return {
        field: 'bookId',
        headerName: 'Book Name',
        filter: EColumnFilterType.text,
        valueGetter: createBookNameValueGetter(record),
    } as TColDef<T>;
}

export function getColAssetId<T extends { assetId: TAssetId }>(): TColDef<T> {
    return {
        field: 'assetId',
        headerName: 'Asset ID',
        filter: EColumnFilterType.text,
    } as TColDef<T>;
}

export function getColAssetName<T extends { assetId: TAssetId }>(
    record: undefined | TAssetRecord,
): TColDef<T> {
    return {
        field: 'assetId',
        headerName: 'Asset Name',
        filter: EColumnFilterType.text,
        valueGetter: createAssetNameValueGetter(record),
    } as TColDef<T>;
}

export function getColInstrumentId<T extends { instrumentId: TInstrumentId }>(): TColDef<T> {
    return {
        field: 'instrumentId',
        headerName: 'Instrument ID',
        filter: EColumnFilterType.text,
    } as TColDef<T>;
}

export function getColInstrumentName<T extends { instrumentId: TInstrumentId }>(
    record: undefined | TInstrumentRecord,
): TColDef<T> {
    return {
        field: 'instrumentId',
        headerName: 'Instrument Name',
        filter: EColumnFilterType.text,
        valueGetter: createInstrumentNameValueGetter(record),
    } as TColDef<T>;
}

export function getColPlatformTime<T extends { platformTime: ISO }>(
    timeZone: TimeZone,
): TColDef<T> {
    return {
        field: 'platformTime',
        headerName: 'Platform Time',
        valueFormatter: dateFormatter(timeZone),
        filter: EColumnFilterType.date,
    } as TColDef<T>;
}

export function getColBaseIndex() {
    return {
        headerName: 'Base Index(Hardcoded)',
        filter: EColumnFilterType.text,
        valueGetter: () => 'BTCUSDT',
    };
}

export function getColInstrumentExchange<T extends { instrumentId: TInstrumentId }>(
    instrumentsRecord: undefined | TInstrumentRecord,
) {
    return {
        headerName: 'Exchange',
        filter: EColumnFilterType.text,
        valueGetter: createInstrumentFieldValueGetter<T>(instrumentsRecord, (v) => v.exchange),
    };
}

export function getColInstrumentBaseAsset<T extends { instrumentId: TInstrumentId }>(
    instrumentsRecord: undefined | TInstrumentRecord,
) {
    return {
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
        headerName: 'Trade Type',
        filter: EColumnFilterType.text,
        valueGetter: createInstrumentFieldValueGetter<T>(instrumentsRecord, (v) => v.kind.type),
    };
}
export function getColInstrumentOptionType<T extends { instrumentId: TInstrumentId }>(
    instrumentsRecord: undefined | TInstrumentRecord,
) {
    return {
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
        headerName: 'Expiration Time',
        filter: EColumnFilterType.date,
        valueGetter: createInstrumentFieldValueGetter<T>(instrumentsRecord, (v) =>
            v.kind.type === EInstrumentKindType.Option ? v.kind.expirationTime : null,
        ),
        valueFormatter: dateFormatter(timeZone),
    };
}
