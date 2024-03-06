import { THerodotusTradesData } from '../../../lib/interfaces/herodotus-trades/herodotusTradesData';

export function getDataTradesT0071(): THerodotusTradesData {
    return {
        URL: '/?socket=autocmn&taskId=71&robotId=1017&name=%E2%84%9671%3A%20Buy%200.001%20BTC&timeZone=UTC\n',
        platformTime: '2023-06-01 09:48:20.017',
        exchangeTime: '2023-06-01 09:48:19.889',
        instrument: 'BTCUSDT',
        market: 'BinanceSpot',
        base: 'BTC',
        quote: 'USDT',
        type: 'Limit',
        role: 'Taker',
        price: '26928.0',
        size: '0.001',
        volume: '26.928',
        fee: 'BNB',
        feeAmount: '0.00002649',
        id: '10000129170',
    };
}
