import { TDataTaskHerodotus } from '../../../lib/interfaces/herodotus-robot/dataTackHerodotus';

export function getDataTasksOkexSwap(): TDataTaskHerodotus {
    return {
        exchange: 'OkexSwap',
        account: 'V:27821:okexSwap.e2e',
        baseAsset: ['BTC', 'DOGE', 'PEPE'],
        instrument: ['BTC-USDT-SWAP', 'DOGE-USDT-SWAP', 'PEPE-USDT-SWAP'],
        amountStep: [0.01, 1000, 10000000],
        amountMultiplier: [1, 1, 1],
        amount: [0.01, 1000, 10000000],
        maxPrice: [10000, 0.01, 0.0000001],
    };
}
