import { CaretDownOutlined } from '@ant-design/icons';
import { ReactElement } from 'react';

import { pickTestProps, TWithTest } from '../../../e2e';
import type { TWithChildren, TWithClassname } from '../../types/components';
import { Button } from '../Button';
import { Dropdown } from '../Dropdown';
import { Menu, MenuProps } from '../Menu';
import { TableLabel } from './TableLabel';
import { cnButton } from './TableLabelMenu.css';

type TTableLabelMenuProps = TWithClassname & TWithChildren & TWithTest & MenuProps;

export function TableLabelMenu(props: TTableLabelMenuProps): ReactElement {
    const { className, children, ...menuProps } = props;
    return (
        <TableLabel className={className} {...pickTestProps(props)}>
            <Dropdown overlay={<Menu {...menuProps} />} trigger={['click']}>
                <Button
                    size="small"
                    className={cnButton}
                    icon={<CaretDownOutlined />}
                    type={'text'}
                >
                    {children}
                </Button>
            </Dropdown>
        </TableLabel>
    );
}
