export const ECurrency = <const>{
    USD: 'USD',
    EUR: 'EUR',
    GBP: 'GBP',
    UAH: 'UAH',
    KRW: 'KRW',
    JPY: 'JPY',
    TRY: 'TRY',
};

export const ECurrencySymbol = <const>{
    [ECurrency.USD]: '$',
    [ECurrency.EUR]: '€',
    [ECurrency.GBP]: '£',
    [ECurrency.UAH]: '₴',
    [ECurrency.KRW]: '₩',
    [ECurrency.JPY]: '¥',
    [ECurrency.TRY]: '₺',
};

export const EStableCoin = <const>{
    USDT: 'USDT',
    TUSD: 'TUSD',
    USDC: 'USDC',
    BUSD: 'BUSD',
    EURT: 'EURT',
};

export const ECoin = <const>{
    ...EStableCoin,
    BTC: 'BTC',
};

export const ECoinSymbol = <const>{
    [EStableCoin.USDT]: ECurrencySymbol.USD,
    [EStableCoin.TUSD]: ECurrencySymbol.USD,
    [EStableCoin.USDC]: ECurrencySymbol.USD,
    [EStableCoin.BUSD]: ECurrencySymbol.USD,
    [EStableCoin.EURT]: ECurrencySymbol.USD,
    [ECoin.BTC]: '₿',
};

export const DEFAULT_CURRENCY_SYMBOL = ECurrencySymbol.USD;
export const UNKNOWN_CURRENCY_SYMBOL = '???';
