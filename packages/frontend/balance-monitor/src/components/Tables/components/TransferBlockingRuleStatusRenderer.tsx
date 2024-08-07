import type { ICellRendererParams } from '@frontend/ag-grid';
import type { ERuleActualStatus } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import cn from 'classnames';
import { isNil } from 'lodash-es';
import type { ForwardedRef } from 'react';
import { forwardRef, memo } from 'react';

import { cnStatusCommon, cnTransferBlockingRuleStatusStyles } from '../style.css';

export const TransferBlockingRuleStatusRenderer = memo(
    forwardRef(
        ({ value }: ICellRendererParams<ERuleActualStatus>, ref: ForwardedRef<HTMLElement>) =>
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
