import { WarningOutlined } from '@ant-design/icons';
import type { ICellRendererParams } from '@frontend/ag-grid';
import type { ValueGetterParams } from '@frontend/ag-grid';
import { AgValue } from '@frontend/ag-grid/src/AgValue';
import cn from 'classnames';
import { isNil } from 'lodash-es';
import type { ForwardedRef } from 'react';
import { forwardRef, memo } from 'react';

import { CONVERSION_DIGITS } from '../../../defs';
import { getQuoteAmount } from '../../../utils';
import type { TPlainSuggestion } from '../defs';
import { EAmountNotification, EPlainSuggestionGroup } from '../defs';
import { cnAmountIcon, cnErrorColorIcon, cnWarnColorIcon } from '../view.css';

export const amountValueGetter = ({ data }: ValueGetterParams<TPlainSuggestion>) => {
    if (isNil(data)) {
        return null;
    }

    const { amount, convertRate } = data;

    if (isNil(convertRate)) {
        return null;
    }

    return AgValue.create(getQuoteAmount(amount, convertRate, CONVERSION_DIGITS), data, [
        'group',
        'amountNotification',
    ]);
};

export const AmountRenderer = memo(
    forwardRef(
        (
            { value, valueFormatted }: ICellRendererParams<ReturnType<typeof amountValueGetter>>,
            ref: ForwardedRef<HTMLElement>,
        ) => (
            <span ref={ref}>
                {value?.data.group === EPlainSuggestionGroup.New && (
                    <AmountNotificationIcon amountNotification={value?.data.amountNotification} />
                )}
                {valueFormatted ?? value?.payload}
            </span>
        ),
    ),
);

const AmountNotificationIcon = memo(
    ({ amountNotification }: { amountNotification?: EAmountNotification }) => {
        if (isNil(amountNotification)) {
            return null;
        }

        switch (amountNotification) {
            case EAmountNotification.None:
                return null;
            case EAmountNotification.OutOfRange:
                return (
                    <WarningOutlined
                        className={cn(cnAmountIcon, cnWarnColorIcon)}
                        title="Amount is out of suggested min/max"
                    />
                );
            case EAmountNotification.MinGreaterThanMax:
                return (
                    <WarningOutlined
                        className={cn(cnAmountIcon, cnErrorColorIcon)}
                        title="Suggested min is greater than suggested max"
                    />
                );
        }
    },
);
