import type { SelectProps } from 'antd/lib/select';
import cn from 'classnames';
import type { ReactNode } from 'react';

import type { TWithTest } from '../../../e2e';
import type { TWithClassname } from '../../types/components';
import { Select } from '../Select';
import { cnTableLabelSelect } from './style.css';

type TTableLabelSelectProps<T> = TWithTest &
    TWithClassname &
    SelectProps<T> & {
        icon?: ReactNode;
    };

export function TableLabelSelect<T>(props: TTableLabelSelectProps<T>) {
    return (
        <Select
            size="small"
            loading={props.options === undefined}
            {...props}
            className={cn(cnTableLabelSelect, props.className)}
        />
    );
}
