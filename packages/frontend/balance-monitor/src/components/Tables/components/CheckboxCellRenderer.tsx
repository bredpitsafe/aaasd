import type { ICellRendererParams } from '@frontend/ag-grid';
import { Checkbox } from '@frontend/common/src/components/Checkbox';
import { isNil } from 'lodash-es';
import { ForwardedRef, forwardRef, memo, Ref } from 'react';

import { cnDisableMouse } from './view.css';

export const CheckboxCellRenderer = memo(
    forwardRef(
        ({ value: checked }: ICellRendererParams<boolean>, ref: ForwardedRef<HTMLElement>) => {
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
