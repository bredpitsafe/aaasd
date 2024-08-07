import type {
    TInstrument,
    TInstrumentUnderlying,
    TProviderInstrumentDetails,
    TProviderInstrumentDetailsUnderlying,
} from '@backend/bff/src/modules/instruments/schemas/defs.ts';
import { assertNever } from '@common/utils/src/assert.ts';
import { isNil } from 'lodash-es';

import { hasInstrumentUnderlying } from './hasInstrumentUnderlying.ts';

export function getInstrumentUnderlying({
    kind,
}: TInstrument): Exclude<TInstrumentUnderlying['value'], undefined> | undefined {
    if (isNil(kind)) {
        return undefined;
    }

    const { type } = kind;

    if (!hasInstrumentUnderlying(type)) {
        return undefined;
    }

    switch (type) {
        case 'perpFutures':
            return kind.perpFutures.underlying.value;
        case 'futuresDetails':
            return kind.futuresDetails.underlying.value;
        case 'option':
            return kind.option.underlying.value;
        default:
            assertNever(type);
    }
}

export function getProviderInstrumentUnderlying({
    kind,
}: TProviderInstrumentDetails):
    | Exclude<TProviderInstrumentDetailsUnderlying['value'], undefined>
    | undefined {
    if (isNil(kind)) {
        return undefined;
    }

    const { type } = kind;

    if (!hasInstrumentUnderlying(type)) {
        return undefined;
    }

    switch (type) {
        case 'perpFutures':
            return kind.perpFutures.underlying?.value;
        case 'futuresDetails':
            return kind.futuresDetails.underlying?.value;
        case 'option':
            return kind.option.underlying?.value;
        default:
            assertNever(type);
    }
}
