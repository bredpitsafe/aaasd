import { SearchOutlined } from '@ant-design/icons';
import { InputRef } from 'antd';
import type { ColumnType } from 'antd/lib/table';
import type { FilterDropdownProps } from 'antd/lib/table/interface';
import { debounce, isNumber } from 'lodash-es';
import { ChangeEvent, createRef, ForwardedRef, forwardRef, Key } from 'react';

import { blue } from '../../../utils/colors';
import { useFunction } from '../../../utils/React/useFunction';
import { useKeypressCallback } from '../../../utils/React/useKeypressCallback';
import { Input } from '../../Input';
import { Space } from '../../Space';
import { parseSelectedKeys, stringifySelectedKeys } from './columnsWithRouter';

type TMinMax = [null | number, null | number];

// eslint-disable-next-line @typescript-eslint/ban-types
export function withNumericFilter<RecordType extends object>(
    getValue: (record: RecordType) => number,
): Pick<
    ColumnType<RecordType>,
    | 'filterMultiple'
    | 'filterDropdown'
    | 'filterIcon'
    | 'onFilter'
    | 'onFilterDropdownVisibleChange'
> {
    const inputRef = createRef<InputRef>();

    return {
        filterMultiple: true,
        filterDropdown: (props) => <FilterDropdown ref={inputRef} {...props} />,
        filterIcon: (filtered) => (
            <SearchOutlined style={{ color: filtered ? blue.primary : undefined }} />
        ),
        onFilter: (value, record) => {
            const number = getValue(record);
            const [min, max] = parseSelectedKeys<TMinMax>(value as Key, [null, null]);
            const minValue = isFiniteNumber(min) ? min : -Infinity;
            const maxValue = isFiniteNumber(max) ? max : +Infinity;

            return number >= minValue && number <= maxValue;
        },
        onFilterDropdownVisibleChange: (visible: boolean) => {
            if (visible) {
                setTimeout(() => inputRef.current?.select(), 100);
            }
        },
    };
}

const FilterDropdown = forwardRef((props: FilterDropdownProps, ref: ForwardedRef<InputRef>) => {
    const [minValue, maxValue] = parseSelectedKeys<TMinMax>(props.selectedKeys[0], [null, null]);
    const debouncedChangeMinMax = useFunction(
        debounce((minValue: number | null, maxValue: number | null) => {
            props.setSelectedKeys(stringifySelectedKeys([minValue, maxValue]));
            props.confirm({ closeDropdown: false });
        }, 500),
    );
    const cbChangeMin = useFunction((event: ChangeEvent<HTMLInputElement>) =>
        debouncedChangeMinMax(stringToNumber(event.target.value, -Infinity), maxValue),
    );
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const cbChangeMax = useFunction((event: ChangeEvent<HTMLInputElement>) =>
        debouncedChangeMinMax(minValue, stringToNumber(event.target.value, +Infinity)),
    );
    const cbKeyPressEnter = useKeypressCallback(['Escape', 'Enter'], () => props.confirm(), [
        props.confirm,
    ]);

    return (
        <Space direction="vertical" style={{ padding: '8px' }}>
            <Input
                style={{ width: 184 }}
                ref={ref}
                addonBefore="Min"
                allowClear={true}
                defaultValue={minValue || undefined}
                onChange={cbChangeMin}
                onKeyUpCapture={cbKeyPressEnter}
            />
            <Input
                style={{ width: 184 }}
                addonBefore="Max"
                allowClear={true}
                defaultValue={maxValue || undefined}
                onChange={cbChangeMax}
                onKeyUpCapture={cbKeyPressEnter}
            />
        </Space>
    );
});

function stringToNumber(v: string, fallback: number): number {
    if (v === '') return fallback;

    const n = Number(v);

    return isNaN(n) ? fallback : n;
}

function isFiniteNumber(v: unknown): v is number {
    return isNumber(v) && isFinite(v);
}
