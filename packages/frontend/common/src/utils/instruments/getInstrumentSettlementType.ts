import type {
    TInstrument,
    TInstrumentSettlementType,
    TProviderInstrumentDetails,
    TProviderInstrumentDetailsSettlementType,
} from '@backend/bff/src/modules/instruments/schemas/defs.ts';
import { assertNever } from '@common/utils/src/assert.ts';
import { isNil } from 'lodash-es';

import { hasInstrumentSettlement } from './hasInstrumentSettlement.ts';

export function getInstrumentSettlementType({
    kind,
}: TInstrument): Exclude<TInstrumentSettlementType['value'], undefined> | undefined {
    if (isNil(kind)) {
        return undefined;
    }

    const { type } = kind;

    if (!hasInstrumentSettlement(type)) {
        return undefined;
    }

    switch (type) {
        case 'spotDetails':
            return kind.spotDetails.settlementType.value;
        case 'futuresDetails':
            return kind.futuresDetails.settlementType.value;
        case 'option':
            return kind.option.settlementType.value;
        default:
            assertNever(type);
    }
}

export function getProviderInstrumentSettlementType({
    kind,
}: TProviderInstrumentDetails):
    | Exclude<TProviderInstrumentDetailsSettlementType['value'], undefined>
    | undefined {
    if (isNil(kind)) {
        return undefined;
    }

    const { type } = kind;

    if (!hasInstrumentSettlement(type)) {
        return undefined;
    }

    switch (type) {
        case 'spotDetails':
            return kind.spotDetails.settlementType?.value;
        case 'futuresDetails':
            return kind.futuresDetails.settlementType?.value;
        case 'option':
            return kind.option.settlementType?.value;
        default:
            assertNever(type);
    }
}
