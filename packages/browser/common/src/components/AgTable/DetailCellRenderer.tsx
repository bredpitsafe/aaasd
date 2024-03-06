import { GridReadyEvent, IDetailCellRendererParams } from 'ag-grid-community';
import React, {
    ForwardedRef,
    ReactElement,
    Ref,
    useEffect,
    useImperativeHandle,
    useMemo,
    useState,
} from 'react';

import { ETableIds } from '../../modules/clientTableFilters/data';
import { useFunction } from '../../utils/React/useFunction';
import { AgTableWithRouterSync } from './AgTableWithRouterSync';
import { cnPanel } from './DetailCellRenderer.css';

export type TDetailCellRendererContext = {
    id: ETableIds;
};

export type TDetailCellRendererRef<T> = {
    refresh: (params: IDetailCellRendererParams<T>) => boolean;
};

const DetailCellRendererForwarded = <T,>(
    params: IDetailCellRendererParams<T>,
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
        <div className={cnPanel}>
            <AgTableWithRouterSync<T>
                id={id}
                getRowId={params.detailGridOptions.getRowId!}
                rowData={childData}
                onGridReady={onGridReady}
                context={context}
                {...params.detailGridOptions}
            />
        </div>
    );
};

export const DetailCellRenderer = React.forwardRef(DetailCellRendererForwarded) as <T>(
    p: IDetailCellRendererParams<T> & { ref?: Ref<TDetailCellRendererRef<T>> },
) => ReactElement;

export function createDetailCellRendererContext(id: ETableIds): TDetailCellRendererContext {
    return { id };
}

export function getDetailCellRendererContext(context: any): TDetailCellRendererContext {
    return { id: context.id };
}
