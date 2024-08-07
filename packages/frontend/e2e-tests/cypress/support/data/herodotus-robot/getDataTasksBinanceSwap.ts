import { TDataTaskHerodotus } from '../../../lib/interfaces/herodotus-robot/dataTackHerodotus';

export function getDataTasksBinanceSwap(): TDataTaskHerodotus {
    return {
        exchange: 'BinanceSwap',
        account: 'V:27521:binanceSwap.e2e',
        baseAsset: ['BTC', 'DOGE', 'PEPE'],
        instrument: ['BTCUSDT', 'DOGEUSDT', '1000PEPEUSDT'],
        amountStep: [0.001, 1, 1000],
        amountMultiplier: [1, 1, 1000],
        amount: [0.001, 1, 1000000],
        maxPrice: [10000, 0.01, 0.0000001],
    };
}
