import { TDataTaskHerodotus } from '../../../lib/interfaces/herodotus-robot/dataTackHerodotus';

export function getDataTasksGateioSpot(): TDataTaskHerodotus {
    return {
        exchange: 'GateioSpot',
        account: 'V:28721:gateioSpot.e2e',
        baseAsset: ['BTC', 'DOGE', 'PEPE'],
        instrument: ['BTC_USDT', 'DOGE_USDT', 'PEPE_USDT'],
        amountStep: [0.00001, 0.01, 1],
        amountMultiplier: [1, 1, 1],
        amount: [0.00001, 0.01, 1],
        maxPrice: [10000, 0.01, 0.0000001],
    };
}
