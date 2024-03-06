import type { ColumnsType } from 'antd/lib/table';
import cn from 'classnames';
import cxs from 'cxs';
import { isEmpty, isNil, isObject, merge } from 'lodash-es';
import type { GetComponentProps } from 'rc-table/lib/interface';
import type { TableProps } from 'rc-table/lib/Table';
import type { ReactNode } from 'react';

import { createTestClasName } from '../../../e2e';
import type {
    TIndicator,
    TIndicatorKey,
    TIndicatorsQuery,
} from '../../modules/actions/indicators/defs';
import type { TBacktestingRunId } from '../../types/domain/backtestings';
import type { TSocketURL } from '../../types/domain/sockets';
import type { Milliseconds } from '../../types/time';
import { getCellText } from '../../utils/chartLegends';
import { EMPTY_ARRAY } from '../../utils/const';
import { increaseSpecificity } from '../../utils/css/increaseSpecificity';
import type {
    TCompiledGridCellParameters,
    TCompiledTableCellParameters,
    TCompiledTableParameters,
    TCompiledTableRow,
    TCondition,
    TCustomViewCompiledTableContent,
    TCustomViewIndicatorKey,
} from '../../utils/CustomView/parsers/defs';
import { isFormattedText } from '../../utils/CustomView/parsers/guards';
import { Tooltip } from '../Tooltip';
import { ContextArgumentNames, getContextArgumentValues } from './context';
import { HtmlCellComponent } from './renderer';
import { cnInlineBlock } from './utils.css';

export type TIndicatorsMap = ReadonlyMap<TIndicatorKey, TIndicator>;

export type TTableRow = Record<`column_${number}`, ReactNode> &
    Record<`columnClassName_${number}`, string> & {
        key: number;
        rowClassName?: string;
        children?: TTableRow[];
    };

export function buildCellText(
    functionCacheMap: Map<string, unknown>,
    parameters: TCompiledGridCellParameters | TCompiledTableCellParameters,
    scriptScope: string | undefined,
    indicators: TIndicatorsMap,
    serverNow: Milliseconds,
    backtestingRunId: undefined | TBacktestingRunId,
): string {
    if (!isFormattedText(parameters?.text)) {
        return parameters?.text ?? '';
    }

    try {
        const value = getFunction<number | null | undefined>(
            functionCacheMap,
            parameters.text.formula.constructorArguments,
            scriptScope,
        )(serverNow, indicators, backtestingRunId)?.valueOf();

        return getCellText(parameters.text.format, value, {
            undefinedValue: '',
        });
    } catch (e) {
        return (e as Error).message;
    }
}

export function applyCondition<TParameters>(
    functionCacheMap: Map<string, unknown>,
    parameters: TParameters,
    conditions: TCondition<TParameters>[],
    scriptScope: string | undefined,
    indicators: TIndicatorsMap,
    serverNow: Milliseconds,
    backtestingRunId: undefined | TBacktestingRunId,
): TParameters {
    if (isNil(conditions) || conditions.length === 0) {
        return parameters;
    }

    let isSourceObject = true;
    let resultParameters = parameters;

    for (const condition of conditions) {
        try {
            if (
                !getFunction(
                    functionCacheMap,
                    condition.condition.constructorArguments,
                    scriptScope,
                )(serverNow, indicators, backtestingRunId)
            ) {
                continue;
            }
        } catch (e) {
            continue;
        }

        if (isEmpty(condition.parameters)) {
            continue;
        }

        if (isSourceObject) {
            isSourceObject = false;
            resultParameters = merge({}, resultParameters, condition.parameters);
        } else {
            resultParameters = merge(resultParameters, condition.parameters);
        }
    }

    return resultParameters;
}

export function buildDatasource(
    functionCacheMap: Map<string, unknown>,
    compiledTable: TCustomViewCompiledTableContent,
    indicators: TIndicatorsMap,
    serverNow: Milliseconds,
    backtestingRunId: undefined | TBacktestingRunId,
): TableProps<TTableRow>['data'] {
    let rowIndex = 0;

    function buildDatasource(
        rows?: TCompiledTableRow[],
        offset = 0,
    ): TableProps<TTableRow>['data'] {
        if (isNil(rows)) {
            return undefined;
        }

        return rows.map((row) => {
            const children = buildDatasource(row.rows, offset + 1);

            const rowParameters = applyCondition(
                functionCacheMap,
                row.parameters,
                row.conditions,
                compiledTable.scope,
                indicators,
                serverNow,
                backtestingRunId,
            );

            const baseRowData: TTableRow = { key: rowIndex++ };

            if (!isEmpty(rowParameters.style)) {
                const testClassName = createTestClasName(
                    'background: ' + rowParameters.style!.backgroundColor ??
                        rowParameters.style!.background,
                );

                const className = cxs(rowParameters.style!);

                Object.assign(baseRowData, {
                    rowClassName: `${testClassName} ${className}`,
                });
            }

            if (!isEmpty(children)) {
                Object.assign(baseRowData, { children });
            }

            return row.cells.reduce((acc, cell, index) => {
                const cellParameters = applyCondition(
                    functionCacheMap,
                    cell.parameters,
                    cell.conditions,
                    compiledTable.scope,
                    indicators,
                    serverNow,
                    backtestingRunId,
                );

                if (!isEmpty(cellParameters?.style)) {
                    acc[`columnClassName_${index + offset}`] = cxs(
                        // Override own AntDesign Table styles + Custom overrides
                        // @ts-ignore
                        increaseSpecificity(cellParameters.style!, 2),
                    );
                }

                const element = (
                    <div
                        className={cn({
                            [cnInlineBlock]: index + offset === 0,
                        })}
                    >
                        <HtmlCellComponent
                            text={buildCellText(
                                functionCacheMap,
                                cellParameters,
                                compiledTable.scope,
                                indicators,
                                serverNow,
                                backtestingRunId,
                            )}
                            markStyle={cellParameters?.mark?.style}
                        />
                    </div>
                );

                if (!isEmpty(cellParameters?.tooltip)) {
                    acc[`column_${index + offset}`] = (
                        <Tooltip mouseEnterDelay={0.5} title={cellParameters.tooltip}>
                            {element}
                        </Tooltip>
                    );
                } else {
                    acc[`column_${index + offset}`] = element;
                }

                return acc;
            }, baseRowData);
        });
    }

    return buildDatasource(compiledTable.rows);
}

export function buildColumns(tableParameters: TCompiledTableParameters): ColumnsType<TTableRow> {
    return new Array(
        Math.max(tableParameters.maxRowColumnsCount ?? 0, tableParameters.columns?.length ?? 0),
    )
        .fill(0)
        .map((_, index) => ({
            title: tableParameters.columns?.[index]?.text,
            dataIndex: `column_${index}`,
            key: `column_${index}`,
            width: tableParameters.columns?.[index]?.width,
            onCell: getCellAttributes.bind(undefined, index),
        }));
}

function getCellAttributes(
    index: number,
    record: TTableRow,
): ReturnType<GetComponentProps<TTableRow>> {
    const className = record[`columnClassName_${index}`];
    return isNil(className) ? {} : { className };
}

type TArrowFunction<T> = (
    serverNow: Milliseconds,
    indicators: TIndicatorsMap,
    backtestingRunId: undefined | TBacktestingRunId,
) => T;

function getFunction<T = unknown>(
    functionCacheMap: Map<string, unknown>,
    args: [string, string, string],
    scriptScope: string | undefined,
): TArrowFunction<T> {
    const fn = functionCacheMap.get(args[2]) as TArrowFunction<T> | undefined;

    if (!isNil(fn)) {
        return fn;
    }

    const generalFn = new Function(
        args[0],
        args[1],
        ...ContextArgumentNames,
        contextifyFunctionBody(scriptScope, args[2]),
    );

    const newFn = (
        serverNow: Milliseconds,
        indicators: TIndicatorsMap,
        backtestingRunId: undefined | TBacktestingRunId,
    ) => generalFn(indicators, backtestingRunId, ...getContextArgumentValues(serverNow));

    functionCacheMap.set(args[2], newFn);

    return newFn;
}

function contextifyFunctionBody(context: string | undefined, body: string): string {
    return `${context ?? ''}

${body ?? ''}`;
}

export function getQueriesFromIndicators(
    fullIndicatorNames: TCustomViewIndicatorKey[],
): TIndicatorsQuery[] {
    if (isNil(fullIndicatorNames) || fullIndicatorNames.some((name) => !isObject(name))) {
        return EMPTY_ARRAY;
    }

    const indicatorsSourceRecord = fullIndicatorNames.reduce(
        (acc, { url, name }) => {
            if (isNil(acc[url])) {
                acc[url] = new Set([name]);
            } else {
                acc[url].add(name);
            }

            return acc;
        },
        {} as Record<TSocketURL, Set<TIndicator['name']>>,
    );

    const queries: TIndicatorsQuery[] = [];

    for (const url in indicatorsSourceRecord) {
        queries.push({
            url: url as TSocketURL,
            names: Array.from(
                (indicatorsSourceRecord[url as TSocketURL] as Set<TIndicator['name']>).values(),
            ).sort(),
        });
    }

    return queries;
}
