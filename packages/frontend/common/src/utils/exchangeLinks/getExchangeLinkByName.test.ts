import { EExchangeName } from '../../types/domain/exchange';
import type { TInstrument } from '../../types/domain/instrument';
import { EInstrumentKindType, EInstrumentStatus } from '../../types/domain/instrument';
import { getExchangeLinkByName } from './getExchangeLinkByName';

describe('getExchangeLinkByName', () => {
    const baseInstrument: Pick<TInstrument, 'name' | 'kind' | 'status' | 'exchange'> = {
        exchange: EExchangeName.BinanceSpot,
        kind: {
            type: EInstrumentKindType.InstantSpot,
            baseCurrency: 123,
            baseCurrencyName: 'BTC',
            quoteCurrency: 456,
            quoteCurrencyName: 'USD',
        },
        name: 'BTCUSD',
        status: EInstrumentStatus.Trading,
    };

    const cases: [EExchangeName, EInstrumentKindType][] = [
        [EExchangeName.BinanceSpot, EInstrumentKindType.InstantSpot],
        [EExchangeName.BinanceSwap, EInstrumentKindType.PerpFutures],
        [EExchangeName.BinanceCoinSwap, EInstrumentKindType.PerpFutures],
        [EExchangeName.KrakenSpot, EInstrumentKindType.InstantSpot],
        [EExchangeName.PoloniexSpot, EInstrumentKindType.InstantSpot],
        [EExchangeName.OkexSpot, EInstrumentKindType.InstantSpot],
        [EExchangeName.OkexSwap, EInstrumentKindType.PerpFutures],
        [EExchangeName.BithumbSpot, EInstrumentKindType.InstantSpot],
        [EExchangeName.HuobiSpot, EInstrumentKindType.InstantSpot],
        [EExchangeName.UpbitSpot, EInstrumentKindType.InstantSpot],
        [EExchangeName.BybitSpot, EInstrumentKindType.InstantSpot],
        [EExchangeName.KucoinSpot, EInstrumentKindType.InstantSpot],
        [EExchangeName.GateioSpot, EInstrumentKindType.InstantSpot],
        [EExchangeName.CoinbaseSpot, EInstrumentKindType.InstantSpot],
    ];

    it.each(cases)(
        'exchange: %p, type: %p',
        (exchange: EExchangeName, type: EInstrumentKindType) => {
            const instrument = {
                ...baseInstrument,
                exchange,
                kind: { ...baseInstrument.kind, type },
            };
            const result = getExchangeLinkByName(instrument);
            expect(result).not.toBeUndefined();
            expect(result?.href).toMatchSnapshot();
        },
    );

    it('should return undefined when status is not `Trading` or `CancelOnly`', () => {
        Object.values(EExchangeName).map((name) => {
            Object.values(EInstrumentStatus).map((status) => {
                if (status === EInstrumentStatus.Trading || EInstrumentStatus.CancelOnly) {
                    return;
                }

                const instrument = {
                    ...baseInstrument,
                    exchange: name,
                    status,
                };
                expect(getExchangeLinkByName(instrument)).toBeUndefined();
            });
        });
    });
});
