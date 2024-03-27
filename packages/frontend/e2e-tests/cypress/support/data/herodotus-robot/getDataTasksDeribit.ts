import { TDataTaskHerodotus } from '../../../lib/interfaces/herodotus-robot/dataTackHerodotus';

export function getDataTasksDeribit(): TDataTaskHerodotus {
    return {
        exchange: 'Deribit',
        account: 'V:28321:deribit.e2e',
        baseAsset: ['BTC', 'DOGE'],
        instrument: ['BTC_USDC-PERPETUAL', 'DOGE_USDC-PERPETUAL'],
        amountStep: [0.001, 100],
        amountMultiplier: [1, 1],
        amount: [0.001, 100],
        maxPrice: [10000, 0.01],
    };
}
