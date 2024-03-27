import type { ColumnType } from 'antd/lib/table';

export function withNumericSorting<RecordType>(
    getValue: (record: RecordType) => number,
    multiple?: number,
): Pick<ColumnType<RecordType>, 'sorter'> {
    return {
        sorter: {
            compare: (a: RecordType, b: RecordType) => {
                return getValue(a) - getValue(b);
            },
            multiple,
        },
    };
}
