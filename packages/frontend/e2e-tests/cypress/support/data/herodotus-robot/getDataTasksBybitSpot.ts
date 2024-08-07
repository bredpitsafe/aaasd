import { TDataTaskHerodotus } from '../../../lib/interfaces/herodotus-robot/dataTackHerodotus';

export function getDataTasksBybitSpot(): TDataTaskHerodotus {
    return {
        exchange: 'BybitSpot',
        account: 'V:28121:bybitSpot.e2e',
        baseAsset: ['BTC', 'DOGE', 'PEPE'],
        instrument: ['BTCUSDT', 'DOGEUSDT', 'PEPEUSDT'],
        amountStep: [0.000001, 0.1, 1],
        amountMultiplier: [1, 1, 1],
        amount: [0.000001, 0.1, 1],
        maxPrice: [10000, 0.01, 0.0000001],
    };
}
