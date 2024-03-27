import { MenuOutlined } from '@ant-design/icons';
import { DndContext, DndContextProps } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cloneElement, DetailedReactHTMLElement, ReactElement, useMemo } from 'react';

import { ColumnsType, ColumnType } from '..';

type TSortableTableProps = Pick<
    DndContextProps,
    | 'autoScroll'
    | 'cancelDrop'
    | 'collisionDetection'
    | 'measuring'
    | 'modifiers'
    | 'sensors'
    | 'onDragStart'
    | 'onDragMove'
    | 'onDragOver'
    | 'onDragEnd'
    | 'onDragCancel'
> & {
    children: ReactElement;
};

const DRAG_KEY = '__DRAG_HANDLE__';
const columnDraggable: ColumnType<unknown> = {
    key: DRAG_KEY,
    title: '',
    width: 30,
    shouldCellUpdate: () => false,
    render: () => <MenuOutlined />,
};

export function SortableTable<T>({ children, ...props }: TSortableTableProps): ReactElement {
    const columns = useMemo(
        () => [columnDraggable, ...children.props.columns] as ColumnsType<T>,
        [children.props.columns],
    );

    const components = useMemo(
        () => ({
            body: {
                wrapper: DraggableWrapper,
                row: DraggableRow,
            },
        }),
        [],
    );

    return (
        <DndContext {...props}>
            {cloneElement(children, {
                columns,
                components,
            })}
        </DndContext>
    );
}

function DraggableWrapper(props: object & { children: ReactElement[] }) {
    const { children, ...restProps } = props;
    /**
     * 'children[1]` is `dataSource`
     * Check if `children[1]` is an array
     * because antd gives 'No Data' element when `dataSource` is an empty array
     */
    return children[1] instanceof Array ? (
        <SortableContext
            items={children[1].map((child) => child.key)}
            strategy={verticalListSortingStrategy}
            {...restProps}
        >
            <tbody {...restProps}>{children}</tbody>
        </SortableContext>
    ) : (
        <tbody {...restProps}>{children}</tbody>
    );
}

function DraggableRow(
    // props['data-row-key'] - is internal value from antd table
    props: object & { ['data-row-key']: string; children: ReactElement },
) {
    const { setNodeRef, setActivatorNodeRef, attributes, listeners, transform, transition } =
        useSortable({
            id: props['data-row-key'],
        });
    const { children, ...restProps } = props;
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };
    /**
     * 'children[1]` is a row of `dataSource`
     * Check if `children[1]` is an array
     * because antd gives 'No Data' element when `dataSource` is an empty array
     */

    return Array.isArray(children) ? (
        <tr ref={setNodeRef} {...attributes} {...restProps} style={style}>
            {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                children.map((child: DetailedReactHTMLElement<any, any>) => {
                    return child.key === DRAG_KEY
                        ? cloneElement(child, {
                              render: () => (
                                  <div ref={setActivatorNodeRef} {...listeners}>
                                      {child.props.render()}
                                  </div>
                              ),
                          })
                        : child;
                })
            }
        </tr>
    ) : (
        <tr {...restProps}>{children}</tr>
    );
}
