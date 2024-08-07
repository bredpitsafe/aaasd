export type TTableData<T> = {
    key: keyof T;
    value: T[keyof T];
};
