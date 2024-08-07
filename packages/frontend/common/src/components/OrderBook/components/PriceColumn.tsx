import cn from 'classnames';
import { isEmpty, isNil } from 'lodash-es';
import { memo } from 'react';

import type { TBidAskItem } from '../../../modules/actions/orderBook/defs.ts';
import type { TWithClassname } from '../../../types/components';
import { useMaxDecimalNumberFormatter } from '../hooks/useMaxDecimalNumberFormatter';
import { stylePriceColumn, stylePricePad } from './style.css';

export const PriceColumn = memo(
    ({
        className,
        price,
        prices,
    }: {
        price: TBidAskItem['price'];
        prices: TBidAskItem['price'][];
    } & TWithClassname) => {
        const formattedPrice = useMaxDecimalNumberFormatter(price, prices);

        if (isNil(formattedPrice)) {
            return <div className={stylePriceColumn} />;
        }

        return (
            <div className={cn(stylePriceColumn, className)}>
                {formattedPrice.display}
                {!isEmpty(formattedPrice.postfix) && (
                    <span className={stylePricePad}>{formattedPrice.postfix}</span>
                )}
            </div>
        );
    },
);
