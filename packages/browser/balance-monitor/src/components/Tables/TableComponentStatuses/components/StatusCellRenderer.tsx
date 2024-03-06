import { EComponentStatus } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import type { ICellRendererParams } from 'ag-grid-community';
import cn from 'classnames';
import { isNil } from 'lodash-es';
import { memo } from 'react';

import { cnStatusCommon, cnStatusStyles } from '../view.css';

export const StatusCellRenderer = memo(
    ({ value }: ICellRendererParams<unknown, EComponentStatus>) =>
        !isNil(value) ? (
            <span className={cn(cnStatusCommon, cnStatusStyles[value])}>{value}</span>
        ) : null,
);
