import type { ColDef } from 'ag-grid-community';

export type TColDef<T extends object> = ColDef<T>;

export enum EColumnFilterType {
    text = 'agTextColumnFilter',
    number = 'agNumberColumnFilter',
    date = 'agDateColumnFilter',
    set = 'agSetColumnFilter',
}

export enum EAgGridTextFilterType {
    contains = 'contains',
    notContains = 'notContains',
    equals = 'equals',
    notEqual = 'notEqual',
    startsWith = 'startsWith',
    endsWith = 'endsWith',
}

export type TAgGridSetFilter<T> = {
    filterType: EColumnFilterType.set;
    values: T[];
};

export type TAgGridTextFilter<T extends EAgGridTextFilterType> = {
    filterType: EColumnFilterType.text;
    filter: string;
    type: T;
};

// Custom
export type TAgGridRadioFilter<T> = {
    filterType: 'Radio';
    value: T;
};
