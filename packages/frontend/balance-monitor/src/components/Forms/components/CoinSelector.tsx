import {
    CommonRuleTabProps,
    ECommonRuleTabSelectors,
} from '@frontend/common/e2e/selectors/balance-monitor/components/common-rules/common-rule.tab.selectors';
import { FormikForm } from '@frontend/common/src/components/Formik';
import { FormikRadioMultipleSelect } from '@frontend/common/src/components/Formik/components/FormikRadioMultipleSelect';
import type { TWithClassname } from '@frontend/common/src/types/components';
import type {
    TCoinId,
    TFullInfoByCoin,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { EWideCoins } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { isEmpty } from 'lodash-es';
import type { ReactNode } from 'react';
import { memo, useMemo } from 'react';

import { CoinWithIcon } from '../../CoinWithIcon';
import { DEFAULT_FILTER_OPTION } from '../../utils';

const RADIO_OPTIONS = [
    {
        label: 'All',
        value: EWideCoins.All,
    },
] as { label: ReactNode; value: EWideCoins }[];

export const CoinSelector = memo(
    ({
        className,
        coinInfo,
    }: TWithClassname & {
        coinInfo: ReadonlyMap<TCoinId, TFullInfoByCoin>;
    }) => {
        const coins = useMemo(() => Array.from(coinInfo.keys()).sort(), [coinInfo]);

        const coinOptions = useMemo(
            () =>
                (coins ?? []).map((coin) => ({
                    label: <CoinWithIcon coin={coin} />,
                    value: coin,
                })),

            [coins],
        );

        return (
            <FormikForm.Item className={className} name="coinsMatchRule" label="Coin">
                <FormikRadioMultipleSelect
                    {...CommonRuleTabProps[ECommonRuleTabSelectors.CoinSelector]}
                    name="coinsMatchRule"
                    showSearch
                    options={coinOptions}
                    allowClear
                    disabled={isEmpty(coinOptions)}
                    filterOption={DEFAULT_FILTER_OPTION}
                    radioOptions={RADIO_OPTIONS}
                    placeholder="Select Coins"
                />
            </FormikForm.Item>
        );
    },
);
