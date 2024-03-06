import { Checkbox } from '@frontend/common/src/components/Checkbox';
import type { ICellRendererParams } from 'ag-grid-community';
import { isNil } from 'lodash-es';
import { ForwardedRef, forwardRef, memo, Ref } from 'react';

import { cnDisableMouse } from './view.css';

export const CheckboxCellRenderer = memo(
    forwardRef(
        (
            { value: checked }: ICellRendererParams<unknown, boolean>,
            ref: ForwardedRef<HTMLElement>,
        ) => {
            if (isNil(checked)) {
                return null;
            }

            return (
                <Checkbox
                    className={cnDisableMouse}
                    checked={checked}
                    ref={ref as Ref<HTMLInputElement>}
                    tabIndex={-1}
                />
            );
        },
    ),
);
