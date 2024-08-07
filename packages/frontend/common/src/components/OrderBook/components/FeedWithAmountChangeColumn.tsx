import cn from 'classnames';
import { isEmpty } from 'lodash-es';
import { memo } from 'react';

import type { TBidAskItem } from '../../../modules/actions/orderBook/defs.ts';
import type { TWithClassname } from '../../../types/components';
import { styleFeedColumn, styleLastMultiFeed } from './style.css';
import { ValueChange } from './ValueChange';

export const FeedWithAmountChangeColumn = memo(
    ({
        className,
        currentAmount,
        nextAmount,
        feed,
        amountChanges,
    }: {
        currentAmount: TBidAskItem['amount'];
        nextAmount: TBidAskItem['amount'];
        feed?: TBidAskItem['feed'] | [TBidAskItem['feed'], TBidAskItem['feed']];
        amountChanges: TBidAskItem['amount'][];
    } & TWithClassname) => {
        const amountChange = nextAmount - currentAmount;
        const multiFeed = Array.isArray(feed);
        const shouldRender = (multiFeed || amountChange !== 0) && !isEmpty(feed);

        if (!shouldRender) {
            return <div className={styleFeedColumn} />;
        }

        return (
            <div className={cn(styleFeedColumn, className)}>
                <div>{multiFeed ? feed[0] : feed}</div>
                {multiFeed && (
                    <>
                        <ValueChange
                            currentAmount={0}
                            nextAmount={nextAmount}
                            amountChanges={amountChanges}
                        />
                        <div className={styleLastMultiFeed}>{feed[1]}</div>
                    </>
                )}
            </div>
        );
    },
);
