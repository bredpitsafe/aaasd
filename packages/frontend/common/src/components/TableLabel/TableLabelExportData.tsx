import { SaveFilled, SaveOutlined } from '@ant-design/icons';
import { EDateTimeFormats } from '@common/types';
import dayjs from 'dayjs';
import type { FieldInfo, Json2CsvTransform } from 'json2csv';
import type { MouseEventHandler, ReactElement } from 'react';
import { useEffect, useState } from 'react';

import {
    ETableTabFilterProps,
    ETableTabFilterSelectors,
} from '../../../e2e/selectors/table-tab.filter.selectors';
import { useModule } from '../../di/react';
import { ModuleMessages } from '../../lib/messages';
import { clipboardWrite } from '../../utils/clipboard';
import { saveAsString } from '../../utils/fileSaver';
import { useFunction } from '../../utils/React/useFunction';
import { TableLabelButton } from './Button';

export type TFieldInfo<T> = FieldInfo<T>;

export type TParseCSVOptions<T = unknown> = {
    fields?: Array<string | TFieldInfo<T>> | undefined;
    ndjson?: boolean | undefined;
    defaultValue?: string | undefined;
    quote?: string | undefined;
    escapedQuote?: string | undefined;
    delimiter?: string | undefined;
    eol?: string | undefined;
    excelStrings?: boolean | undefined;
    header?: boolean | undefined;
    includeEmptyRows?: boolean | undefined;
    withBOM?: boolean | undefined;
    transforms?: Array<Json2CsvTransform<any, any>> | undefined;
};

enum EExtensionMode {
    CSV = 'CSV',
    TSV = 'TSV',
    JSON = 'JSON',
}

enum EActionMode {
    Copy = 'copy',
    Export = 'export',
}

enum ESelectionMode {
    AllRows = 'allData',
    SelectedRows = 'selectedRows',
}

type TUseCopyToClipboardProps<T> = {
    getData: () => T[] | undefined;
    filename: string;
    selectedRows?: T[];
    getOptions?: () => TParseCSVOptions<T> | Promise<TParseCSVOptions<T>>;
};

export function TableLabelExportData<T extends Record<string, unknown>>(
    props: TUseCopyToClipboardProps<T>,
): ReactElement {
    const [selectedRows, setSelectedRows] = useState<T[]>(props.selectedRows || []);
    const { success } = useModule(ModuleMessages);

    useEffect(() => {
        if (props.selectedRows !== undefined) {
            setSelectedRows(props.selectedRows);
        }
    }, [props.selectedRows]);

    const hasActiveSelection = selectedRows.length > 0;

    const cbSelectCopyOption = useFunction(
        async (
            selection: ESelectionMode,
            extension: EExtensionMode,
            action: EActionMode,
            skipHeaders: boolean,
        ) => {
            let data: T[] = [];
            let str = '';

            switch (selection) {
                case ESelectionMode.SelectedRows: {
                    data = selectedRows;
                    break;
                }
                case ESelectionMode.AllRows: {
                    data = props.getData() || data;
                }
            }
            const options = await props.getOptions?.();

            switch (extension) {
                case EExtensionMode.JSON: {
                    const exportObj = getExportedJSON(data, options);
                    str = JSON.stringify(exportObj, undefined, 2);
                    break;
                }
                case EExtensionMode.CSV: {
                    str = await getCSVString(data, async () => {
                        return {
                            ...options,
                            header: !skipHeaders,
                        };
                    });
                    break;
                }
                case EExtensionMode.TSV: {
                    str = await getCSVString(data, async () => {
                        return {
                            ...options,
                            header: !skipHeaders,
                            delimiter: '\t',
                        };
                    });
                    break;
                }
            }

            if (str) {
                switch (action) {
                    case EActionMode.Copy: {
                        await clipboardWrite(str);
                        success(`${data.length} table rows copied to clipboard as ${extension}`);
                        return;
                    }
                    case EActionMode.Export: {
                        const name =
                            props.filename +
                            '__' +
                            dayjs(Date.now()).format(EDateTimeFormats.DateTime);
                        await saveAsString(str, name, extension);
                        success(`${data.length} table rows saved as "${name}.${extension}"`);
                    }
                }
            }
        },
    );

    const cbButtonClick = useFunction(
        (extension: EExtensionMode): MouseEventHandler<HTMLElement> =>
            (event) => {
                const action =
                    event.ctrlKey || event.metaKey ? EActionMode.Export : EActionMode.Copy;

                const selection = hasActiveSelection
                    ? ESelectionMode.SelectedRows
                    : ESelectionMode.AllRows;

                const skipHeaders = event.altKey;

                return cbSelectCopyOption(selection, extension, action, skipHeaders);
            },
    );
    const title = `${
        hasActiveSelection ? 'Click to copy selected lines' : 'Click to copy'
    }\nCtrl+Click to export`;
    const altModeTitle = `Alt+Click to copy w/o headers\nCtrl+Alt+Click to export w/o headers`;

    const icon = hasActiveSelection ? <SaveFilled /> : <SaveOutlined />;

    return (
        <>
            <TableLabelButton
                {...ETableTabFilterProps[ETableTabFilterSelectors.CSVButton]}
                icon={icon}
                title={`${title}\n${altModeTitle}`}
                onClick={cbButtonClick(EExtensionMode.CSV)}
            >
                CSV
            </TableLabelButton>
            <TableLabelButton
                {...ETableTabFilterProps[ETableTabFilterSelectors.TSVButton]}
                icon={icon}
                title={`${title}\n${altModeTitle}`}
                onClick={cbButtonClick(EExtensionMode.TSV)}
            >
                TSV
            </TableLabelButton>
            <TableLabelButton
                {...ETableTabFilterProps[ETableTabFilterSelectors.JSONButton]}
                icon={icon}
                title={title}
                onClick={cbButtonClick(EExtensionMode.JSON)}
            >
                JSON
            </TableLabelButton>
        </>
    );
}

async function getCSVString<T = unknown>(
    value: T[],
    getOptions?: () => Promise<TParseCSVOptions<T>>,
): Promise<string> {
    const { parseAsync } = await import('json2csv');
    const options = await getOptions?.();
    return parseAsync(value, options);
}

function getExportedJSON<T extends Record<string, unknown>>(
    data: T[],
    options?: TParseCSVOptions<T>,
): Record<string, unknown>[] {
    if (options?.fields === undefined) {
        return data;
    }

    return data.map((item) => {
        return options.fields!.reduce(
            (acc, field) => {
                if (typeof field === 'string') {
                    acc[field] = item[field];
                } else if (typeof field.value === 'string') {
                    const { label, value } = field;
                    if (label !== undefined) {
                        acc[label] = item[value];
                    }
                } else {
                    const { label } = field;
                    if (label !== undefined) {
                        acc[label] = field.value(item, { label });
                    }
                }

                return acc;
            },
            {} as Record<string, unknown>,
        );
    });
}
