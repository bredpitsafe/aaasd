import type { TWithClassname } from '@frontend/common/src/types/components';
import type { TCoinId } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import cn from 'classnames';
import type { ForwardedRef, MouseEventHandler } from 'react';
import { forwardRef, memo } from 'react';

import { CoinIcon } from './Icons/CoinIcon';
import { cnCellIcon, cnCellIconContainer } from './style.css';

export const CoinWithIcon = memo(
    forwardRef(
        (
            {
                className,
                coin,
                showIcon = true,
                onClick,
            }: TWithClassname & {
                coin: TCoinId;
                showIcon?: boolean;
                onClick?: MouseEventHandler<HTMLElement>;
            },
            ref: ForwardedRef<HTMLElement>,
        ) => (
            <span className={cn(className, cnCellIconContainer)} ref={ref} onClick={onClick}>
                {showIcon ? <CoinIcon className={cnCellIcon} coin={coin} /> : null}
                {coin}
            </span>
        ),
    ),
);
