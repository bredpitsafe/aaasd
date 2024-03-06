import type { ERuleGroups } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import type { ICellRendererParams } from 'ag-grid-community';
import { isNil } from 'lodash-es';
import { ForwardedRef, forwardRef, memo } from 'react';

import { DisabledGroupsSelectorView } from '../../DisabledGroupsSelectorView';

export const DisabledGroupsSelectorViewCellRenderer = memo(
    forwardRef(
        (
            { value: disabledGroups }: ICellRendererParams<unknown, ERuleGroups>,
            ref: ForwardedRef<HTMLElement>,
        ) => {
            if (isNil(disabledGroups)) {
                return null;
            }
            return <DisabledGroupsSelectorView disabledGroups={disabledGroups} ref={ref} />;
        },
    ),
);
