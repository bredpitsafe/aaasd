import type { ICellRendererParams } from '@frontend/ag-grid';
import type { ReactElement } from 'react';
import { memo } from 'react';

import type { THeatmapBorders } from '../../defs.ts';
import { getHeatMapColor } from '../../utils.ts';
import type { TArbMonthlyValue } from '../types';
import { cnArbCellRenderer } from './ArbCellRenderer.css';

export const ArbCellRenderer = memo(
    (params: ICellRendererParams<TArbMonthlyValue | undefined> & THeatmapBorders): ReactElement => {
        // Skip breakdown-level render
        if (params.node.level === 1) {
            return <></>;
        }
        const style = {
            backgroundColor: getHeatMapColor(params.value ?? params.min, params.min, params.max),
        };

        return (
            <div className={cnArbCellRenderer} style={style}>
                {params.valueFormatted}
            </div>
        );
    },
);
