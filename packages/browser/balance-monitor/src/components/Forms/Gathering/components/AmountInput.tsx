import {
    EGatheringTabSelectors,
    GatheringTabProps,
} from '@frontend/common/e2e/selectors/balance-monitor/components/gathering/gathering.page.selectors';
import { FormikForm, FormikInputNumber, TWithFormik } from '@frontend/common/src/components/Formik';
import type { TWithClassname } from '@frontend/common/src/types/components';
import { isSyncDesc } from '@frontend/common/src/utils/ValueDescriptor';
import { isNil } from 'lodash-es';
import { memo, useMemo } from 'react';

import type { TConvertRatesDescriptor } from '../../../../modules/observables/ModuleConvertRates';
import { CONVERSION_DIGITS } from '../../../defs';
import { formatQuoteAmount } from '../../../utils';
import type { TGatheringFormProps } from '../defs';
export const AmountInput = memo(
    ({
        className,
        formik: {
            values: { coin, amount },
        },
        convertRatesDescriptor,
    }: TWithClassname &
        TWithFormik<Partial<TGatheringFormProps>> & {
            convertRatesDescriptor: TConvertRatesDescriptor;
        }) => {
        const amountTitle = useMemo(() => {
            if (
                !isSyncDesc(convertRatesDescriptor) ||
                isNil(amount) ||
                amount === 0 ||
                isNil(coin)
            ) {
                return 'Amount';
            }

            const amountUsd = formatQuoteAmount(
                amount,
                convertRatesDescriptor.value.get(coin),
                CONVERSION_DIGITS,
            );

            if (isNil(amountUsd)) {
                return 'Amount';
            }

            return `Amount ~ ${amountUsd}`;
        }, [convertRatesDescriptor, amount, coin]);

        return (
            <FormikForm.Item className={className} name="amount" label={amountTitle}>
                <FormikInputNumber
                    {...GatheringTabProps[EGatheringTabSelectors.AmountInput]}
                    name="amount"
                    disabled={isNil(coin)}
                    min={0}
                />
            </FormikForm.Item>
        );
    },
);
