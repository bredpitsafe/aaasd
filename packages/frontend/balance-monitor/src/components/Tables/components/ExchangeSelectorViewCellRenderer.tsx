import type { ICellRendererParams } from '@frontend/ag-grid';
import type { TRuleExchanges } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { isNil } from 'lodash-es';
import type { ForwardedRef } from 'react';
import { forwardRef, memo } from 'react';

import { ExchangeSelectorView } from '../../ExchangeSelectorView';
import { cnGridCellBlock } from './view.css';

export const ExchangeSelectorViewCellRenderer = memo(
    forwardRef(
        (
            { value: exchanges }: ICellRendererParams<TRuleExchanges>,
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
