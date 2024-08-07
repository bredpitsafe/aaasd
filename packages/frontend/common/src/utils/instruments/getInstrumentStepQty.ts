import type { TInstrumentDynamicDataAmountStepRules } from '@backend/bff/src/modules/instruments/schemas/defs';
import { assertNever } from '@common/utils/src/assert.ts';
import { isNil } from 'lodash-es';

export function getInstrumentStepQty({
    value,
}: TInstrumentDynamicDataAmountStepRules): undefined | number {
    if (isNil(value)) {
        return undefined;
    }

    const type = value.type;

    switch (type) {
        case 'simple':
            return value.simple.value;
        default:
            assertNever(type);
    }
}
