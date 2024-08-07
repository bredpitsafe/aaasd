import type { ICellRendererParams } from '@frontend/ag-grid';
import type { ERuleGroups } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { isNil } from 'lodash-es';
import type { ForwardedRef } from 'react';
import { forwardRef, memo } from 'react';

import { DisabledGroupsSelectorView } from '../../DisabledGroupsSelectorView';

export const DisabledGroupsSelectorViewCellRenderer = memo(
    forwardRef(
        (
            { value: disabledGroups }: ICellRendererParams<ERuleGroups>,
            ref: ForwardedRef<HTMLElement>,
        ) => {
            if (isNil(disabledGroups)) {
                return null;
            }
            return <DisabledGroupsSelectorView disabledGroups={disabledGroups} ref={ref} />;
        },
    ),
);
