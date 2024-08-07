import type {
    TInstrument,
    TProviderInstrumentDetails,
} from '@backend/bff/src/modules/instruments/schemas/defs.ts';
import type { ISO } from '@common/types';
import { assertNever } from '@common/utils/src/assert.ts';
import { isNil } from 'lodash-es';

import { hasInstrumentStartExpiration } from './hasInstrumentStartExpiration.ts';

export function getInstrumentStartExpiration({
    kind,
}: TInstrument): { startTime: ISO; expirationTime: ISO } | undefined {
    if (isNil(kind)) {
        return undefined;
    }

    const { type } = kind;

    if (!hasInstrumentStartExpiration(type)) {
        return undefined;
    }

    switch (type) {
        case 'futuresDetails':
            return {
                startTime: kind.futuresDetails.startTime as ISO,
                expirationTime: kind.futuresDetails.expirationTime as ISO,
            };
        case 'option':
            return {
                startTime: kind.option.startTime as ISO,
                expirationTime: kind.option.expirationTime as ISO,
            };
        default:
            assertNever(type);
    }
}

export function getProviderInstrumentStartExpiration({
    kind,
}: TProviderInstrumentDetails):
    | { startTime: undefined | ISO; expirationTime: undefined | ISO }
    | undefined {
    if (isNil(kind)) {
        return undefined;
    }

    const { type } = kind;

    if (!hasInstrumentStartExpiration(type)) {
        return undefined;
    }

    switch (type) {
        case 'futuresDetails':
            return {
                startTime: kind.futuresDetails.startTime as undefined | ISO,
                expirationTime: kind.futuresDetails.expirationTime as undefined | ISO,
            };
        case 'option':
            return {
                startTime: kind.option.startTime as undefined | ISO,
                expirationTime: kind.option.expirationTime as undefined | ISO,
            };
        default:
            assertNever(type);
    }
}
