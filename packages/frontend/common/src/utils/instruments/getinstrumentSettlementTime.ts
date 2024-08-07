import type {
    TInstrument,
    TProviderInstrumentDetails,
} from '@backend/bff/src/modules/instruments/schemas/defs.ts';
import type { ISO } from '@common/types';
import { assertNever } from '@common/utils/src/assert.ts';
import { isNil } from 'lodash-es';

import { hasInstrumentSettlement } from './hasInstrumentSettlement.ts';

export function getInstrumentSettlementTime({ kind }: TInstrument): ISO | undefined {
    if (isNil(kind)) {
        return undefined;
    }

    const { type } = kind;

    if (!hasInstrumentSettlement(type)) {
        return undefined;
    }

    switch (type) {
        case 'spotDetails':
            return kind.spotDetails.settlementTime as ISO;
        case 'futuresDetails':
            return kind.futuresDetails.settlementTime as ISO;
        case 'option':
            return kind.option.optionStyle.value?.type === 'european'
                ? (kind.option.optionStyle.value.european.settlementTime as ISO)
                : undefined;
        default:
            assertNever(type);
    }
}

export function getProviderInstrumentSettlementTime({
    kind,
}: TProviderInstrumentDetails): ISO | undefined {
    if (isNil(kind)) {
        return undefined;
    }

    const { type } = kind;

    if (!hasInstrumentSettlement(type)) {
        return undefined;
    }

    switch (type) {
        case 'spotDetails':
            return kind.spotDetails.settlementTime as ISO;
        case 'futuresDetails':
            return kind.futuresDetails.settlementTime as ISO;
        case 'option':
            return kind.option.optionStyle?.value?.type === 'european'
                ? (kind.option.optionStyle.value.european.settlementTime as ISO)
                : undefined;
        default:
            assertNever(type);
    }
}
