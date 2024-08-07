import type { TWithClassname } from '@frontend/common/src/types/components';
import type {
    TBalanceMonitorAccountId,
    TExchangeId,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import cn from 'classnames';
import type { ForwardedRef } from 'react';
import { forwardRef, memo } from 'react';

import { ExchangeIcon } from './Icons/ExchangeIcon';
import { cnCellIcon, cnCellIconContainer } from './style.css';

export const AccountWithExchangeIcon = memo(
    forwardRef(
        (
            {
                className,
                account,
                exchange,
            }: TWithClassname & { account: TBalanceMonitorAccountId; exchange?: TExchangeId },
            ref: ForwardedRef<HTMLElement>,
        ) => {
            return (
                <span className={cn(className, cnCellIconContainer)} ref={ref}>
                    {exchange !== undefined && (
                        <ExchangeIcon className={cnCellIcon} exchangeName={exchange} />
                    )}
                    {account}
                </span>
            );
        },
    ),
);
