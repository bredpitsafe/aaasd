import { ETradeRole } from '@frontend/common/src/types/domain/trade';
import cn from 'classnames';
import type { ReactElement } from 'react';
import { memo, useMemo } from 'react';

import { cnMaker, cnTaker, cnType } from './TradeRoleRenderer.css';

type TTradeRoleRendererProps = {
    role?: ETradeRole;
};

export const TradeRoleRenderer = memo((props: TTradeRoleRendererProps): ReactElement | null => {
    const { role } = props;
    const className = useMemo(
        () =>
            cn(cnType, {
                [cnMaker]: role === ETradeRole.Maker,
                [cnTaker]: role === ETradeRole.Taker,
            }),
        [role],
    );

    return <span className={className}>{role}</span>;
});
