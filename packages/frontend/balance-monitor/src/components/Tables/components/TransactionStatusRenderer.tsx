import type { ICellRendererParams } from '@frontend/ag-grid';
import { EInProgressSolutionStatus } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import cn from 'classnames';
import { isNil } from 'lodash-es';
import type { ForwardedRef } from 'react';
import { forwardRef, memo } from 'react';

import { cnStatusCommon, cnTransactionStatusStyles } from '../style.css';

const PENDING_STATUSES = new Set([
    EInProgressSolutionStatus.Starting,
    EInProgressSolutionStatus.Planned,
    EInProgressSolutionStatus.Pending,
    EInProgressSolutionStatus.Sent,
    EInProgressSolutionStatus.Received,
    EInProgressSolutionStatus.ConfirmedBalance,
    EInProgressSolutionStatus.ConfirmedChain,
]);
const ERROR_STATUSES = new Set([
    EInProgressSolutionStatus.CreateError,
    EInProgressSolutionStatus.Cancelled,
    EInProgressSolutionStatus.Failed,
    EInProgressSolutionStatus.Invalid,
    EInProgressSolutionStatus.Rejected,
]);
const SUCCESS_STATUSES = new Set([EInProgressSolutionStatus.Succeeded]);

export const TransactionStatusRenderer = memo(
    forwardRef(
        (
            { value }: ICellRendererParams<EInProgressSolutionStatus>,
            ref: ForwardedRef<HTMLElement>,
        ) =>
            !isNil(value) ? (
                <span
                    ref={ref}
                    className={cn(cnStatusCommon, {
                        [cnTransactionStatusStyles.error]: ERROR_STATUSES.has(value),
                        [cnTransactionStatusStyles.succeeded]: SUCCESS_STATUSES.has(value),
                        [cnTransactionStatusStyles.pending]: PENDING_STATUSES.has(value),
                    })}
                >
                    {value}
                </span>
            ) : null,
    ),
);
