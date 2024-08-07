import {
    EGatheringTabSelectors,
    GatheringTabProps,
} from '@frontend/common/e2e/selectors/balance-monitor/components/gathering/gathering.page.selectors';
import type { TWithFormik } from '@frontend/common/src/components/Formik';
import { FormikForm } from '@frontend/common/src/components/Formik';
import { FormikSelect } from '@frontend/common/src/components/Formik/components/FormikSelect';
import type { TWithClassname } from '@frontend/common/src/types/components';
import type {
    TCoinId,
    TFullInfoByCoin,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { isEmpty, isNil } from 'lodash-es';
import { memo, useEffect, useMemo } from 'react';

import { CoinWithIcon } from '../../../CoinWithIcon';
import { DEFAULT_FILTER_OPTION } from '../../../utils';
import type { TGatheringFormProps } from '../defs';
import { getCoins } from '../utils';
export const CoinSelector = memo(
    ({
        className,
        formik: {
            values: { coin, exchange },
            setFieldValue,
        },
        coinInfo,
    }: TWithClassname &
        TWithFormik<Partial<TGatheringFormProps>> & {
            coinInfo: ReadonlyMap<TCoinId, TFullInfoByCoin>;
        }) => {
        const coins = useMemo(
            () => (isNil(exchange) ? [] : getCoins(exchange, coinInfo)),
            [coinInfo, exchange],
        );

        const coinOptions = useMemo(
            () =>
                (coins ?? []).map((coin) => ({
                    label: <CoinWithIcon coin={coin} />,
                    value: coin,
                })),

            [coins],
        );

        useEffect(() => {
            if (coins.length === 1 && coin !== coins[0]) {
                setFieldValue('coin', coins[0], true);
            } else if (!isNil(coin) && !coins.includes(coin)) {
                setFieldValue('coin', undefined, true);
            }
        }, [coin, coins, setFieldValue]);

        return (
            <FormikForm.Item className={className} name="coin" label="Coin">
                <FormikSelect
                    {...GatheringTabProps[EGatheringTabSelectors.CoinSelector]}
                    name="coin"
                    showSearch
                    options={coinOptions}
                    allowClear
                    disabled={isEmpty(coinOptions) || coins.length === 1}
                    filterOption={DEFAULT_FILTER_OPTION}
                    placeholder="Select Coin"
                />
            </FormikForm.Item>
        );
    },
);
