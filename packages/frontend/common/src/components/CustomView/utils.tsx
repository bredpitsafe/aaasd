import type { Milliseconds } from '@common/types';
import { isEmpty, isNil, isObject, merge } from 'lodash-es';

import type {
    TIndicator,
    TIndicatorKey,
    TIndicatorsQuery,
} from '../../modules/actions/indicators/defs';
import type { TBacktestingRunId } from '../../types/domain/backtestings';
import type { TSocketURL } from '../../types/domain/sockets';
import { getCellText } from '../../utils/chartLegends';
import { EMPTY_ARRAY } from '../../utils/const';
import type {
    TCompiledGridCellParameters,
    TCompiledTableCellParameters,
    TCondition,
    TCustomViewIndicatorKey,
} from '../../utils/CustomView/parsers/defs';
import { isFormattedText } from '../../utils/CustomView/parsers/guards';
import { ContextArgumentNames, getContextArgumentValues } from './context';

export type TIndicatorsMap = ReadonlyMap<TIndicatorKey, TIndicator>;

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
