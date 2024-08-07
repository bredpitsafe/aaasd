import { assertNever } from '@common/utils/src/assert.ts';
import { Tag } from '@frontend/common/src/components/Tag';
import type { TWithClassname } from '@frontend/common/src/types/components';
import type { TRuleAccounts } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { EWideAccounts } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import cn from 'classnames';
import type { ForwardedRef } from 'react';
import { forwardRef, memo } from 'react';

import { AccountWithExchangeIcon } from './AccountWithExchangeIcon';
import { cnItemsList } from './style.css';

export const AccountSelectorView = memo(
    forwardRef(
        (
            {
                className,
                accounts,
            }: TWithClassname & {
                accounts: TRuleAccounts;
            },
            ref: ForwardedRef<HTMLElement>,
        ) => {
            if (Array.isArray(accounts)) {
                return (
                    <div className={cn(className, cnItemsList)}>
                        {accounts.map((account) => (
                            <AccountWithExchangeIcon key={account} account={account} />
                        ))}
                    </div>
                );
            }

            if (accounts === EWideAccounts.All) {
                return (
                    <Tag className={className} color="gold" ref={ref}>
                        All
                    </Tag>
                );
            }

            if (accounts === EWideAccounts.Transit) {
                return (
                    <Tag className={className} color="blue" ref={ref}>
                        Transit
                    </Tag>
                );
            }

            if (accounts === EWideAccounts.Trading) {
                return (
                    <Tag className={className} color="cyan" ref={ref}>
                        Trading
                    </Tag>
                );
            }

            assertNever(accounts);
        },
    ),
);
