import { TDataTaskHerodotus } from '../../../lib/interfaces/herodotus-robot/dataTackHerodotus';

export function getDataTasksOkexSpot(): TDataTaskHerodotus {
    return {
        exchange: 'OkexSpot',
        account: 'V:27721:okexSpot.e2e',
        baseAsset: ['BTC', 'DOGE', 'PEPE'],
        instrument: ['BTC-USDT', 'DOGE-USDT', 'PEPE-USDT'],
        amountStep: [0.00000001, 0.000001, 1],
        amountMultiplier: [1, 1, 1],
        amount: [0.00000001, 0.000001, 1],
        maxPrice: [10000, 0.01, 0.0000001],
    };
}
