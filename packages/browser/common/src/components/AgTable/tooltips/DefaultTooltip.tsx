import { ITooltipParams } from 'ag-grid-community';
import { ReactElement } from 'react';

import { cnTooltip } from './style.css';

export function DefaultTooltip(params: ITooltipParams): ReactElement {
    const value = params.valueFormatted ?? params.value;

    return <div className={cnTooltip}>{value}</div>;
}
