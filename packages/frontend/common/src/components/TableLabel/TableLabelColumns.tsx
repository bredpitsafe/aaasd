import { DownOutlined } from '@ant-design/icons';
import type { ReactElement, ReactNode } from 'react';
import { useMemo, useState } from 'react';

import { useFunction } from '../../utils/React/useFunction';
import { Button } from '../Button';
import { Dropdown } from '../Dropdown';
import { Menu } from '../Menu';
import { TableLabel } from './TableLabel';

export type TTableLabelColumnsProps<K extends string> = {
    columns: { key: K; label: ReactNode }[];
    selected: K[];
    onChange: (selected: K[]) => unknown;
};

export function TableLabelColumns<K extends string>(
    props: TTableLabelColumnsProps<K>,
): ReactElement {
    const [open, setOpen] = useState(false);
    const handleChange = useFunction((data: { selectedKeys: string[] }) => {
        props.onChange(
            props.columns.filter((c) => data.selectedKeys.includes(c.key)).map((c) => c.key),
        );
    });
    const overlay = useMemo(
        () => (
            <Menu
                multiple
                selectable
                items={props.columns}
                defaultSelectedKeys={props.selected}
                onSelect={handleChange}
                onDeselect={handleChange}
            />
        ),
        [props.columns, props.selected, handleChange],
    );

    return (
        <TableLabel>
            <Dropdown
                placement="bottom"
                overlay={overlay}
                trigger={['click']}
                open={open}
                onOpenChange={setOpen}
            >
                <Button type="text" size="small">
                    Columns <DownOutlined />
                </Button>
            </Dropdown>
        </TableLabel>
    );
}
