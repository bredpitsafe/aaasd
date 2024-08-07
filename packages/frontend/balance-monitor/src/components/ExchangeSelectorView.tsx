import { assertNever } from '@common/utils/src/assert.ts';
import { Tag } from '@frontend/common/src/components/Tag';
import type { TWithClassname } from '@frontend/common/src/types/components';
import type { TRuleExchanges } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { EWideExchanges } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import cn from 'classnames';
import type { ForwardedRef } from 'react';
import { forwardRef, memo } from 'react';

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
