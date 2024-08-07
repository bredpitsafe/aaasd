import type { ITooltipParams } from '@frontend/ag-grid';
import type { ReactElement } from 'react';

import { cnTooltip } from './style.css';

export function DefaultValueTooltip(params: ITooltipParams): ReactElement {
    return <div className={cnTooltip}>{params.value}</div>;
}
