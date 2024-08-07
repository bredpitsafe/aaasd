import {
    EGatheringTabSelectors,
    GatheringTabProps,
} from '@frontend/common/e2e/selectors/balance-monitor/components/gathering/gathering.page.selectors';
import type { TWithFormik } from '@frontend/common/src/components/Formik';
import { FormikForm } from '@frontend/common/src/components/Formik';
import { FormikSelect } from '@frontend/common/src/components/Formik/components/FormikSelect';
import type { TWithClassname } from '@frontend/common/src/types/components';
import type { TExchangeId } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { memo, useEffect, useMemo } from 'react';

import { ExchangeWithIcon } from '../../../ExchangeWithIcon';
import { DEFAULT_FILTER_OPTION } from '../../../utils';
import type { TGatheringFormProps } from '../defs';
export const ExchangeSelector = memo(
    ({
        className,
        formik: { setFieldValue },
        exchanges,
    }: TWithClassname &
        TWithFormik<Partial<TGatheringFormProps>> & {
            exchanges: TExchangeId[];
        }) => {
        useEffect(() => {
            if (exchanges.length === 1) {
                setFieldValue('exchange', exchanges[0], true);
            }
        }, [exchanges, setFieldValue]);

        const exchangeOptions = useMemo(
            () =>
                exchanges?.map((exchange) => ({
                    label: <ExchangeWithIcon exchange={exchange} />,
                    value: exchange,
                })),

            [exchanges],
        );

        return (
            <FormikForm.Item className={className} name="exchange" label="Exchange">
                <FormikSelect
                    {...GatheringTabProps[EGatheringTabSelectors.ExchangeSelector]}
                    name="exchange"
                    showSearch
                    options={exchangeOptions}
                    allowClear
                    filterOption={DEFAULT_FILTER_OPTION}
                    placeholder="Select Exchange"
                    disabled={exchanges.length === 1}
                />
            </FormikForm.Item>
        );
    },
);
