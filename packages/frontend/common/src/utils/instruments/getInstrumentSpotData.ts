import type {
    TInstrument,
    TProviderInstrumentDetails,
} from '@backend/bff/src/modules/instruments/schemas/defs.ts';
import { assertNever } from '@common/utils/src/assert.ts';
import { isNil } from 'lodash-es';

import { hasInstrumentSpotData } from './hasInstrumentSpotData.ts';

export function getInstrumentSpotData({
    kind,
}: TInstrument): { baseAssetId: number; quoteAssetId: number } | undefined {
    if (isNil(kind)) {
        return undefined;
    }

    const { type } = kind;

    if (!hasInstrumentSpotData(type)) {
        return undefined;
    }

    switch (type) {
        case 'spotDetails':
            return {
                baseAssetId: kind.spotDetails.baseAssetId,
                quoteAssetId: kind.spotDetails.quoteAssetId,
            };
        case 'instantSpot':
            return {
                baseAssetId: kind.instantSpot.baseAssetId,
                quoteAssetId: kind.instantSpot.quoteAssetId,
            };
        default:
            assertNever(type);
    }
}

export function getProviderInstrumentSpotData({
    kind,
}: TProviderInstrumentDetails):
    | { baseAssetName: undefined | string; quoteAssetName: undefined | string }
    | undefined {
    if (isNil(kind)) {
        return undefined;
    }

    const { type } = kind;

    if (!hasInstrumentSpotData(type)) {
        return undefined;
    }

    switch (type) {
        case 'spotDetails':
            return {
                baseAssetName: kind.spotDetails.baseAssetName,
                quoteAssetName: kind.spotDetails.quoteAssetName,
            };
        case 'instantSpot':
            return {
                baseAssetName: kind.instantSpot.baseAssetName,
                quoteAssetName: kind.instantSpot.quoteAssetName,
            };
        default:
            assertNever(type);
    }
}
