import type { ColDef } from './ag-grid-community';

export type TColDef<T extends object> = ColDef<T>;

export enum EColumnFilterType {
    text = 'agTextColumnFilter',
    number = 'agNumberColumnFilter',
    date = 'agDateColumnFilter',
    set = 'agSetColumnFilter',
}

type TColumnFilterType = keyof typeof EColumnFilterType;

export enum EAgGridTextFilterType {
    contains = 'contains',
    notContains = 'notContains',
    equals = 'equals',
    notEqual = 'notEqual',
    startsWith = 'startsWith',
    endsWith = 'endsWith',
}

interface TAgGridFilter {
    filterType: TColumnFilterType | 'Radio' | 'external';
}

/**
 * @public
 */
export interface TAgGridSetFilter<TOption = string> extends TAgGridFilter {
    filterType: 'set';
    values: TOption[];
}

export interface TAgGridTextFilter<
    TTextFilterType extends keyof typeof EAgGridTextFilterType = 'contains',
> extends TAgGridFilter {
    filterType: 'text';
    filter: string;
    type: TTextFilterType;
}

// Custom
export interface TAgGridRadioFilter<T = string> extends TAgGridFilter {
    filterType: 'Radio';
    value: T;
}

interface TAgGridExternalFilter<T = string> extends TAgGridFilter {
    filterType: 'external';
    value: T;
}

export type FilterModel = {
    [field: string]:
        | TAgGridSetFilter
        | TAgGridTextFilter
        | TAgGridRadioFilter
        | TAgGridExternalFilter;
};
