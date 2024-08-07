import type { ITooltipParams } from '@frontend/ag-grid';
import type { ReactElement } from 'react';

import { cnTooltip } from './style.css';

export function DefaultTooltip(params: ITooltipParams): ReactElement {
    const value = params.valueFormatted ?? params.value;

    return <div className={cnTooltip}>{value}</div>;
}
