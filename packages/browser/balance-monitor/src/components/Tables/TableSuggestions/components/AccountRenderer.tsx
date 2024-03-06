import type { TAccountInfo } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import type { ICellRendererParams } from 'ag-grid-community';
import cn from 'classnames';
import { isNil } from 'lodash-es';
import { ForwardedRef, forwardRef, memo } from 'react';

import { AccountWithExchangeIcon } from '../../../AccountWithExchangeIcon';
import type { TPlainSuggestion } from '../defs';
import { cnAccountItem, cnHighlightedAccount, cnSelectedAccount } from '../view.css';

export const AccountRenderer = memo(
    forwardRef(
        (
            {
                value,
            }: ICellRendererParams<
                TPlainSuggestion,
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
