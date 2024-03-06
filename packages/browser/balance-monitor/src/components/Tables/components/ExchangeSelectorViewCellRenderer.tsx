import type { TRuleExchanges } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import type { ICellRendererParams } from 'ag-grid-community';
import { isNil } from 'lodash-es';
import { ForwardedRef, forwardRef, memo } from 'react';

import { ExchangeSelectorView } from '../../ExchangeSelectorView';
import { cnGridCellBlock } from './view.css';

export const ExchangeSelectorViewCellRenderer = memo(
    forwardRef(
        (
            { value: exchanges }: ICellRendererParams<unknown, TRuleExchanges>,
            ref: ForwardedRef<HTMLElement>,
        ) => {
            if (isNil(exchanges)) {
                return null;
            }

            return (
                <ExchangeSelectorView className={cnGridCellBlock} exchanges={exchanges} ref={ref} />
            );
        },
    ),
);
