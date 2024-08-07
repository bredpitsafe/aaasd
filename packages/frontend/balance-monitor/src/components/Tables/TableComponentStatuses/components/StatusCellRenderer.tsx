import type { ICellRendererParams } from '@frontend/ag-grid';
import type { EComponentStatus } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import cn from 'classnames';
import { isNil } from 'lodash-es';
import { memo } from 'react';

import { cnStatusCommon, cnStatusStyles } from '../view.css';

export const StatusCellRenderer = memo(({ value }: ICellRendererParams<EComponentStatus>) =>
    !isNil(value) ? (
        <span className={cn(cnStatusCommon, cnStatusStyles[value])}>{value}</span>
    ) : null,
);
