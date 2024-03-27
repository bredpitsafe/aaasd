import { ReactElement } from 'react';

import { createTestProps } from '../../../e2e';
import { ETableTabFilterSelectors } from '../../../e2e/selectors/table-tab.filter.selectors';
import { Button, ButtonProps } from '../Button';
import { cnButton, cnLabel } from './Button.css';
import { TableLabel } from './TableLabel';

export type TTableLabelButtonProps = ButtonProps;

export function TableLabelButton(props: TTableLabelButtonProps): ReactElement {
    return (
        <TableLabel className={cnLabel}>
            <Button
                {...createTestProps(ETableTabFilterSelectors.TableFilterButton)}
                className={cnButton}
                size="small"
                {...props}
            />
        </TableLabel>
    );
}
