import { assertNever } from '@common/utils/src/assert.ts';
import { Tag } from '@frontend/common/src/components/Tag';
import type { TWithClassname } from '@frontend/common/src/types/components';
import type { TRuleCoins } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { EWideCoins } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import cn from 'classnames';
import type { ForwardedRef, MouseEventHandler } from 'react';
import { forwardRef, memo } from 'react';

import { CoinWithIcon } from './CoinWithIcon';
import { cnItemsList } from './style.css';

export const CoinSelectorView = memo(
    forwardRef(
        (
            {
                className,
                coins,
                showIcon = true,
                onClick,
            }: TWithClassname & {
                coins: TRuleCoins;
                showIcon?: boolean;
                onClick?: MouseEventHandler<HTMLElement>;
            },
            ref: ForwardedRef<HTMLElement>,
        ) => {
            if (Array.isArray(coins)) {
                return (
                    <span className={cn(className, cnItemsList)} ref={ref}>
                        {coins.map((coin) => (
                            <CoinWithIcon
                                key={coin}
                                coin={coin}
                                showIcon={showIcon}
                                onClick={onClick}
                            />
                        ))}
                    </span>
                );
            }

            if (coins === EWideCoins.All) {
                return (
                    <Tag className={className} color="gold" ref={ref}>
                        All
                    </Tag>
                );
            }

            assertNever(coins);
        },
    ),
);
