import { TTradesTableData } from '../../../../lib/interfaces/trading-stats/tradesTableData';

export function getDataTradesTable(): TTradesTableData {
    return {
        platformTime: '2023-06-06 00:09:55.758',
        exchangeTime: '2023-06-06 00:09:55.755',
        strategy: 'sA',
        robot: 'test_quoter_robot.BnQuoteA',
        exch: 'BinanceSpot',
        gate: 'Backtest.Backtest',
        virtAcc: 'bn.SQX',
        account: 'BN.backtestAccount',
        instr: 'BTCUSDC',
        role: 'Maker',
        side: 'Ask',
        price: '25725.56',
        baseAmt: '0.36153',
        baseAsset: 'BTC',
        volumeAmt: '9300.5617068',
        volumeAsset: 'USDC',
        feeAmt: '0.0',
        feeAsset: 'USDC',
        orderTag: 'tag_a_1',
    };
}
