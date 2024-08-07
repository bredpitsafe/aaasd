import { THerodotusTradesData } from '../../../lib/interfaces/herodotus-trades/herodotusTradesData';

export function getDataHerodotusTrades(): THerodotusTradesData {
    return {
        URL: '/?socket=autocmn&taskId=77&robotId=1017&name=%C2%8477%3A%20Buy%200.001%20BTC&timeZone=UTC',
        platformTime: '2023-06-01',
        exchangeTime: '2023-06-01',
        instrument: 'BTCUSDT',
        market: 'BinanceSpot',
        base: 'BTC',
        quote: 'USDT',
        type: 'Limit',
        role: 'Taker',
        price: '26926.9',
        size: '0.001',
        volume: '26.9269',
        fee: 'BNB',
        feeAmount: '0.00002648',
        id: '20000129170',
    };
}
