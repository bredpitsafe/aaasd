import type { ICellRendererParams } from '@frontend/ag-grid';
import type { TRuleAccounts } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { isNil } from 'lodash-es';
import type { ForwardedRef } from 'react';
import { forwardRef, memo } from 'react';

import { AccountSelectorView } from '../../AccountSelectorView';
import { cnGridCellBlock } from './view.css';

export const AccountSelectorViewCellRenderer = memo(
    forwardRef(
        (
            { value: accounts }: ICellRendererParams<TRuleAccounts>,
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
