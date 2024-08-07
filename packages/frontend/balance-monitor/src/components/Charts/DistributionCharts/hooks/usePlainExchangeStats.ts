import type { TCoinId, TExchangeId } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import type { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types.ts';
import {
    createSyncedValueDescriptor,
    matchValueDescriptor,
} from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import { useMemo } from 'react';

import type { TCoinInfoDescriptor } from '../../../../modules/actions/ModuleSubscribeToCoinInfoOnCurrentStage.ts';
import type { TPlainExchangeStats } from '../defs';

export type TPlainExchangeStatsDescriptor = TValueDescriptor2<null | TPlainExchangeStats[]>;

export function usePlainExchangeStats(
    coin: TCoinId | undefined,
    coinInfoDescriptor: TCoinInfoDescriptor,
): TPlainExchangeStatsDescriptor {
    return useMemo(() => {
        if (coin === undefined) {
            return createSyncedValueDescriptor(null);
        }

        return matchValueDescriptor(coinInfoDescriptor, ({ value: coinInfo }) => {
            const exchangeStats = coinInfo.get(coin)?.exchangeStats;

            if (exchangeStats === undefined) {
                return createSyncedValueDescriptor(null);
            }

            return createSyncedValueDescriptor(
                Object.entries(exchangeStats).map(
                    ([exchangeName, exchangeInfo]): TPlainExchangeStats => ({
                        coin,
                        exchangeName: exchangeName as TExchangeId,
                        ...exchangeInfo,
                    }),
                ),
            );
        });
    }, [coin, coinInfoDescriptor]);
}
