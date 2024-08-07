import type {
    TInstrument,
    TInstrumentFuturesPayoutNotation,
    TProviderInstrumentDetails,
    TProviderInstrumentDetailsFuturesPayoutNotation,
} from '@backend/bff/src/modules/instruments/schemas/defs.ts';
import { assertNever } from '@common/utils/src/assert.ts';
import { isNil } from 'lodash-es';

import { hasInstrumentPayoutNotation } from './hasInstrumentPayoutNotation.ts';

export function getInstrumentPayoutNotation({
    kind,
}: TInstrument): TInstrumentFuturesPayoutNotation | undefined {
    if (isNil(kind)) {
        return undefined;
    }

    const { type } = kind;

    if (!hasInstrumentPayoutNotation(type)) {
        return undefined;
    }

    switch (type) {
        case 'perpFutures':
            return kind.perpFutures.payoutNotation;
        case 'futuresDetails':
            return kind.futuresDetails.payoutNotation;
        default:
            assertNever(type);
    }
}

export function getProviderInstrumentPayoutNotation({
    kind,
}: TProviderInstrumentDetails): TProviderInstrumentDetailsFuturesPayoutNotation | undefined {
    if (isNil(kind)) {
        return undefined;
    }

    const { type } = kind;

    if (!hasInstrumentPayoutNotation(type)) {
        return undefined;
    }

    switch (type) {
        case 'perpFutures':
            return kind.perpFutures.payoutNotation;
        case 'futuresDetails':
            return kind.futuresDetails.payoutNotation;
        default:
            assertNever(type);
    }
}
