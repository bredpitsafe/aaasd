import { iso2milliseconds } from '@common/utils';
import { EExchangeName } from '@frontend/common/src/types/domain/exchange';
import type {
    TBaseAssetStat,
    TDailyStats,
    TExchangeStat,
} from '@frontend/common/src/types/domain/tradingStats';

import type { TArbStatsDailyAsset } from '../components/Tables/ArbStatsDaily/types';
import { EArbStatsBreakdownType } from '../components/Tables/ArbStatsDaily/types';

const EXCHANGE_WITHOUT_AGGREGATION = EExchangeName.Internal;

export function getDailyArbData(
    exchangeStats: TDailyStats['exchangeStats'],
    baseAssetStats: TDailyStats['baseAssetStats'],
): TArbStatsDailyAsset[] {
    const exchangeData = exchangeStats.map((item) => getTableAsset(item));
    const baseAssetData = baseAssetStats.map((item) => getTableAsset(item));

    return exchangeData.concat(baseAssetData);
}

function getTableAsset(stat: TExchangeStat | TBaseAssetStat): TArbStatsDailyAsset {
    const isExchange = isExchangeStat(stat);
    const breakdown = isExchange
        ? EArbStatsBreakdownType.ExchangeWise
        : EArbStatsBreakdownType.AssetWise;
    const key = isExchange ? stat.exchangeName : stat.assetId;
    const strategy = stat.strategy || 'No Strategy';

    return {
        key: `${strategy}.${breakdown}.${key}`,
        strategy,
        breakdown,
        entityName: isExchange ? stat.exchangeName : stat.assetName,
        fees: getFees(stat.fees),
        feesUsd: getFeesUsd(stat.fees),
        lastTrade: iso2milliseconds(stat.lastTradeTime),
        makerVolumeUsd: stat.makerVolumeUsd,
        takerVolumeUsd: stat.takerVolumeUsd,
        tradesToday: stat.tradeCount,
        volumeUsdToday: stat.volumeUsd,
        shouldAggregate: !(isExchange && stat.exchangeName === EXCHANGE_WITHOUT_AGGREGATION),
    };
}

function getFees(fees: TExchangeStat['fees']): TArbStatsDailyAsset['fees'] {
    return fees.map((fee) => ({
        assetName: fee.assetName,
        value: fee.amount,
    }));
}

function getFeesUsd(fees: TExchangeStat['fees']): TArbStatsDailyAsset['feesUsd'] {
    return fees.reduce((acc, fee) => {
        if (fee.amountUsd !== null) {
            return acc + fee.amountUsd;
        }
        return acc;
    }, 0);
}

function isExchangeStat(v: TExchangeStat | TBaseAssetStat): v is TExchangeStat {
    return 'exchangeName' in v;
}
