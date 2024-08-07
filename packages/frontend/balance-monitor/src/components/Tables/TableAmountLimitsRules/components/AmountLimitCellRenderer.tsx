import type { Nil } from '@common/types';
import type { ICellRendererParams } from '@frontend/ag-grid';
import type { ValueGetterParams } from '@frontend/ag-grid';
import { AgValue } from '@frontend/ag-grid/src/AgValue';
import type {
    TAmount,
    TAmountLimitsRuleInfo,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { isNil } from 'lodash-es';
import type { ForwardedRef } from 'react';
import { forwardRef, memo, useContext } from 'react';

import { AmountWithUsdAmount } from '../../../AmountWithUsdAmount';
import { useShowCoinIcons } from '../../../Settings/hooks/useShowCoinIcons';
import { ConvertRatesContext } from './ConvertRatesContext';

type TValue = AgValue<undefined | TAmount, Pick<TAmountLimitsRuleInfo, 'amountCurrency'>>;

export const createAmountLimitCellValueGetter =
    (field: keyof Pick<TAmountLimitsRuleInfo, 'amountMin' | 'amountMax'>) =>
    ({ data }: ValueGetterParams<TAmountLimitsRuleInfo>): Nil | TValue => {
        return data && AgValue.create(data[field], data, ['amountCurrency']);
    };

export const AmountLimitCellRenderer = memo(
    forwardRef(({ value }: ICellRendererParams<TValue>, ref: ForwardedRef<HTMLElement>) => {
        const convertRates = useContext(ConvertRatesContext);
        const [showIcon] = useShowCoinIcons();

        if (isNil(value)) {
            return null;
        }

        return (
            <AmountWithUsdAmount
                ref={ref}
                amount={value.payload}
                coin={value.data.amountCurrency}
                convertRate={convertRates?.get(value.data.amountCurrency)}
                showIcon={showIcon}
            />
        );
    }),
);
