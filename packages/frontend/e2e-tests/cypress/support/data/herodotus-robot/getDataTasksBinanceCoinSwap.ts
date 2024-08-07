import { TDataTaskHerodotus } from '../../../lib/interfaces/herodotus-robot/dataTackHerodotus';

export function getDataTasksBinanceCoinSwap(): TDataTaskHerodotus {
    return {
        exchange: 'BinanceCoinSwap',
        account: 'V:27621:binanceCoinSwap.e2e',
        baseAsset: ['USD'],
        instrument: ['BTCUSD_PERP'],
        amountStep: [100],
        amountMultiplier: [100],
        amount: [10000],
        maxPrice: [100],
    };
}
