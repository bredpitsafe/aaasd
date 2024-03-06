import memoize from 'memoizee';

import { EInstrumentStatus, TInstrument, TInstrumentKind } from '../../types/domain/instrument';
import { linkTemplatesFactory } from './linkTemplates';

export const getExchangeLinkByName = memoize(
    (
        instrument: Pick<TInstrument, 'name' | 'status' | 'exchange'> & {
            kind: Pick<TInstrumentKind, 'type'>;
        },
    ): URL | undefined => {
        if (
            instrument.status !== EInstrumentStatus.Trading ||
            linkTemplatesFactory[instrument.exchange] === undefined
        ) {
            return undefined;
        }

        const kind = instrument.kind;
        const base = 'baseCurrencyName' in kind ? (kind.baseCurrencyName as string) : undefined;
        const quote = 'quoteCurrencyName' in kind ? (kind.quoteCurrencyName as string) : undefined;
        const option = instrument.name.match(/^(\w+-\w+).*$/)?.[1] ?? '';
        const name = instrument.name;
        const type = instrument.kind.type;

        return linkTemplatesFactory[instrument.exchange]({ base, quote, name, option, type });
    },
    { max: 100 },
);
