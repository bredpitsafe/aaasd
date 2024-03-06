import { ReactElement } from 'react';

import { TWithTest } from '../../../e2e';
import { TableLabel } from './TableLabel';

export type TTableLabelCountProps = TWithTest & {
    title?: string;
    count: undefined | number;
    filteredCount?: undefined | number;
};

export function TableLabelCount(props: TTableLabelCountProps): ReactElement {
    const { title, count, filteredCount, ...restProps } = props;

    return (
        <TableLabel {...restProps}>
            {title || 'Total'}: {filteredCount !== undefined ? filteredCount + '/' : null}
            {count !== undefined ? count : '-'}
        </TableLabel>
    );
}
