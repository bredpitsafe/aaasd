import type {
    TInstrument,
    TProviderInstrumentDetails,
} from '@backend/bff/src/modules/instruments/schemas/defs.ts';

export function hasInstrumentStartExpiration(
    kind:
        | undefined
        | string
        | Exclude<TInstrument['kind'] | TProviderInstrumentDetails['kind'], undefined>['type'],
): kind is 'futuresDetails' | 'option' {
    return kind === 'futuresDetails' || kind === 'option';
}
