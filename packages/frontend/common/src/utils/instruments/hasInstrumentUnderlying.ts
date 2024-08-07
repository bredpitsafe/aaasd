import type {
    TInstrument,
    TProviderInstrumentDetails,
} from '@backend/bff/src/modules/instruments/schemas/defs.ts';

export function hasInstrumentUnderlying(
    kind:
        | undefined
        | string
        | Exclude<TInstrument['kind'] | TProviderInstrumentDetails['kind'], undefined>['type'],
): kind is 'perpFutures' | 'futuresDetails' | 'option' {
    return kind === 'perpFutures' || kind === 'futuresDetails' || kind === 'option';
}
