import type { Column, IHeaderParams } from '@frontend/ag-grid';
import cn from 'classnames';
import { isNil } from 'lodash-es';
import type { ReactElement } from 'react';
import { useState } from 'react';
import { useEvent } from 'react-use';

import { useFunction } from '../../utils/React/useFunction';

export function MenuHeader(props: IHeaderParams): ReactElement {
    const [menuRef, setMenuRef] = useState<HTMLDivElement | null>(null);

    /* Normal click changes sort state */
    const cbClick = useFunction((e) => {
        props.enableSorting && props.progressSort(e.shiftKey);
    });
    useEvent('click', cbClick, menuRef);

    /* Right click calls the context menu */
    const cbContextMenu = useFunction((e) => {
        e.preventDefault();
        props.enableMenu && props.showColumnMenu(menuRef!);
    });
    useEvent('contextmenu', cbContextMenu, menuRef);

    /* Filter state change detection */
    const [isFiltering, setIsFiltering] = useState<boolean>(props.column.isFilterActive());
    const cbFilterChange = useFunction(() => {
        setIsFiltering(props.column.isFilterActive());
    });
    useEvent('filterChanged', cbFilterChange, props.column);

    /* Sort state change detection */
    const [isSorting, setIsSorting] = useState<boolean>(props.column.isSorting());
    const [sortOrder, setSortOrder] = useState<ReturnType<typeof getSortOrder>>(
        getSortOrder(props.column),
    );
    const cbSortChange = useFunction(() => {
        const hasSorting = props.column.isSorting();
        setIsSorting(hasSorting);
        setSortOrder(hasSorting ? getSortOrder(props.column) : undefined);
    });
    useEvent('sortChanged', cbSortChange, props.column);

    const sortIndex = props.column.getSortIndex();
    const showSortIndex = isSorting && !isNil(sortIndex) && sortIndex > 0;

    return (
        <div className="ag-cell-label-container" role="presentation" ref={setMenuRef}>
            <div className="ag-header-cell-label" role="presentation">
                <span className="ag-header-cell-text" role="columnheader">
                    {props.displayName}
                </span>

                {isFiltering && (
                    <span className="ag-header-icon ag-filter-icon ag-header-label-icon">
                        <span
                            className="ag-icon ag-icon-filter"
                            // eslint-disable-next-line
                            unselectable="on"
                            role="presentation"
                        />
                    </span>
                )}

                {isSorting && (
                    <span className="ag-header-icon ag-header-label-icon">
                        <span
                            className={cn('ag-icon', {
                                [`ag-icon-${sortOrder}`]: !isNil(sortOrder),
                            })}
                            // eslint-disable-next-line
                            unselectable="on"
                            role="presentation"
                        />
                    </span>
                )}

                {showSortIndex && (
                    <span className="ag-header-icon ag-header-label-icon ag-sort-order">
                        {sortIndex + 1}
                    </span>
                )}
            </div>
        </div>
    );
}

function getSortOrder(column: Column): 'asc' | 'desc' | undefined {
    return column.isSortAscending() ? 'asc' : column.isSortDescending() ? 'desc' : undefined;
}
