import { FieldTimeOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useCallback, useMemo } from 'react';

import type { TWithTest } from '../../../e2e';
import { pickTestProps } from '../../../e2e';
import { TableLabelMenu } from './TableLabelMenu';

type TTableLabelSelectProps<T> = TWithTest & {
    items: T[];
    selected?: T;
    onChange: (value?: T) => void;
};

export function TableLabelMenuSelect<T extends string>(props: TTableLabelSelectProps<T>) {
    const { items, selected, onChange } = props;

    const menuItems = useMemo(
        () =>
            items.map((key) => ({
                key,
                label: String(key),
            })),
        [items],
    );

    const selectedKeys = useMemo(() => [String(selected)], [selected]);

    const cbClick: MenuProps['onClick'] = useCallback(
        (e: { key: string }) => onChange(e.key as unknown as T),
        [onChange],
    );

    return (
        <TableLabelMenu
            items={menuItems}
            selectedKeys={selectedKeys}
            onClick={cbClick}
            {...pickTestProps(props)}
        >
            {selected || <FieldTimeOutlined />}
        </TableLabelMenu>
    );
}
