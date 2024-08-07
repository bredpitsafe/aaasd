import { TDataTaskHerodotus } from '../../../lib/interfaces/herodotus-robot/dataTackHerodotus';

export function getDataTasksKrakenSpot(): TDataTaskHerodotus {
    return {
        exchange: 'KrakenSpot',
        account: 'V:28521:krakenSpot.e2e',
        baseAsset: ['BTC', 'DOGE', 'PEPE'],
        instrument: ['XBT/USD', 'XDG/USD', 'PEPE/USD'],
        amountStep: [0.00000001, 0.00000001, 0.00001],
        amountMultiplier: [1, 1, 1],
        amount: [0.00000001, 0.00000001, 0.00001],
        maxPrice: [10000, 0.01, 0.0000001],
    };
}
