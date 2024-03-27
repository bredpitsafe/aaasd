import type {
    ColDef,
    ValueFormatterFunc,
    ValueFormatterParams,
    ValueGetterFunc,
} from '@frontend/ag-grid';
import { EColumnFilterType } from '@frontend/ag-grid/src/types';
import type { TIndicator } from '@frontend/common/src/modules/actions/indicators/defs';
import type { Nil } from '@frontend/common/src/types';
import type { TBacktestingRun } from '@frontend/common/src/types/domain/backtestings';
import { isNil, isNull, isUndefined } from 'lodash-es';

export function checkAllRunsInSingleGroup(runs: TBacktestingRun[]): boolean {
    const firstRun = runs.at(0);
    if (isUndefined(firstRun)) return true;
    for (const run of runs) {
        if (run.group !== firstRun.group) return false;
    }
    return true;
}

export function getRunScoreColumnPrefix(scoreIndicatorsList: string[]): string {
    return `score-cols-${Math.max(1, scoreIndicatorsList.length)}`;
}

function getScoreValueGetter<T extends { scores: Nil | Record<TIndicator['name'], Nil | number> }>(
    scoreIndicatorName: Nil | string,
): ValueGetterFunc<T> {
    return isNil(scoreIndicatorName)
        ? () => undefined
        : ({ data }) => data?.scores?.[scoreIndicatorName];
}

function getScoreValueFormatter<
    T extends { scores: Nil | Record<TIndicator['name'], Nil | number> },
>() {
    return (({ value }: ValueFormatterParams<T, Nil | number>) =>
        isNull(value) ? 'null' : value) as ValueFormatterFunc<T, Nil | number>;
}

export function getRunScoreColumns<
    T extends { scores: Nil | Record<TIndicator['name'], Nil | number> },
>(scoreIndicatorsList: string[], pinned?: ColDef<T>['pinned']): ColDef<T>[] {
    return scoreIndicatorsList.length <= 1
        ? [
              {
                  colId: `score_0_${pinned ?? ''}`,
                  headerName: 'Score',
                  filter: EColumnFilterType.number,
                  enableValue: true,
                  aggFunc: 'sum',
                  valueGetter: getScoreValueGetter(scoreIndicatorsList?.[0]),
                  valueFormatter: getScoreValueFormatter(),
                  pinned,
              },
          ]
        : scoreIndicatorsList.map((scoreIndicatorName, index) => ({
              colId: `score_${index}_${pinned ?? ''}`,
              headerName: `Score - ${scoreIndicatorName}`,
              filter: EColumnFilterType.number,
              enableValue: true,
              aggFunc: 'sum',
              valueGetter: getScoreValueGetter(scoreIndicatorName),
              valueFormatter: getScoreValueFormatter(),
              pinned,
          }));
}
