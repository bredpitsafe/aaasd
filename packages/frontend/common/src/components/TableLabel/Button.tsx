import type { ReactElement } from 'react';

import {
    ETableTabFilterProps,
    ETableTabFilterSelectors,
} from '../../../e2e/selectors/table-tab.filter.selectors';
import type { ButtonProps } from '../Button';
import { Button } from '../Button';
import { cnButton, cnLabel } from './Button.css';
import { TableLabel } from './TableLabel';

export type TTableLabelButtonProps = ButtonProps;

export function TableLabelButton(props: TTableLabelButtonProps): ReactElement {
    return (
        <TableLabel className={cnLabel}>
            <Button
                {...ETableTabFilterProps[ETableTabFilterSelectors.TableFilterButton]}
                className={cnButton}
                size="small"
                {...props}
            />
        </TableLabel>
    );
}
