import { ITooltipParams } from 'ag-grid-community';
import { ReactElement } from 'react';

import { cnTooltip } from './style.css';

export function DefaultValueTooltip(params: ITooltipParams): ReactElement {
    return <div className={cnTooltip}>{params.value}</div>;
}
