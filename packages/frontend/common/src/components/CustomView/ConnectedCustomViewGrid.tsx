import cn from 'classnames';
import type { Properties } from 'csstype';
import { memo, useMemo } from 'react';
import { EMPTY } from 'rxjs';

import { useModule } from '../../di/react';
import { ModuleSocketServerTime } from '../../modules/socketServerTime';
import type { TBacktestingRunId } from '../../types/domain/backtestings';
import type { TSocketURL } from '../../types/domain/sockets';
import { EMPTY_MAP } from '../../utils/const';
import type { EApplicationOwner } from '../../utils/CustomView/defs';
import type { TCustomViewCompiledGridContent } from '../../utils/CustomView/parsers/defs';
import { useSyncObservable } from '../../utils/React/useSyncObservable.ts';
import { useContentScaleToParent } from '../hooks/useContentScaleToParent';
import { cnGrid } from './ConnectedCustomViewGrid.css';
import { ConnectedCustomViewGridCell } from './CustomViewGridCell';
import { EObservableGroupType, useIndicatorsObservablesForGrid } from './useIndicatorsObservables';
import { useNowMillisecondsForLiveCell } from './useNowMillisecondsForLiveCell';
import type { TIndicatorsMap } from './utils';
import { applyCondition } from './utils';

export type TCustomViewGridProps = {
    className?: string;
    statusStyle?: Properties;
    grid: TCustomViewCompiledGridContent;
    owner: EApplicationOwner;
    url: TSocketURL;
    backtestingRunId?: TBacktestingRunId;
};

export const ConnectedCustomViewGrid = memo(
    ({ className, statusStyle, grid, url, backtestingRunId }: TCustomViewGridProps) => {
        const { getServerTime$ } = useModule(ModuleSocketServerTime);

        const indicatorsGroupMap = useIndicatorsObservablesForGrid(
            backtestingRunId,
            grid.cells,
            grid.indicators,
            grid.allIndicators,
        );

        const resultClassName = useMemo(() => cn(cnGrid, className), [className]);

        const isTimerDependent = useMemo(
            () => grid.conditions.some(({ condition }) => condition.hasTimeout),
            [grid],
        );

        const serverTime$ = useMemo(() => getServerTime$(url), [getServerTime$, url]);
        const serverNow = useNowMillisecondsForLiveCell(serverTime$, isTimerDependent);

        const indicators =
            useSyncObservable(indicatorsGroupMap.get(EObservableGroupType.Grid) ?? EMPTY) ??
            (EMPTY_MAP as TIndicatorsMap);

        // eslint-disable-next-line react-hooks/exhaustive-deps
        const functionCacheMap = useMemo(() => new Map<string, unknown>(), [grid.scope]);

        const gridParameters = useMemo(
            () =>
                applyCondition(
                    functionCacheMap,
                    grid.parameters,
                    grid.conditions,
                    grid.scope,
                    indicators,
                    serverNow,
                    backtestingRunId,
                ),
            [functionCacheMap, grid, indicators, serverNow, backtestingRunId],
        );

        const style: Properties = useMemo(
            () => ({
                ...statusStyle,
                ...gridParameters.style,
                gridTemplateColumns: `repeat(${gridParameters.columnsCount}, minmax(min-content, 1fr))`,
            }),
            [gridParameters.columnsCount, gridParameters.style, statusStyle],
        );

        const ref = useContentScaleToParent<HTMLDivElement>();

        const gridCells = useMemo(
            () =>
                grid.cells?.map((cell, index) => (
                    <ConnectedCustomViewGridCell
                        key={index}
                        functionCacheMap={functionCacheMap}
                        cell={cell}
                        scriptScope={grid.scope}
                        indicatorValues$={indicatorsGroupMap.get(index)}
                        serverTime$={serverTime$}
                        backtestingRunId={backtestingRunId}
                    />
                )),
            [functionCacheMap, grid, indicatorsGroupMap, serverTime$, backtestingRunId],
        );

        return (
            <div ref={ref} className={resultClassName} style={style}>
                {gridCells}
            </div>
        );
    },
);
