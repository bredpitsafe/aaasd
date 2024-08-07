import type { TInstrumentDynamicDataPriceStepRules } from '@backend/bff/src/modules/instruments/schemas/defs.ts';
import { assertNever } from '@common/utils/src/assert.ts';
import { isNil } from 'lodash-es';

export function getInstrumentStepPrice({
    value,
}: TInstrumentDynamicDataPriceStepRules): undefined | number | [number, number] {
    if (isNil(value)) {
        return undefined;
    }

    const type = value.type;

    switch (type) {
        case 'simple':
            return value.simple.priceDelta;
        case 'table':
            const steps = value.table.rows.map(({ step }) => step).sort();

            if (steps.length === 0) {
                return undefined;
            }

            return steps.length > 1 ? [steps[0], steps[steps.length - 1]] : steps[0];
        default:
            assertNever(type);
    }
}
