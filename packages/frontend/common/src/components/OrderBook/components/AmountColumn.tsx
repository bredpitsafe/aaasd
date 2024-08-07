import cn from 'classnames';
import { isEmpty, isNil } from 'lodash-es';
import { memo, useMemo } from 'react';

import type { TBidAskItem } from '../../../modules/actions/orderBook/defs.ts';
import type { TWithClassname } from '../../../types/components';
import { useMaxDecimalNumberFormatter } from '../hooks/useMaxDecimalNumberFormatter';
import { styleAmountColumn, styleNegative, stylePositive, stylePricePad } from './style.css';

export const AmountColumn = memo(
    ({
        className,
        amount,
        amounts,
        sign,
    }: {
        className: string;
        amount: TBidAskItem['amount'];
        amounts: TBidAskItem['amount'][];
        sign?: number;
    } & TWithClassname) => {
        const formattedAmount = useMaxDecimalNumberFormatter(
            amount !== 0 ? amount : undefined,
            amounts,
        );

        const colorClass = useMemo(() => {
            if (isNil(sign) || sign === 0) {
                return;
            }

            return sign > 0 ? stylePositive : styleNegative;
        }, [sign]);

        if (isNil(formattedAmount)) {
            return <div className={styleAmountColumn} />;
        }

        return (
            <div className={cn(styleAmountColumn, className, colorClass)}>
                {formattedAmount.display}
                {!isEmpty(formattedAmount.postfix) && (
                    <span className={stylePricePad}>{formattedAmount.postfix}</span>
                )}
            </div>
        );
    },
);
