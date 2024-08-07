import type {
    TInstrument,
    TProviderInstrumentDetails,
} from '@backend/bff/src/modules/instruments/schemas/defs.ts';

export function hasInstrumentSpotData(
    kind:
        | undefined
        | string
        | Exclude<TInstrument['kind'] | TProviderInstrumentDetails['kind'], undefined>['type'],
): kind is 'instantSpot' | 'spotDetails' {
    return kind === 'instantSpot' || kind === 'spotDetails';
}
