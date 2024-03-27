import { TDataTaskHerodotus } from '../../../lib/interfaces/herodotus-robot/dataTackHerodotus';

export function getDataTasksBithumbSpot(): TDataTaskHerodotus {
    return {
        exchange: 'BithumbSpot',
        account: 'V:28021:bithumbSpot.e2e',
        baseAsset: ['BTC', 'DOGE', 'PEPE'],
        instrument: ['BTC_KRW', 'DOGE_KRW', 'PEPE_KRW'],
        amountStep: [0.0001, 0.0001, 0.0001],
        amountMultiplier: [1, 1, 1],
        amount: [0.0001, 0.0001, 0.0001],
        maxPrice: [10000, 0.01, 0.0000001],
    };
}
