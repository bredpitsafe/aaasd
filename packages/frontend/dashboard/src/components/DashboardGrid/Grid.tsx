import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import cn from 'classnames';
import { isMatch, isNumber } from 'lodash-es';
import type { ReactElement } from 'react';
import { useMemo, useRef } from 'react';
import type { Layout, ReactGridLayoutProps } from 'react-grid-layout';
import GridLayout, { WidthProvider } from 'react-grid-layout';
import useResizeObserver from 'use-resize-observer';

import type { TGridSettings } from '../../types/layout';
import type { TPanelGridCell } from '../../types/panel';
import { getGridRowHeight, gridCellToLayout, layoutToGridCell } from '../../utils/layout';
import { HotKeyActionSettings } from '../HotKeysActions';
import { cnRoot } from './Grid.css';

export const DRAGGABLE_HANDLE_CLASS_NAME = 'DRAGGABLE_HANDLE';
const SELECTOR = `.${DRAGGABLE_HANDLE_CLASS_NAME}`;

type TGridProps = Pick<ReactGridLayoutProps, 'className' | 'style'> &
    Pick<TGridSettings, 'margin' | 'rowsCount' | 'colsCount'> & {
        isFixed?: boolean;
        cells: TPanelGridCell[];
        onLayoutChange?: (panels: TPanelGridCell[]) => void;
        children: ReactElement[];
    };

export const Grid = WidthProvider(function (props: TGridProps): ReactElement {
    const resizeRef = useRef<HTMLDivElement>(null);
    const gridRef = useRef<GridLayout>(null);
    const { width, height } = useResizeObserver<HTMLDivElement>({ ref: resizeRef });
    const cbLayoutChange = useFunction((layouts: Layout[]) => {
        if (!props.onLayoutChange || props.isFixed) {
            return;
        }

        const oldLayout = props.cells;
        const newLayout = layouts.map((l) => layoutToGridCell(props.colsCount, props.rowsCount, l));

        if (isMatch(oldLayout, newLayout)) {
            return;
        }

        props.onLayoutChange(newLayout);
    });
    const layout = useMemo(
        () => props.cells.map((c) => gridCellToLayout(props.colsCount, props.rowsCount, c)),
        // We should change link to layout for correct resize cells
        // if changes someone of this parameters (problem in GridLayout)
        [props.cells, props.colsCount, props.rowsCount],
    );
    const rowHeight = useMemo(
        () => (height ? getGridRowHeight(props.rowsCount, props.margin, height) : 0),
        [props.rowsCount, props.margin, height],
    );

    return (
        <div ref={resizeRef} className={cn(cnRoot, props.className)}>
            {isNumber(width) && isNumber(height) ? (
                <HotKeyActionSettings>
                    <GridLayout
                        ref={gridRef}
                        style={props.style}
                        width={width}
                        cols={props.colsCount}
                        rowHeight={rowHeight}
                        margin={[props.margin, props.margin]}
                        layout={layout}
                        isDraggable={!props.isFixed}
                        isResizable={!props.isFixed}
                        draggableHandle={SELECTOR}
                        onLayoutChange={cbLayoutChange}
                    >
                        {props.children}
                    </GridLayout>
                </HotKeyActionSettings>
            ) : null}
        </div>
    );
});
