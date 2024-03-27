import type { ColumnType } from 'antd/lib/table';

export function withAlphaNumericSorting<RecordType>(
    getValue: (record: RecordType) => string,
    multiple?: number,
): Pick<ColumnType<RecordType>, 'sorter'> {
    return {
        sorter: {
            compare: (a: RecordType, b: RecordType) => {
                return getValue(a).localeCompare(getValue(b));
            },
            multiple,
        },
    };
}
