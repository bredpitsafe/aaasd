import { TTradesTableData } from '../../../../lib/interfaces/trading-stats/tradesTableData';

export function getDataTradesTable(): TTradesTableData {
    return {
        platformTime: '2023-06-05 01:59:47.376',
        exchangeTime: '2023-06-05 01:59:47.276',
        strategy: 'sB',
        robot: 'test_quoter_robot.BnQuoteB',
        exch: 'BinanceSwap',
        gate: 'Backtest.Backtest',
        virtAcc: 'bh.SQX',
        account: 'BH.backtestAccount',
        instr: 'BTCUSDT',
        role: 'Maker',
        side: 'Ask',
        price: '27037.0',
        baseAmt: '1.158',
        baseAsset: 'BTC',
        quoteAmt: '31308.846',
        quoteAsset: 'USDT',
        feeAmt: '0.0',
        feeAsset: '',
        orderTag: 'tag_a_2',
    };
}
