import { ICellRendererParams } from 'ag-grid-community';
import cn from 'classnames';
import { isNil } from 'lodash-es';
import { ReactNode } from 'react';

import { THerodotusTaskInstrumentView } from '../../../types';
import { EHerodotusTaskType } from '../../../types/domain';
import { cnBuy, cnSell, cnSide } from './InstrumentSideRenderer.css';

export const InstrumentSideRenderer = (
    params: ICellRendererParams<THerodotusTaskInstrumentView, THerodotusTaskInstrumentView['side']>,
): ReactNode => {
    if (isNil(params.value)) {
        return '—';
    }
    return (
        <span
            className={cn(cnSide, {
                [cnBuy]: params.data?.side === EHerodotusTaskType.Buy,
                [cnSell]: params.data?.side === EHerodotusTaskType.Sell,
            })}
        >
            {params.value}
        </span>
    );
};
