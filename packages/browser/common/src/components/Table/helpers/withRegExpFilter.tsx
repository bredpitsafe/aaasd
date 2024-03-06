import { SearchOutlined } from '@ant-design/icons';
import { InputRef } from 'antd';
import type { ColumnType } from 'antd/lib/table';
import type { FilterDropdownProps } from 'antd/lib/table/interface';
import { debounce } from 'lodash-es';
import { ChangeEvent, createRef, ForwardedRef, forwardRef, useCallback } from 'react';

import { blue } from '../../../utils/colors';
import { useFunction } from '../../../utils/React/useFunction';
import { useKeypressCallback } from '../../../utils/React/useKeypressCallback';
import { tryDo } from '../../../utils/tryDo';
import { Input } from '../../Input';

// eslint-disable-next-line @typescript-eslint/ban-types
export function withRegExpFilter<RecordType extends object>(
    getValue: (record: RecordType) => string,
): Pick<
    ColumnType<RecordType>,
    'filterDropdown' | 'filterIcon' | 'onFilter' | 'onFilterDropdownVisibleChange'
> {
    const inputRef = createRef<InputRef>();

    return {
        filterDropdown: (props) => <FilterDropdown ref={inputRef} {...props} />,
        filterIcon: (filtered) => (
            <SearchOutlined style={{ color: filtered ? blue.primary : undefined }} />
        ),
        onFilter: (value, record) => {
            const sourceStr = getValue(record);
            const filterStr = String(value);
            const [, result] = tryDo(() => new RegExp(filterStr, 'i').test(sourceStr));
            return result !== null ? result : false;
        },
        onFilterDropdownVisibleChange: (visible: boolean) => {
            if (visible) {
                setTimeout(() => inputRef.current?.select(), 100);
            }
        },
    };
}

const FilterDropdown = forwardRef((props: FilterDropdownProps, ref: ForwardedRef<InputRef>) => {
    const debouncedChange = useFunction(
        debounce((value: undefined | string) => {
            props.setSelectedKeys(value !== undefined ? [value] : []);
            props.confirm({ closeDropdown: false });
        }, 500),
    );
    const cbChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => debouncedChange(event.target.value),
        [debouncedChange],
    );
    const cbKeyPressEnter = useKeypressCallback(['Escape', 'Enter'], () => props.confirm(), [
        props.confirm,
    ]);

    return (
        <div style={{ padding: 8 }}>
            <Input
                ref={ref}
                placeholder="RegExp"
                autoFocus={true}
                allowClear={true}
                defaultValue={props.selectedKeys[0]}
                onChange={cbChange}
                onKeyUpCapture={cbKeyPressEnter}
            />
        </div>
    );
});
