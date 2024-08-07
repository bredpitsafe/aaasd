import type {
    TInstrument,
    TProviderInstrumentDetails,
} from '@backend/bff/src/modules/instruments/schemas/defs.ts';

export function hasInstrumentPayoutNotation(
    kind:
        | undefined
        | string
        | Exclude<TInstrument['kind'] | TProviderInstrumentDetails['kind'], undefined>['type'],
): kind is 'perpFutures' | 'futuresDetails' {
    return kind === 'perpFutures' || kind === 'futuresDetails';
}
