import { WarningOutlined } from '@ant-design/icons';
import { EInProgressSolutionStatus } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import type { ICellRendererParams } from 'ag-grid-community';
import cn from 'classnames';
import { isNil } from 'lodash-es';
import { ForwardedRef, forwardRef, memo } from 'react';

import { EAmountNotification, EPlainSuggestionGroup, TPlainSuggestion } from '../defs';
import { cnAmountIcon, cnErrorColorIcon, cnWarnColorIcon } from '../view.css';

export const AmountRenderer = memo(
    forwardRef(
        (
            {
                value,
                valueFormatted,
                data,
            }: ICellRendererParams<TPlainSuggestion, EInProgressSolutionStatus>,
            ref: ForwardedRef<HTMLElement>,
        ) => (
            <span ref={ref}>
                {data?.group === EPlainSuggestionGroup.New && (
                    <AmountNotificationIcon amountNotification={data?.amountNotification} />
                )}
                {valueFormatted ?? value}
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
