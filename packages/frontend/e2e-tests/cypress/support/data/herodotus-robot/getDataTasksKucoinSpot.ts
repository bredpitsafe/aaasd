import { TDataTaskHerodotus } from '../../../lib/interfaces/herodotus-robot/dataTackHerodotus';

export function getDataTasksKucoinSpot(): TDataTaskHerodotus {
    return {
        exchange: 'KucoinSpot',
        account: 'V:28621:kucoinSpot.e2e',
        baseAsset: ['BTC', 'DOGE', 'PEPE'],
        instrument: ['BTC-USDT', 'DOGE-USDT', 'PEPE-USDT'],
        amountStep: [0.00000001, 0.0001, 1],
        amountMultiplier: [1, 1, 1],
        amount: [0.00000001, 0.0001, 1],
        maxPrice: [10000, 0.01, 0.0000001],
    };
}
