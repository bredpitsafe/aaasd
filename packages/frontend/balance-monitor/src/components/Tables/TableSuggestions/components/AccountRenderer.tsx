import type { ICellRendererParams } from '@frontend/ag-grid';
import type { TAccountInfo } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import cn from 'classnames';
import { isNil } from 'lodash-es';
import type { ForwardedRef } from 'react';
import { forwardRef, memo } from 'react';

import { AccountWithExchangeIcon } from '../../../AccountWithExchangeIcon';
import { cnAccountItem, cnHighlightedAccount, cnSelectedAccount } from '../view.css';

export const AccountRenderer = memo(
    forwardRef(
        (
            {
                value,
            }: ICellRendererParams<
                TAccountInfo & { hasDirectTransfer: boolean; selected: boolean }
            >,
            ref: ForwardedRef<HTMLElement>,
        ) => {
            if (isNil(value)) {
                return null;
            }

            return (
                <div ref={ref as ForwardedRef<HTMLDivElement>}>
                    <AccountWithExchangeIcon
                        className={cn(cnAccountItem, {
                            [cnHighlightedAccount]: value.hasDirectTransfer,
                            [cnSelectedAccount]: value.selected,
                        })}
                        account={value.account}
                        exchange={value.exchange}
                    />
                </div>
            );
        },
    ),
);
