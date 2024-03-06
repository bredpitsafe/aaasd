import { THerodotusTradesData } from '../../../lib/interfaces/herodotus-trades/herodotusTradesData';

export function getDataTradesT0525(): THerodotusTradesData {
    return {
        URL: '/?socket=autocmn&taskId=525&robotId=1017&name=%E2%84%96525%3A%20Buy%200.001%20BTC&timeZone=UTC\n',
        platformTime: '2023-06-07 14:40:22.733',
        exchangeTime: '2023-06-07 14:40:22.611',
        instrument: 'BTCUSDT',
        market: 'BinanceSpot',
        base: 'BTC',
        quote: 'USDT',
        type: 'Limit',
        role: 'Taker',
        price: '26457.94',
        size: '0.001',
        volume: '26.45794',
        fee: 'BNB',
        feeAmount: '0.00003073',
        id: '10000329184',
    };
}
