export type TExchange = {
    name: EExchangeName | string;
};

export enum EExchangeName {
    BinanceSpot = 'BinanceSpot',
    BinanceSwap = 'BinanceSwap',
    BinanceCoinSwap = 'BinanceCoinSwap',
    KrakenSpot = 'KrakenSpot',
    PoloniexSpot = 'PoloniexSpot',
    OkexSpot = 'OkexSpot',
    OkexSwap = 'OkexSwap',
    BithumbSpot = 'BithumbSpot',
    HuobiSpot = 'HuobiSpot',
    UpbitSpot = 'UpbitSpot',
    BybitSpot = 'BybitSpot',
    KucoinSpot = 'KucoinSpot',
    Deribit = 'Deribit',
    GateioSpot = 'GateioSpot',
    CoinbaseSpot = 'CoinbaseSpot',
    Internal = 'Internal',
}
