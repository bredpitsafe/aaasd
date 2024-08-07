import type { KeyByType } from '@common/types';
import {
    CommonRuleTabProps,
    ECommonRuleTabSelectors,
} from '@frontend/common/e2e/selectors/balance-monitor/components/common-rules/common-rule.tab.selectors';
import { FormikForm } from '@frontend/common/src/components/Formik';
import { FormikRadioMultipleSelect } from '@frontend/common/src/components/Formik/components/FormikRadioMultipleSelect';
import type { TWithClassname } from '@frontend/common/src/types/components';
import type {
    TAccountInfo,
    TCoinId,
    TFullInfoByCoin,
    TRuleExchanges,
    TTransfer,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { EWideExchanges } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import type { FormikProps } from 'formik';
import { uniq } from 'lodash-es';
import type { ReactNode } from 'react';
import { memo, useMemo } from 'react';

import { ExchangeWithIcon } from '../../ExchangeWithIcon';
import { DEFAULT_FILTER_OPTION } from '../../utils';
import type { TRuleCommonFormData } from './defs';

const RADIO_OPTIONS = [
    {
        label: 'All',
        value: EWideExchanges.All,
    },
] as { label: ReactNode; value: EWideExchanges }[];

export const ExchangeSelector = memo(
    ({
        className,
        formik: { values },
        coinInfo,
        label,
        accountInfoField,
        exchangeField,
    }: TWithClassname & {
        formik: FormikProps<Partial<TRuleCommonFormData>>;
        coinInfo: ReadonlyMap<TCoinId, TFullInfoByCoin>;
        label: string;
        accountInfoField: KeyByType<TTransfer, TAccountInfo>;
        exchangeField: KeyByType<TRuleCommonFormData, TRuleExchanges>;
    }) => {
        const exchanges = useMemo(
            () =>
                uniq(
                    Array.from(coinInfo.values())
                        .filter(
                            ({ coin }) =>
                                !Array.isArray(values.coinsMatchRule) ||
                                values.coinsMatchRule.includes(coin),
                        )
                        .map(({ graph: { possibleTransfers } }) =>
                            possibleTransfers.map(
                                ({ [accountInfoField]: { exchange } }) => exchange,
                            ),
                        )
                        .flat(),
                ).sort(),
            [coinInfo, accountInfoField, values.coinsMatchRule],
        );

        const exchangeOptions = useMemo(
            () =>
                exchanges?.map((exchange) => ({
                    label: <ExchangeWithIcon exchange={exchange} />,
                    value: exchange,
                })),

            [exchanges],
        );

        return (
            <FormikForm.Item className={className} name={exchangeField} label={label}>
                <FormikRadioMultipleSelect
                    {...CommonRuleTabProps[ECommonRuleTabSelectors.ExchangeSelector]}
                    name={exchangeField}
                    showSearch
                    options={exchangeOptions}
                    allowClear
                    filterOption={DEFAULT_FILTER_OPTION}
                    radioOptions={RADIO_OPTIONS}
                    placeholder="Select Exchanges"
                />
            </FormikForm.Item>
        );
    },
);
