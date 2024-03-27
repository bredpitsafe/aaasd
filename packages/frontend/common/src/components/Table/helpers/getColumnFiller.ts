import { ColumnType } from 'antd/es/table';

export function getColumnFiller<T extends object>(): Pick<ColumnType<T>, 'title'> & {
    minWidth: number;
} {
    return {
        title: '',
        minWidth: 1,
    };
}
