import { TDataTaskHerodotus } from '../../../lib/interfaces/herodotus-robot/dataTackHerodotus';

export function getDataTasksBinanceSpot(): TDataTaskHerodotus {
    return {
        exchange: 'BinanceSpot',
        account: 'V:27421:binanceSpot.e2e',
        baseAsset: ['BTC', 'DOGE', 'PEPE'],
        instrument: ['BTCUSDT', 'DOGEUSDT', 'PEPEUSDT'],
        amountStep: [0.00001, 1, 1],
        amountMultiplier: [1, 1, 1],
        amount: [0.00001, 1, 1],
        maxPrice: [10000, 0.01, 0.0000001],
    };
}
