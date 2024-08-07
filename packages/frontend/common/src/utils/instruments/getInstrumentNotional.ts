import type {
    TInstrument,
    TInstrumentNotional,
    TProviderInstrumentDetails,
    TProviderInstrumentDetailsNotional,
} from '@backend/bff/src/modules/instruments/schemas/defs.ts';
import { assertNever } from '@common/utils/src/assert.ts';
import { isNil } from 'lodash-es';

import { hasInstrumentNotional } from './hasInstrumentNotional.ts';

export function getInstrumentNotional({
    kind,
}: TInstrument): Exclude<TInstrumentNotional['value'], undefined> | undefined {
    if (isNil(kind)) {
        return undefined;
    }

    const { type } = kind;

    if (!hasInstrumentNotional(type)) {
        return undefined;
    }

    switch (type) {
        case 'perpFutures':
            return kind.perpFutures.notional.value;
        case 'futuresDetails':
            return kind.futuresDetails.notional.value;
        case 'option':
            return kind.option.notional.value;
        default:
            assertNever(type);
    }
}

export function getProviderInstrumentNotional({
    kind,
}: TProviderInstrumentDetails):
    | Exclude<TProviderInstrumentDetailsNotional['value'], undefined>
    | undefined {
    if (isNil(kind)) {
        return undefined;
    }

    const { type } = kind;

    if (!hasInstrumentNotional(type)) {
        return undefined;
    }

    switch (type) {
        case 'perpFutures':
            return kind.perpFutures.notional?.value;
        case 'futuresDetails':
            return kind.futuresDetails.notional?.value;
        case 'option':
            return kind.option.notional?.value;
        default:
            assertNever(type);
    }
}
