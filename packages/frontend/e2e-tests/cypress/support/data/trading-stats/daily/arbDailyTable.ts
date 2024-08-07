import { TArbTableData } from '../../../../lib/interfaces/trading-stats/arbTableData';

export function getDataARBTable(): TArbTableData {
    return {
        strategy: 'sC',
        exchAsset: '',
        trades: '855',
        volume: '$3.03M',
        lastTrade: ':',
        fees: '$101.39',
        maker: '99.2%',
        taker: '0.8%',
        makerV: '$3,008,955.55',
        takerV: '$23,631.88',
    };
}
