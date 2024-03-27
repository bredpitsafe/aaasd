import { TArbTableData } from '../../../../lib/interfaces/trading-stats/arbTableData';

export function getDataARBTable(): TArbTableData {
    return {
        strategy: 'sC',
        exchAsset: '',
        trades: '53892',
        volume: '$1.17B',
        lastTrade: ':',
        fees: '$0.00 ',
        maker: '93.2%',
        taker: '6.8%',
        makerV: '$1,087,430,073.69',
        takerV: '$79,583,478.98',
    };
}
