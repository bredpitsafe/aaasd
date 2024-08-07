import type { Milliseconds } from '@common/types';
import { memo, useMemo } from 'react';
import { useObservable } from 'react-use';
import type { Observable } from 'rxjs';
import { EMPTY } from 'rxjs';

import type { TBacktestingRunId } from '../../types/domain/backtestings';
import { EMPTY_MAP } from '../../utils/const';
import type { TCompiledGridCell } from '../../utils/CustomView/parsers/defs';
import { isFormattedText } from '../../utils/CustomView/parsers/guards';
import { CustomViewGridCellView } from './CustomViewGridCellView';
import { useNowMillisecondsForLiveCell } from './useNowMillisecondsForLiveCell';
import type { TIndicatorsMap } from './utils';

export const ConnectedCustomViewGridCell = memo(
    ({
        functionCacheMap,
        cell,
        scriptScope,
        indicatorValues$,
        serverTime$,
        backtestingRunId,
    }: {
        functionCacheMap: Map<string, unknown>;
        cell: TCompiledGridCell;
        scriptScope: string | undefined;
        indicatorValues$?: Observable<TIndicatorsMap>;
        serverTime$: Observable<Milliseconds>;
        backtestingRunId?: TBacktestingRunId;
    }) => {
        const indicators = useObservable(indicatorValues$ ?? EMPTY, EMPTY_MAP);

        const hasTimeout = useMemo(
            () =>
                (isFormattedText(cell?.parameters?.text) &&
                    cell.parameters.text.formula.hasTimeout) ||
                cell.conditions?.some(
                    ({ condition, parameters }) =>
                        (condition.hasTimeout ||
                            (isFormattedText(parameters.text) &&
                                parameters.text.formula.hasTimeout)) ??
                        false,
                ),
            [cell],
        );

        const serverTime = useNowMillisecondsForLiveCell(serverTime$, hasTimeout);

        return (
            <CustomViewGridCellView
                functionCacheMap={functionCacheMap}
                cell={cell}
                scriptScope={scriptScope}
                indicators={indicators}
                serverTime={serverTime}
                backtestingRunId={backtestingRunId}
            />
        );
    },
);
