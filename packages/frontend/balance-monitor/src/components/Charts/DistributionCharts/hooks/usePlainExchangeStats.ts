import type { TCoinId, TExchangeId } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import type { TFail } from '@frontend/common/src/types/Fail';
import {
    ExtractValueDescriptor,
    matchDesc,
    ValueDescriptorFactory,
} from '@frontend/common/src/utils/ValueDescriptor';
import { useMemo } from 'react';

import type { TCoinInfoDescriptor } from '../../../../modules/observables/ModuleCoinInfo';
import type { TPlainExchangeStats } from '../defs';

const plainExchangeStatsDescriptorFactory = ValueDescriptorFactory<
    TPlainExchangeStats[],
    TFail<'[CoinInfo]: UNKNOWN'>
>();

export type TPlainExchangeStatsDescriptor = ExtractValueDescriptor<
    typeof plainExchangeStatsDescriptorFactory
>;

export function usePlainExchangeStats(
    coin: TCoinId | undefined,
    coinInfoDescriptor: TCoinInfoDescriptor,
): TPlainExchangeStatsDescriptor {
    return useMemo(() => {
        if (coin === undefined) {
            return plainExchangeStatsDescriptorFactory.sync([], null);
        }

        return matchDesc(coinInfoDescriptor, {
            idle: () => plainExchangeStatsDescriptorFactory.idle(),
            unsynchronized: () => plainExchangeStatsDescriptorFactory.unsc(null),
            synchronized: (coinInfo) => {
                const exchangeStats = coinInfo.get(coin)?.exchangeStats;

                if (exchangeStats === undefined) {
                    return plainExchangeStatsDescriptorFactory.sync([], null);
                }

                return plainExchangeStatsDescriptorFactory.sync(
                    Object.entries(exchangeStats).map(
                        ([exchangeName, exchangeInfo]): TPlainExchangeStats => ({
                            coin,
                            exchangeName: exchangeName as TExchangeId,
                            ...exchangeInfo,
                        }),
                    ),
                    null,
                );
            },
            fail: (fail) => plainExchangeStatsDescriptorFactory.fail(fail),
        });
    }, [coin, coinInfoDescriptor]);
}
