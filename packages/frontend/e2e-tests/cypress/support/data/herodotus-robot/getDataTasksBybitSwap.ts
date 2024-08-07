import { TDataTaskHerodotus } from '../../../lib/interfaces/herodotus-robot/dataTackHerodotus';

export function getDataTasksBybitSwap(): TDataTaskHerodotus {
    return {
        exchange: 'BybitSwap',
        account: 'V:28221:bybitSwap.e2e',
        baseAsset: ['BTC', 'DOGE'],
        instrument: ['BTCUSDT', 'DOGEUSDT'],
        amountStep: [0.001, 1],
        amountMultiplier: [1, 1],
        amount: [0.001, 1],
        maxPrice: [10000, 0.01],
    };
}
