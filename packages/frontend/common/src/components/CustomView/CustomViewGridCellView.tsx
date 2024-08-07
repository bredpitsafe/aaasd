import type { Milliseconds } from '@common/types';
import type { Properties } from 'csstype';
import { defaults, isEmpty, pickBy } from 'lodash-es';
import { memo, useMemo } from 'react';

import type { TBacktestingRunId } from '../../types/domain/backtestings';
import type { TCompiledGridCell } from '../../utils/CustomView/parsers/defs';
import { Tooltip } from '../Tooltip';
import { cnGridCell, cnGridCellContent } from './CustomViewGridCellView.css';
import { HtmlCellComponent } from './renderer';
import type { TIndicatorsMap } from './utils';
import { applyCondition, buildCellText } from './utils';

export const CustomViewGridCellView = memo(
    ({
        functionCacheMap,
        cell,
        scriptScope,
        indicators,
        serverTime,
        backtestingRunId,
    }: {
        functionCacheMap: Map<string, unknown>;
        cell: TCompiledGridCell;
        scriptScope: string | undefined;
        indicators: TIndicatorsMap;
        serverTime: Milliseconds;
        backtestingRunId?: TBacktestingRunId;
    }) => {
        const cellParameters = useMemo(
            () =>
                applyCondition(
                    functionCacheMap,
                    cell.parameters,
                    cell.conditions,
                    scriptScope,
                    indicators,
                    serverTime,
                    backtestingRunId,
                ),
            [functionCacheMap, cell, scriptScope, indicators, serverTime, backtestingRunId],
        );

        const cellStyle = useMemo(
            () =>
                defaults(cellParameters?.style ?? {}, {
                    borderRadius: '4px',
                }),
            [cellParameters?.style],
        );

        const cellElement = useMemo(() => {
            return (
                <HtmlCellComponent
                    text={buildCellText(
                        functionCacheMap,
                        cellParameters,
                        scriptScope,
                        indicators,
                        serverTime,
                        backtestingRunId,
                    )}
                    markStyle={cellParameters?.mark?.style}
                />
            );
        }, [
            functionCacheMap,
            cellParameters,
            scriptScope,
            indicators,
            serverTime,
            backtestingRunId,
        ]);

        const gridPositionStyle: Properties = useMemo(
            () => ({
                gridColumn: cellParameters?.column ?? 1,
            }),
            [cellParameters?.column],
        );

        const borderRadiusStyle = useMemo(() => {
            const radiusStyle = pickBy(
                cellStyle,
                (_, key) => key.startsWith('border') && key.endsWith('Radius'),
            );

            return isEmpty(radiusStyle) ? undefined : radiusStyle;
        }, [cellStyle]);

        const cellFullElement = useMemo(
            () => (
                <div className={cnGridCell} style={{ ...borderRadiusStyle, ...gridPositionStyle }}>
                    <div className={cnGridCellContent} style={cellStyle}>
                        {cellElement}
                    </div>
                </div>
            ),
            [gridPositionStyle, borderRadiusStyle, cellStyle, cellElement],
        );

        if (
            cellStyle?.display?.toString()?.toLowerCase() === 'none' ||
            cellStyle?.visibility?.toString()?.toLowerCase() === 'hidden'
        ) {
            return null;
        }

        if (isEmpty(cellParameters?.tooltip)) {
            return cellFullElement;
        }

        return (
            <Tooltip mouseEnterDelay={0.5} title={cellParameters.tooltip}>
                {cellFullElement}
            </Tooltip>
        );
    },
);
