import type { TRuleCoins } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import type { ICellRendererParams } from 'ag-grid-community';
import { isNil } from 'lodash-es';
import { ForwardedRef, forwardRef, memo } from 'react';

import { CoinSelectorView } from '../../CoinSelectorView';
import { useShowCoinIcons } from '../../Settings/hooks/useShowCoinIcons';
import { cnGridCellBlock } from './view.css';

export const CoinSelectorViewCellRenderer = memo(
    forwardRef(
        (
            { value: coins }: ICellRendererParams<unknown, TRuleCoins>,
            ref: ForwardedRef<HTMLElement>,
        ) => {
            const [showIcon] = useShowCoinIcons();

            if (isNil(coins)) {
                return null;
            }

            return (
                <CoinSelectorView
                    className={cnGridCellBlock}
                    coins={coins}
                    showIcon={showIcon}
                    ref={ref}
                />
            );
        },
    ),
);
