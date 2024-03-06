import { TAssetId, TAssetRecord } from '@frontend/common/src/types/domain/asset';
import {
    TInstrument,
    TInstrumentId,
    TInstrumentRecord,
} from '@frontend/common/src/types/domain/instrument';
import {
    TPortfolioBook,
    TPortfolioBookId,
} from '@frontend/common/src/types/domain/portfolioTraсker';
import { throwingError } from '@frontend/common/src/utils/throwingError';
import { ValueGetterFunc } from 'ag-grid-community/dist/lib/entities/colDef';
import { isNil } from 'lodash-es';

function getName<T extends Record<string, { name: string }>>(
    obj: undefined | T,
    id: keyof T,
): string {
    return obj?.[id]?.name ?? 'Unknown';
}

export function getDoubleAssetName(
    assets: undefined | TAssetRecord,
    asset1: TAssetId,
    asset2: TAssetId,
): string {
    return assets === undefined
        ? `Unknown`
        : `${getName(assets, asset1)}/${getName(assets, asset2)}`;
}

const defaultGetterBookId = <T extends object>(d: T): TPortfolioBookId =>
    'bookId' in d ? (d.bookId as TPortfolioBookId) : throwingError('bookId is not found');
export function createBookNameValueGetter<T extends object>(
    record: undefined | Record<TPortfolioBookId, TPortfolioBook>,
    getterId: (data: T) => TPortfolioBookId = defaultGetterBookId,
): ValueGetterFunc<T> {
    return (params) => {
        return !isNil(params.data) ? getName(record, getterId(params.data)) : undefined;
    };
}

const defaultGetterAssetId = <T extends object>(d: T): TAssetId =>
    'assetId' in d ? (d.assetId as TAssetId) : throwingError('assetId is not found');
export function createAssetNameValueGetter<T extends object>(
    record: undefined | TAssetRecord,
    getterId: (data: T) => TAssetId = defaultGetterAssetId,
): ValueGetterFunc<T> {
    return (params) => {
        return !isNil(params.data) ? getName(record, getterId(params.data)) : undefined;
    };
}

const defaultGetterInstrumentId = <T extends object>(d: T): TInstrumentId =>
    'instrumentId' in d
        ? (d.instrumentId as TInstrumentId)
        : throwingError('instrumentId is not found');
export function createInstrumentFieldValueGetter<T extends object>(
    record: undefined | TInstrumentRecord,
    getterValue: (instrument: TInstrument) => unknown,
    getterId: (data: T) => TInstrumentId = defaultGetterInstrumentId,
): ValueGetterFunc<T> {
    return (params) => {
        if (isNil(params.data)) return undefined;

        const instrument = record?.[getterId(params.data)];

        if (isNil(instrument)) return undefined;

        return getterValue(instrument);
    };
}

export function createInstrumentNameValueGetter<T extends object>(
    record: undefined | TInstrumentRecord,
    getterId: (data: T) => TInstrumentId = defaultGetterInstrumentId,
): ValueGetterFunc<T> {
    return createInstrumentFieldValueGetter(record, (instrument) => instrument.name, getterId);
}
