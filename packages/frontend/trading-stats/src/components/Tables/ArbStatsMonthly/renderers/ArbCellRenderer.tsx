import { ICellRendererParams } from '@frontend/ag-grid';
import { blue } from '@frontend/common/src/utils/colors';
import Rainbow from '@indot/rainbowvis';
import { isNil } from 'lodash-es';
import { memo, ReactElement } from 'react';

import { THeatmapBorders } from '../heatmap';
import { TArbMonthlyValue } from '../types';
import { cnArbCellRenderer } from './ArbCellRenderer.css';

const DEFAULT_GRADIENT = ['#ffffff', blue[3]];
const rainbow = new Rainbow();
rainbow.setNumberRange(0, 1);
rainbow.setSpectrum(...DEFAULT_GRADIENT);

export const ArbCellRenderer = memo(
    (params: ICellRendererParams<TArbMonthlyValue | undefined> & THeatmapBorders): ReactElement => {
        // Skip breakdown-level render
        if (params.node.level === 1) {
            return <></>;
        }

        const diff = params.max - params.min;
        const heatMapValue =
            isNil(params.value) || diff === 0
                ? 0
                : ((params.value ?? 0) - params.min) / (params.max - params.min);
        const style = {
            backgroundColor: rainbow.getColor(heatMapValue),
        };

        return (
            <div className={cnArbCellRenderer} style={style}>
                {params.valueFormatted}
            </div>
        );
    },
);
