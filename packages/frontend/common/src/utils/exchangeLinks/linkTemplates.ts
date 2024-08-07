import { isNil } from 'lodash-es';

import type { TExchange } from '../../types/domain/exchange';
import { EExchangeName } from '../../types/domain/exchange';
import type {
    TInstrument,
    TInstrumentKind,
    TInstrumentKindBase,
} from '../../types/domain/instrument';
import { EInstrumentKindType } from '../../types/domain/instrument';

type TOptions = {
    name: TInstrument['name'];
    type: TInstrumentKind['type'];
    base?: TInstrumentKindBase['baseCurrencyName'];
    quote?: TInstrumentKindBase['quoteCurrencyName'];
    option?: string;
};
export const linkTemplatesFactory: Record<
    TExchange['name'],
    (options: TOptions) => URL | undefined
> = {
    [EExchangeName.BinanceSpot]: ({ base, quote }) => {
        if (isNil(base) || isNil(quote)) {
            return;
        }
        return new URL(`https://www.binance.com/en/trade/${base}_${quote}`);
    },
    [EExchangeName.BinanceSwap]: ({ type, name }) => {
        if (type !== EInstrumentKindType.PerpFutures) {
            return;
        }
        return new URL(`https://www.binance.com/en/futures/${name}`);
    },
    [EExchangeName.BinanceCoinSwap]: ({ type, name }) => {
        if (type !== EInstrumentKindType.PerpFutures) {
            return;
        }
        return new URL(`https://www.binance.com/en/delivery/${name.replace('PERP', 'perpetual')}`);
    },
    [EExchangeName.KrakenSpot]: ({ base, quote }) => {
        if (isNil(base) || isNil(quote)) {
            return;
        }
        return new URL(`https://trade.kraken.com/ru-ru/charts/KRAKEN:${base}-${quote}`);
    },
    [EExchangeName.PoloniexSpot]: ({ base, quote }) => {
        if (isNil(base) || isNil(quote)) {
            return;
        }
        return new URL(`https://poloniex.com/trade/${base}_${quote}/?type=spot`);
    },
    [EExchangeName.OkexSpot]: ({ base, quote }) => {
        if (isNil(base) || isNil(quote)) {
            return;
        }
        return new URL(
            `https://www.okx.com/ru/trade-spot/${base.toLowerCase()}-${quote.toLowerCase()}`,
        );
    },
    [EExchangeName.OkexSwap]: ({ base, quote }) => {
        if (isNil(base) || isNil(quote)) {
            return;
        }
        return new URL(
            `https://www.okx.com/ru/trade-swap/${base.toLowerCase()}-${quote.toLowerCase()}-swap`,
        );
    },
    [EExchangeName.BithumbSpot]: ({ base, quote }) => {
        if (isNil(base) || isNil(quote)) {
            return;
        }
        return new URL(`https://en.bithumb.com/trade/order/${base}_${quote}`);
    },
    [EExchangeName.HuobiSpot]: ({ base, quote }) => {
        if (isNil(base) || isNil(quote)) {
            return;
        }
        return new URL(
            `https://www.huobi.com/en-us/exchange/${base.toLowerCase()}_${quote.toLowerCase()}`,
        );
    },
    [EExchangeName.UpbitSpot]: ({ base, quote }) => {
        if (isNil(base) || isNil(quote)) {
            return;
        }
        return new URL(`https://upbit.com/exchange?code=CRIX.UPBIT.${quote}-${base}`);
    },
    [EExchangeName.BybitSpot]: ({ base, quote }) => {
        if (isNil(base) || isNil(quote)) {
            return;
        }
        return new URL(`https://www.bybit.com/ru-RU/trade/spot/${base}/${quote}`);
    },
    [EExchangeName.KucoinSpot]: ({ base, quote }) => {
        if (isNil(base) || isNil(quote)) {
            return;
        }
        return new URL(`https://www.kucoin.com/trade/${base}-${quote}`);
    },
    [EExchangeName.Deribit]: ({ base, option, name, type }) => {
        if (isNil(base) || isNil(option)) {
            return;
        }
        return new URL(`https://www.deribit.com/${type}/${base}/${option}/${name}`.toLowerCase());
    },
    [EExchangeName.GateioSpot]: ({ base, quote }) => {
        if (isNil(base) || isNil(quote)) {
            return;
        }
        return new URL(`https://www.gate.io/trade/${base}_${quote}`);
    },
    [EExchangeName.CoinbaseSpot]: ({ base, quote }) => {
        if (isNil(base) || isNil(quote)) {
            return;
        }
        return new URL(`https://exchange.coinbase.com/trade/${base}-${quote}`);
    },
    [EExchangeName.Internal]: () => {
        return undefined;
    },
};
