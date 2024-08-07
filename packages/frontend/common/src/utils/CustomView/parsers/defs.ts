import type { Properties } from 'csstype';

import type { TIndicator } from '../../../modules/actions/indicators/defs';
import type { TSocketURL } from '../../../types/domain/sockets';
import type { TXmlToJsonArray } from '../../../types/xml';
import type { TXmlCssProperties } from '../defs';

export type TCustomViewIndicatorKey = {
    url: TSocketURL;
    name: TIndicator['name'];
};

export type TCustomViewCompiledGrid = {
    grid: TCustomViewCompiledGridContent;
};

export type TCustomViewCompiledGridContent = {
    parameters: TCompiledGridParameters;
    conditions: TCondition<TCompiledGridParameters>[];

    cells: TCompiledGridCell[];

    indicators: TCustomViewIndicatorKey[];
    allIndicators: TCustomViewIndicatorKey[];
    hasTimeout: boolean;

    scope?: string;

    version?: number;
};

export type TCompiledGridParameters = {
    columnsCount: number;
    style?: Properties;
};

export type TCompiledGridCellParameters = {
    column?: number;
    text?: string | TFormattedText;
    tooltip?: string;
    mark?: TCompiledGridMarkParameters;
    style?: Properties;
};

export type TCompiledGridMarkParameters = {
    style?: Properties;
};

export type TCompiledGridCell = {
    parameters: TCompiledGridCellParameters;
    conditions: TCondition<TCompiledGridCellParameters>[];
    indicators: TCustomViewIndicatorKey[];
};

export type TCustomViewCompiledTable = {
    table: TCustomViewCompiledTableContent;
};

export type TCustomViewCompiledTableContent = {
    parameters: TCompiledTableParameters;
    conditions: TCondition<TCompiledTableParameters>[];

    rows: TCompiledTableRow[];

    indicators: TCustomViewIndicatorKey[];
    allIndicators: TCustomViewIndicatorKey[];
    hasTimeout: boolean;

    scope?: string;

    version?: number;
};

export type TCompiledTableParameters = {
    style?: Properties;
    columns?: TCompiledTableHeaderColumn[];
    maxRowColumnsCount: number;
};

export type TCompiledTableHeaderColumn = {
    text?: string;
    width?: string;
};

export type TCompiledTableRow = {
    parameters: TCompiledTableRowParameters;
    conditions: TCondition<TCompiledTableRowParameters>[];

    rows?: TCompiledTableRow[];
    cells: TCompiledTableCell[];

    indicators: TCustomViewIndicatorKey[];
    allIndicators: TCustomViewIndicatorKey[];
};

export type TCompiledTableRowParameters = {
    style?: Properties;
};

export type TCompiledTableCell = {
    parameters: TCompiledTableCellParameters;
    conditions: TCondition<TCompiledTableCellParameters>[];
    indicators: TCustomViewIndicatorKey[];
};

export type TCompiledTableCellParameters = {
    text?: string | TFormattedText;
    tooltip?: string;
    mark?: TCompiledGridMarkParameters;
    style?: Properties;
};

export type TFormattedText = {
    format?: string;
    formula: {
        original: string;
        constructorArguments: TFunctionConstructorArgument;
        indicators: TCustomViewIndicatorKey[];
        hasTimeout: boolean;
    };
};

export type TCondition<TParameters> = {
    condition: {
        original: string;
        constructorArguments: TFunctionConstructorArgument;
        indicators: TCustomViewIndicatorKey[];
        hasTimeout: boolean;
    };

    parameters: TParameters;
};

export type TFunctionConstructorArgument = [string, string, string];

export type TXmlCondition<T> = T & {
    condition: string;
};

export type TXmlImportableTableRowParameters = Partial<{
    style: TXmlCssProperties | '';
}>;

export type TXmlImportableTableRow = TXmlImportableTableRowParameters &
    Partial<{
        if: TXmlToJsonArray<TXmlCondition<TXmlImportableTableRowParameters>>;
        row: TXmlToJsonArray<TXmlImportableTableRow>;
        cell: TXmlToJsonArray<TXmlImportableTableCell | string>;
    }>;

export type TXmlImportableTableCellParameters = TXmlImportableBaseCellParameters;

export type TXmlImportableTableCell = TXmlImportableTableCellParameters &
    Partial<{
        useTemplate: TXmlToJsonArray<TXmlImportableTemplateUse>;
        if: TXmlToJsonArray<TXmlCondition<TXmlImportableTableCellParameters>>;
    }>;

export type TXmlImportableCustomViewMetadata = Partial<{
    scope: string;
    source: TXmlToJsonArray<{
        name: string;
        url: string;
    }>;
}>;

export type TXmlImportableTableParameters = TXmlImportableCustomViewMetadata &
    Partial<{
        header: {
            column: TXmlToJsonArray<{
                text?: string;
                width?: number;
            }>;
        };
    }>;

export type TXmlImportableTable = TXmlImportableTableParameters &
    Partial<{
        template: TXmlToJsonArray<TXmlImportableTemplate>;
        if: TXmlToJsonArray<TXmlCondition<TXmlImportableTableParameters>>;
        row: TXmlToJsonArray<TXmlImportableTableRow>;
    }>;

export type TXmlImportableGridCellParameters = TXmlImportableBaseCellParameters &
    Partial<{
        column: number;
    }>;

export type TXmlImportableGridCell = TXmlImportableGridCellParameters &
    Partial<{
        useTemplate: TXmlToJsonArray<TXmlImportableTemplateUse>;
        if: TXmlToJsonArray<TXmlCondition<TXmlImportableGridCellParameters>>;
    }>;

export type TXmlImportableGridParameters = TXmlImportableCustomViewMetadata &
    Partial<{
        style: TXmlCssProperties | '';
    }>;

export type TXmlImportableGrid = TXmlImportableGridParameters &
    Partial<{
        template: TXmlToJsonArray<TXmlImportableTemplate>;
        if: TXmlToJsonArray<TXmlCondition<TXmlImportableGridParameters>>;
        cell: TXmlToJsonArray<TXmlImportableGridCell | string>;
    }>;

export type TXmlImportableBaseCellParameters = Partial<{
    style: TXmlCssProperties | '';
    tooltip: string;
    mark: {
        style?: TXmlCssProperties | '';
    };
    text?:
        | string
        | {
              format?: string;
              formula: string;
          };
}>;

export type TXmlImportableTemplateUse = {
    name: string;
    parameters: { parameter: TXmlToJsonArray<string> };
};

export type TXmlImportableTemplate = TXmlImportableGridCellParameters & {
    name: string;
} & Partial<{
        parameters?: { parameter: TXmlToJsonArray<string> };
        if: TXmlToJsonArray<TXmlCondition<TXmlImportableGridCellParameters>>;
    }>;
