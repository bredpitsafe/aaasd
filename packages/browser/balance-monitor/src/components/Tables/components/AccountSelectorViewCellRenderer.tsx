import type { TRuleAccounts } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import type { ICellRendererParams } from 'ag-grid-community';
import { isNil } from 'lodash-es';
import { ForwardedRef, forwardRef, memo } from 'react';

import { AccountSelectorView } from '../../AccountSelectorView';
import { cnGridCellBlock } from './view.css';

export const AccountSelectorViewCellRenderer = memo(
    forwardRef(
        (
            { value: accounts }: ICellRendererParams<unknown, TRuleAccounts>,
            ref: ForwardedRef<HTMLElement>,
        ) => {
            if (isNil(accounts)) {
                return null;
            }

            return (
                <AccountSelectorView className={cnGridCellBlock} accounts={accounts} ref={ref} />
            );
        },
    ),
);
