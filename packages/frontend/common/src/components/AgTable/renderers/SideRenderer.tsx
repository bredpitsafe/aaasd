import cn from 'classnames';
import type { ReactElement } from 'react';
import { memo } from 'react';

import { EOrderSide } from '../../../types/domain/orders';
import { cnAsk, cnBid } from './SideRenderer.css';

type TSideRendererProps = {
    side: EOrderSide;
};

export const SideRenderer = memo((props: TSideRendererProps): ReactElement | null => {
    if (props.side === undefined) {
        return null;
    }

    return (
        <span
            className={cn({
                [cnAsk]: props.side === EOrderSide.Ask,
                [cnBid]: props.side === EOrderSide.Bid,
            })}
        >
            {props.side}
        </span>
    );
});
