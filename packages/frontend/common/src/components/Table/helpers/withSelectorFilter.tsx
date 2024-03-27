import { SearchOutlined } from '@ant-design/icons';
import type { ColumnType } from 'antd/lib/table';
import type { FilterDropdownProps } from 'antd/lib/table/interface';
import React, { createRef, ForwardedRef, forwardRef } from 'react';
import { useKey } from 'react-use';

import { blue } from '../../../utils/colors';
import { useFunction } from '../../../utils/React/useFunction';
import { Option, Select, SelectRef } from '../../Select';

export function withSelectorFilter<RecordType extends object>(
    list: string[],
    getValue: (record: RecordType) => string,
): Pick<
    ColumnType<RecordType>,
    'filterDropdown' | 'filterIcon' | 'onFilter' | 'onFilterDropdownVisibleChange'
> {
    const selectRef = createRef<SelectRef>();

    return {
        filterDropdown: (props) => <FilterDropdown ref={selectRef} list={list} {...props} />,
        filterIcon: (filtered) => (
            <SearchOutlined style={{ color: filtered ? blue.primary : undefined }} />
        ),
        onFilter: (value, record) => {
            const sourceStr = getValue(record);
            const filterStr = String(value);

            return sourceStr === filterStr;
        },
        onFilterDropdownVisibleChange: (visible: boolean) => {
            if (visible) {
                setTimeout(() => selectRef.current?.focus(), 100);
            }
        },
    };
}

type TFilterDropdownProps = FilterDropdownProps & {
    list: string[];
};

const FilterDropdown = forwardRef((props: TFilterDropdownProps, ref: ForwardedRef<SelectRef>) => {
    const cbSelect = useFunction((value: React.Key) => {
        props.setSelectedKeys(value ? [value] : []);
        props.confirm({ closeDropdown: false });
    });
    const cbClear = useFunction(() => {
        props.setSelectedKeys([]);
        props.confirm({ closeDropdown: false });
    });
    useKey('Escape', () => props.confirm());

    return (
        <div style={{ padding: 8 }}>
            <Select
                style={{ display: 'block' }}
                ref={ref}
                autoFocus={true}
                allowClear={true}
                defaultValue={props.selectedKeys[0]}
                onClear={cbClear}
                onSelect={cbSelect}
            >
                {props.list.map((item) => (
                    <Option key={item} value={item}>
                        {item}
                    </Option>
                ))}
            </Select>
        </div>
    );
});
