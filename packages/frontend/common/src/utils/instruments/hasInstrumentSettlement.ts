import type {
    TInstrument,
    TProviderInstrumentDetails,
} from '@backend/bff/src/modules/instruments/schemas/defs.ts';

export function hasInstrumentSettlement(
    kind:
        | undefined
        | string
        | Exclude<TInstrument['kind'] | TProviderInstrumentDetails['kind'], undefined>['type'],
): kind is 'spotDetails' | 'futuresDetails' | 'option' {
    return kind === 'spotDetails' || kind === 'futuresDetails' || kind === 'option';
}
