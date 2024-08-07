import type {
    TProviderInstrument,
    TProviderInstrumentDetails,
} from '@backend/bff/src/modules/instruments/schemas/defs.ts';
import { assertNever } from '@common/utils/src/assert.ts';
import { isNil } from 'lodash-es';
import memoize from 'memoizee';

import type { EExchangeName } from '../../types/domain/exchange.ts';
import type { TInstrument, TInstrumentKind } from '../../types/domain/instrument';
import { EInstrumentKindType, EInstrumentStatus } from '../../types/domain/instrument';
import { linkTemplatesFactory } from './linkTemplates';

export const getExchangeLinkByName = memoize(getLink, { max: 100 });

function getLink(instrument: TProviderInstrument & { exchange: string }): URL | undefined;
function getLink(
    instrument: Pick<TInstrument, 'name' | 'status' | 'exchange'> & {
        kind: Pick<TInstrumentKind, 'type'>;
    },
): URL | undefined;
function getLink(
    instrument:
        | (Pick<TInstrument, 'name' | 'status' | 'exchange'> & {
              kind: Pick<TInstrumentKind, 'type'>;
          })
        | (TProviderInstrument & { exchange: string }),
): URL | undefined {
    if (isProviderInstrument(instrument)) {
        const structKind = instrument.details.kind?.type;

        if (isNil(structKind)) {
            return undefined;
        }

        const { name, exchange } = instrument;

        const type = structKindToInstrumentKind(structKind);
        const base = getBaseCurrency(instrument.details);
        const quote = getQuoteCurrency(instrument.details);
        const option = getOptionFromName(name);

        return linkTemplatesFactory[exchange as EExchangeName]?.({
            base,
            quote,
            name,
            option,
            type,
        });
    }

    if (
        instrument.status !== EInstrumentStatus.Trading ||
        linkTemplatesFactory[instrument.exchange] === undefined
    ) {
        return undefined;
    }

    const {
        kind,
        kind: { type },
        name,
        exchange,
    } = instrument;
    const base = 'baseCurrencyName' in kind ? (kind.baseCurrencyName as string) : undefined;
    const quote = 'quoteCurrencyName' in kind ? (kind.quoteCurrencyName as string) : undefined;
    const option = getOptionFromName(name);

    return linkTemplatesFactory[exchange]?.({ base, quote, name, option, type });
}

function isProviderInstrument(
    instrument:
        | (Pick<TInstrument, 'name' | 'status' | 'exchange'> & {
              kind: Pick<TInstrumentKind, 'type'>;
          })
        | TProviderInstrument,
): instrument is TProviderInstrument {
    return 'details' in instrument && 'kind' in instrument.details;
}

function structKindToInstrumentKind(
    structKind: Exclude<TProviderInstrumentDetails['kind'], undefined>['type'],
): EInstrumentKindType {
    switch (structKind) {
        case 'instantSpot':
            return EInstrumentKindType.InstantSpot;
        case 'spotDetails':
            return EInstrumentKindType.Spot;
        case 'futuresDetails':
            return EInstrumentKindType.Futures;
        case 'perpFutures':
            return EInstrumentKindType.PerpFutures;
        case 'option':
            return EInstrumentKindType.Option;
        case 'instrumentSwap':
            return EInstrumentKindType.InstrumentSwap;
        default:
            assertNever(structKind);
    }
}

function getBaseCurrency(details: TProviderInstrumentDetails): string | undefined {
    if (isNil(details.kind)) {
        return undefined;
    }

    const structKind = details.kind.type;

    switch (structKind) {
        case 'instantSpot':
            return details.kind.instantSpot.baseAssetName;

        case 'spotDetails':
            return details.kind.spotDetails.baseAssetName;

        case 'futuresDetails':
        case 'perpFutures':
        case 'option':
        case 'instrumentSwap':
            return undefined;

        default:
            assertNever(structKind);
    }
}

function getQuoteCurrency(details: TProviderInstrumentDetails): string | undefined {
    if (isNil(details.kind)) {
        return undefined;
    }

    const structKind = details.kind.type;

    switch (structKind) {
        case 'instantSpot':
            return details.kind.instantSpot.quoteAssetName;

        case 'spotDetails':
            return details.kind.spotDetails.quoteAssetName;

        case 'futuresDetails':
        case 'perpFutures':
        case 'option':
        case 'instrumentSwap':
            return undefined;

        default:
            assertNever(structKind);
    }
}

function getOptionFromName(name: string): string {
    return name.match(/^(\w+-\w+).*$/)?.[1] ?? '';
}
