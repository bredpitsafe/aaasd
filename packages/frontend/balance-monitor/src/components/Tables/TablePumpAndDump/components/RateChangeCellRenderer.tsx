import type { ICellRendererParams } from '@frontend/ag-grid';
import { isNil } from 'lodash-es';
import { memo } from 'react';

import { PERCENTAGE_DIGITS } from '../../../defs';
import { formattedPercentOrEmpty } from '../../../utils';
import { directionNumber2Display } from '../utils';
import { DirectionCellRenderer } from './DirectionCellRenderer';

export const RateChangeCellRenderer = memo(({ value }: ICellRendererParams<number | undefined>) => {
    if (isNil(value)) {
        return null;
    }

    if (value === 0) {
        return <span>{value}</span>;
    }

    return (
        <span>
            <DirectionCellRenderer value={directionNumber2Display(value)} />
            {formattedPercentOrEmpty(Math.abs(value), PERCENTAGE_DIGITS)}
        </span>
    );
});
