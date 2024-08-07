import type {
    TInstrument,
    TInstrumentMarginNotation,
    TProviderInstrumentDetails,
    TProviderInstrumentDetailsMarginNotation,
} from '@backend/bff/src/modules/instruments/schemas/defs.ts';
import { assertNever } from '@common/utils/src/assert.ts';
import { isNil } from 'lodash-es';

import { hasInstrumentMarginNotation } from './hasInstrumentMarginNotation.ts';

export function getInstrumentMarginNotation({
    kind,
}: TInstrument): Exclude<TInstrumentMarginNotation['value'], undefined> | undefined {
    if (isNil(kind)) {
        return undefined;
    }

    const { type } = kind;

    if (!hasInstrumentMarginNotation(type)) {
        return undefined;
    }

    switch (type) {
        case 'perpFutures':
            return kind.perpFutures.marginNotation.value;
        case 'futuresDetails':
            return kind.futuresDetails.marginNotation.value;
        case 'option':
            return kind.option.marginNotation.value;
        default:
            assertNever(type);
    }
}

export function getProviderInstrumentMarginNotation({
    kind,
}: TProviderInstrumentDetails):
    | Exclude<TProviderInstrumentDetailsMarginNotation['value'], undefined>
    | undefined {
    if (isNil(kind)) {
        return undefined;
    }

    const { type } = kind;

    if (!hasInstrumentMarginNotation(type)) {
        return undefined;
    }

    switch (type) {
        case 'perpFutures':
            return kind.perpFutures.marginNotation?.value;
        case 'futuresDetails':
            return kind.futuresDetails.marginNotation?.value;
        case 'option':
            return kind.option.marginNotation?.value;
        default:
            assertNever(type);
    }
}
