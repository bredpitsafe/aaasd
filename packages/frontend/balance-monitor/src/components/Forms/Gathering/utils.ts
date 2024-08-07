import type {
    TAmount,
    TCoinId,
    TExchangeId,
    TFullInfoByCoin,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { isNil } from 'lodash-es';

export function getCoins(
    exchange: TExchangeId,
    coinInfo: ReadonlyMap<TCoinId, TFullInfoByCoin>,
): TCoinId[] {
    return Array.from(coinInfo.values())
        .filter((fullInfoByCoin) => !isNil(fullInfoByCoin.exchangeStats[exchange]))
        .map(({ coin }) => coin);
}

export function getExchangeBalance(
    exchange: TExchangeId,
    coin: TCoinId,
    coinInfo: ReadonlyMap<TCoinId, TFullInfoByCoin>,
): undefined | TAmount {
    return coinInfo.get(coin)?.exchangeStats[exchange]?.currentBalance;
}
