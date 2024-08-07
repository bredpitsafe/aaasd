import type { ICellRendererParams } from '@frontend/ag-grid';
import { ESide } from '@frontend/common/src/types/domain/task';
import cn from 'classnames';
import { isNil } from 'lodash-es';
import type { ReactNode } from 'react';

import type { THerodotusTaskInstrumentView } from '../../../types';
import { cnBuy, cnSell, cnSide } from './InstrumentSideRenderer.css';

export const InstrumentSideRenderer = (
    params: ICellRendererParams<THerodotusTaskInstrumentView['side']>,
): ReactNode => {
    if (isNil(params.value)) {
        return '—';
    }
    return (
        <span
            className={cn(cnSide, {
                [cnBuy]: params.value === ESide.Buy,
                [cnSell]: params.value === ESide.Sell,
            })}
        >
            {params.value}
        </span>
    );
};
