import { DragEndEvent } from '@dnd-kit/core/dist/types';
import { ColumnsType, Table } from '@frontend/common/src/components/Table';
import { SortableTable } from '@frontend/common/src/components/Table/components/SortableTable';
import type { TWithClassname, TWithStyle } from '@frontend/common/src/types/components';
import { arrayMove } from '@frontend/common/src/utils/arrayMove';
import { useDebouncedFunction } from '@frontend/common/src/utils/React/useDebouncedFunction';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import cn from 'classnames';
import { ReactElement, useMemo, useRef } from 'react';
import mergeRefs from 'react-merge-refs';
import useResizeObserver from 'use-resize-observer';

import { TChartProps } from '../../types';
import {
    getColumnColor,
    getColumnDelete,
    getColumnOpacity,
    getColumnType,
    getColumnVisible,
    getColumnWidth,
    getColumnYAxis,
} from './columns';
import { cnTable } from './index.css';

type TableChartEditorProps = TWithClassname &
    TWithStyle & {
        charts: TChartProps[];
        onDelete: (id: TChartProps['id']) => unknown;
        onChange: (chart: TChartProps) => unknown;
        onSort: (ids: TChartProps['id'][]) => unknown;
    };

type TFieldChanger<T extends keyof TChartProps> = (
    id: TChartProps['id'],
    field: T,
    value: TChartProps[T],
) => unknown;

const HEADER_HEIGHT = 34;

const createFieldUpdater =
    <T extends keyof TChartProps>(changer: TFieldChanger<T>, field: T) =>
    (id: TChartProps['id'], value: TChartProps[T]) => {
        changer(id, field, value);
    };

export function TableChartsEditor(props: TableChartEditorProps): ReactElement {
    const { ref: resizeRef, height: rootHeight = 0 } = useResizeObserver();
    const updateField = useFunction(
        <T extends keyof TChartProps>(id: TChartProps['id'], field: T, value: TChartProps[T]) => {
            const chart = props.charts.find((p) => p.id === id);
            chart && props.onChange({ ...chart, [field]: value });
        },
    );
    const handleDragEnd = useFunction((event: DragEndEvent) => {
        const { active, over } = event;

        if (over !== null && active.id !== over.id) {
            // In this example, find an item, where `item.key` === `useSortable.id`.
            const oldIndex = props.charts.findIndex((item) => item.id === active.id);
            const newIndex = props.charts.findIndex((item) => item.id === over.id);

            props.onSort(arrayMove(props.charts, oldIndex, newIndex).map((c) => c.id));
        }
    });

    const debouncedUpdateField = useDebouncedFunction(updateField, 300);

    const columns = useMemo(() => {
        return [
            getColumnType(createFieldUpdater(debouncedUpdateField, 'type')),
            getColumnColor(createFieldUpdater(debouncedUpdateField, 'color')),
            getColumnOpacity(createFieldUpdater(debouncedUpdateField, 'opacity')),
            getColumnWidth(createFieldUpdater(debouncedUpdateField, 'width')),
            getColumnVisible(createFieldUpdater(debouncedUpdateField, 'visible')),
            getColumnYAxis(createFieldUpdater(debouncedUpdateField, 'yAxis')),
            getColumnDelete(props.onDelete),
        ] as ColumnsType<TChartProps>;
    }, [debouncedUpdateField, props.onDelete]);

    const tableRef = useRef<HTMLDivElement>(null);
    const styleHeight = tableRef.current !== null ? tableRef.current?.style.height : undefined;
    const scroll = useMemo(() => {
        return {
            x: 'max-content',
            y: computeScrollY(styleHeight, rootHeight),
        };
    }, [styleHeight, rootHeight]);

    return (
        <SortableTable onDragEnd={handleDragEnd}>
            <Table
                ref={mergeRefs([tableRef, resizeRef])}
                style={props.style}
                className={cn(cnTable, props.className)}
                rowKey="id"
                dataSource={props.charts}
                columns={columns}
                pagination={false}
                scroll={scroll}
            />
        </SortableTable>
    );
}

function computeScrollY(
    styleHeight: undefined | number | string,
    absHeight: number,
): undefined | number {
    const isRelativeHeight = String(styleHeight).indexOf('%') !== -1;
    return isRelativeHeight
        ? Math.max(0, (parseFloat(styleHeight as string) / 100) * absHeight - HEADER_HEIGHT)
        : undefined;
}
