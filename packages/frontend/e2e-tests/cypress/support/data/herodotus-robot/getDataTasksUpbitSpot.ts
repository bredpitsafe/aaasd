import { TDataTaskHerodotus } from '../../../lib/interfaces/herodotus-robot/dataTackHerodotus';

export function getDataTasksUpbitSpot(): TDataTaskHerodotus {
    return {
        exchange: 'UpbitSpot',
        account: 'V:27921:upbitSpot.e2e',
        baseAsset: ['BTC', 'DOGE'],
        instrument: ['KRW-BTC', 'KRW-DOGE'],
        amountStep: [0.00000001, 0.00000001],
        amountMultiplier: [1, 1],
        amount: [0.00000001, 0.00000001],
        maxPrice: [10000, 0.01],
    };
}
