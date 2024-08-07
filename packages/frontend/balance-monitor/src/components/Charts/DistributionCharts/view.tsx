import {
    DistributionTabProps,
    EDistributionTabSelectors,
} from '@frontend/common/e2e/selectors/balance-monitor/components/distribution/distribution.page.selectors';
import { Select } from '@frontend/common/src/components/Select';
import type { TCoinId } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useSyncState } from '@frontend/common/src/utils/React/useSyncState';
import { isSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import { AgChartsReact } from 'ag-charts-react';
import type { DefaultOptionType } from 'rc-select/lib/Select';
import { memo, useMemo } from 'react';

import type { TCoinInfoDescriptor } from '../../../modules/actions/ModuleSubscribeToCoinInfoOnCurrentStage.ts';
import { DEFAULT_FILTER_OPTION } from '../../utils';
import { useChartOptions } from './hooks/useChartOptions';
import { usePlainExchangeStats } from './hooks/usePlainExchangeStats';
import { cnChart, cnContainer, cnHeader, cnHeaderSelect, cnHeaderTitle } from './view.css';

export const DistributionCharts = memo(
    ({
        coin,
        coinInfoDescriptor,
        onSetActiveCoin,
    }: {
        coin: TCoinId | undefined;
        coinInfoDescriptor: TCoinInfoDescriptor;
        onSetActiveCoin: (coin: TCoinId | undefined) => Promise<void>;
    }) => {
        const [selectedCoin, onChangeSelectedCoin] = useSyncState(coin, [coin]);

        const plainExchangeStatsDescriptor = usePlainExchangeStats(
            selectedCoin,
            coinInfoDescriptor,
        );

        const options = useChartOptions(coin, plainExchangeStatsDescriptor);

        const availableCoins = useMemo<DefaultOptionType[] | undefined>(() => {
            if (!isSyncedValueDescriptor(coinInfoDescriptor)) {
                return undefined;
            }

            return Array.from(coinInfoDescriptor.value.keys())
                .sort()
                .map((coin: TCoinId) => ({
                    label: coin,
                    value: coin,
                }));
        }, [coinInfoDescriptor]);

        const cbSetCoin = useFunction((coin: TCoinId | undefined) => {
            void onSetActiveCoin(coin);
            onChangeSelectedCoin(coin);
        });

        return (
            <div
                {...DistributionTabProps[EDistributionTabSelectors.DistributionTab]}
                className={cnContainer}
            >
                <div className={cnHeader}>
                    <h3 className={cnHeaderTitle}>Distribution</h3>
                    <Select
                        {...DistributionTabProps[EDistributionTabSelectors.CoinSelector]}
                        className={cnHeaderSelect}
                        size="small"
                        value={selectedCoin}
                        onChange={cbSetCoin}
                        loading={availableCoins === undefined}
                        options={availableCoins}
                        filterOption={DEFAULT_FILTER_OPTION}
                        allowClear
                        showSearch
                    />
                </div>
                <div className={cnChart}>
                    <AgChartsReact options={options} />
                </div>
            </div>
        );
    },
);
