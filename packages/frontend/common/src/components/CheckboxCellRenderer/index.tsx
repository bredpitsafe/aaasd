import type { ICellRendererParams } from '@frontend/ag-grid';
import cn from 'classnames';
import { isNil } from 'lodash-es';
import type { ForwardedRef, Ref } from 'react';
import { forwardRef, memo, useMemo } from 'react';

import type { CheckboxProps } from '../Checkbox';
import { Checkbox } from '../Checkbox';
import { cnDisableMouse } from './view.css';

export const CheckboxCellRenderer = memo(
    forwardRef(
        (
            { value: checked, onClick, disabled }: ICellRendererParams<boolean> & CheckboxProps,
            ref: ForwardedRef<HTMLElement>,
        ) => {
            const className = useMemo(() => cn({ [cnDisableMouse]: isNil(onClick) }), [onClick]);

            if (isNil(checked)) {
                return null;
            }

            return (
                <Checkbox
                    className={className}
                    checked={checked}
                    ref={ref as Ref<HTMLInputElement>}
                    tabIndex={-1}
                    onClick={onClick}
                    disabled={disabled}
                />
            );
        },
    ),
);
