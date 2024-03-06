import { ERuleActualStatus } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import type { ICellRendererParams } from 'ag-grid-community';
import cn from 'classnames';
import { isNil } from 'lodash-es';
import { ForwardedRef, forwardRef, memo } from 'react';

import { cnStatusCommon, cnTransferBlockingRuleStatusStyles } from '../style.css';

export const TransferBlockingRuleStatusRenderer = memo(
    forwardRef(
        (
            { value }: ICellRendererParams<unknown, ERuleActualStatus>,
            ref: ForwardedRef<HTMLElement>,
        ) =>
            !isNil(value) ? (
                <span
                    ref={ref}
                    className={cn(cnStatusCommon, cnTransferBlockingRuleStatusStyles[value])}
                >
                    {value}
                </span>
            ) : null,
    ),
);
