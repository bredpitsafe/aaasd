import { Tag } from '@frontend/common/src/components/Tag';
import type { TWithClassname } from '@frontend/common/src/types/components';
import {
    EWideExchanges,
    TRuleExchanges,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { assertNever } from '@frontend/common/src/utils/assert';
import cn from 'classnames';
import { ForwardedRef, forwardRef, memo } from 'react';

import { ExchangeWithIcon } from './ExchangeWithIcon';
import { cnItemsList } from './style.css';

export const ExchangeSelectorView = memo(
    forwardRef(
        (
            {
                className,
                exchanges,
            }: TWithClassname & {
                exchanges: TRuleExchanges;
            },
            ref: ForwardedRef<HTMLElement>,
        ) => {
            if (Array.isArray(exchanges)) {
                return (
                    <div className={cn(className, cnItemsList)}>
                        {exchanges.map((exchange) => (
                            <ExchangeWithIcon key={exchange} exchange={exchange} />
                        ))}
                    </div>
                );
            }

            if (exchanges === EWideExchanges.All) {
                return (
                    <Tag className={className} color="gold" ref={ref}>
                        All
                    </Tag>
                );
            }

            assertNever(exchanges);
        },
    ),
);
