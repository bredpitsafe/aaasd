import type { GridOptions, GridReadyEvent, IDetailCellRendererParams } from '@frontend/ag-grid';
import type { ForwardedRef, ReactElement, Ref } from 'react';
import React, { useEffect, useImperativeHandle, useMemo, useState } from 'react';

import type { ETableIds } from '../../modules/clientTableFilters/data';
import { useFunction } from '../../utils/React/useFunction';
import { AgTableWithRouterSync } from './AgTableWithRouterSync';
import { cnPanelAutoSize, cnPanelFixed } from './DetailCellRenderer.css';

export type TDetailCellRendererContext = {
    id: ETableIds;
};

export type TDetailCellRendererRef<T> = {
    refresh: (params: IDetailCellRendererParams<T>) => boolean;
};

const DetailCellRendererForwarded = <T,>(
    params: IDetailCellRendererParams<T> & { domLayout?: GridOptions<T>['domLayout'] },
    ref: ForwardedRef<TDetailCellRendererRef<T>>,
) => {
    const { getDetailRowData, node, api, data: parentData } = params;
    const [childData, setChildData] = useState<T[] | null>(null);
    const { id } = getDetailCellRendererContext(params.context);
    const rowId = String(node.id);

    useEffect(() => {
        return () => {
            api.removeDetailGridInfo(rowId);
        };
    }, [api, rowId]);

    const onGridReady = useFunction((params: GridReadyEvent) => {
        const gridInfo = {
            id: node.id!,
            api: params.api,
            columnApi: params.columnApi,
        };
        api.addDetailGridInfo(rowId, gridInfo);
    });

    useEffect(() => {
        getDetailRowData({
            node,
            data: parentData!,
            successCallback: (rowData: T[]) => {
                setChildData(rowData);
            },
        });
    }, [parentData, getDetailRowData, setChildData, node]);

    const context = useMemo(
        () => ({
            parentData,
        }),
        [parentData],
    );

    useImperativeHandle(
        ref,
        (): TDetailCellRendererRef<T> => {
            return {
                refresh(params: IDetailCellRendererParams<T>) {
                    getDetailRowData({
                        node,
                        data: params.data!,
                        successCallback: (rowData: T[]) => {
                            setChildData(rowData);
                        },
                    });
                    return true;
                },
            };
        },
        [getDetailRowData, node],
    );

    return (
        <div className={params.domLayout === 'autoHeight' ? cnPanelAutoSize : cnPanelFixed}>
            <AgTableWithRouterSync<T>
                id={id}
                getRowId={params.detailGridOptions.getRowId!}
                rowData={childData}
                onGridReady={onGridReady}
                context={context}
                domLayout={params.domLayout}
                {...params.detailGridOptions}
            />
        </div>
    );
};

export const DetailCellRenderer = React.forwardRef(DetailCellRendererForwarded) as <T>(
    p: IDetailCellRendererParams<T> & {
        domLayout?: GridOptions<T>['domLayout'];
        ref?: Ref<TDetailCellRendererRef<T>>;
    },
) => ReactElement;

export function createDetailCellRendererContext(id: ETableIds): TDetailCellRendererContext {
    return { id };
}

export function getDetailCellRendererContext(context: any): TDetailCellRendererContext {
    return { id: context.id };
}
