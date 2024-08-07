import type {
    ColDef,
    GetContextMenuItems,
    GridOptions,
    IRowNode,
    ModelUpdatedEvent,
    RowClassRules,
    RowClickedEvent,
} from '@frontend/ag-grid';
import { AgTableWithRouterSync } from '@frontend/common/src/components/AgTable/AgTableWithRouterSync';
import { useGridApi } from '@frontend/common/src/components/AgTable/hooks/useGridApi';
import type { ETableIds } from '@frontend/common/src/modules/clientTableFilters/data';
import type { TWithClassname } from '@frontend/common/src/types/components';
import type {
    TWithBuildInfo,
    TWithRobotBuildInfo,
} from '@frontend/common/src/types/domain/buildInfo';
import type {
    EComponentStatus,
    EComponentType,
    TComponentId,
} from '@frontend/common/src/types/domain/component';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { isNil } from 'lodash-es';
import type { ReactElement } from 'react';
import { useEffect } from 'react';

import { cnRowHeight } from '../style.css';
import { cnGridNoBorders, cnUpdating } from './view.css';

type TComponentsViewProps<T extends { id: number }> = TWithClassname & {
    tableId: ETableIds;
    columns: ColDef<T>[];
    components: T[] | undefined;
    selectedId?: T['id'];
    onSelect: (selectedId: T['id']) => void;
    getContextMenuItems?: GetContextMenuItems<T>;
};

export type TComponentDataType = {
    id: TComponentId;
    type: EComponentType;
    kind: string;
    name: string;
    status: EComponentStatus;
    statusMessage: null | string;
    updating: boolean;
    dirty?: boolean;
} & (TWithBuildInfo | TWithRobotBuildInfo);

const groupRowRendererParams: GridOptions['groupRowRendererParams'] = {
    suppressCount: true,
};

const defaultColDef: GridOptions['defaultColDef'] = { minWidth: 20 };

const rowClassRules: RowClassRules<{ updating: boolean }> = {
    [cnUpdating]: (params) =>
        !isNil(params.data) && 'updating' in params.data && params.data.updating,
};

export function ComponentsListView<T extends { id: number }>(
    props: TComponentsViewProps<T>,
): ReactElement {
    const { gridApi, onGridReady } = useGridApi();

    const cbRowClicked = useFunction((event: RowClickedEvent<T>) => {
        const id = event.data?.id;
        if (isNil(id)) {
            return;
        }
        props.onSelect(id);
    });

    const handleSelectActiveNode = useFunction((event: ModelUpdatedEvent<T>) => {
        const node = event.api.getRowNode(String(props.selectedId));
        const selectedNodes = event.api.getSelectedNodes();
        if (!isNil(node) && selectedNodes[0] !== node) {
            node.setSelected(true);
            event.api.ensureNodeVisible(node);
        }
    });

    useEffect(() => {
        if (!isNil(gridApi)) {
            if (!isNil(props.selectedId)) {
                const selectedNode = gridApi.getRowNode(String(props.selectedId));
                if (isNil(selectedNode)) {
                    gridApi.deselectAll();
                    return;
                }

                selectedNode.setSelected(true);

                // If grouped, open all parent groups to display this node
                let node: IRowNode | null = selectedNode;

                while (node.level > 0) {
                    node = node.parent;
                    if (isNil(node)) {
                        break;
                    }
                    node.setExpanded(true);
                }

                return;
            }

            gridApi.deselectAll();
        }
    }, [gridApi, props.selectedId]);

    return (
        <AgTableWithRouterSync
            className={cnGridNoBorders}
            id={props.tableId}
            rowKey="id"
            rowData={props.components}
            onRowClicked={cbRowClicked}
            columnDefs={props.columns}
            enableCellTextSelection
            suppressRowVirtualisation
            suppressColumnVirtualisation
            domLayout="autoHeight"
            rowHeight={30}
            rowClass={cnRowHeight}
            rowClassRules={rowClassRules}
            onModelUpdated={handleSelectActiveNode}
            onGridReady={onGridReady}
            suppressCellFocus
            groupDisplayType="groupRows"
            groupRowRendererParams={groupRowRendererParams}
            rowGroupPanelShow="never"
            suppressRowGroupHidesColumns
            defaultColDef={defaultColDef}
            getContextMenuItems={props.getContextMenuItems}
            includeDefaultContextMenuItems={false}
        />
    );
}
