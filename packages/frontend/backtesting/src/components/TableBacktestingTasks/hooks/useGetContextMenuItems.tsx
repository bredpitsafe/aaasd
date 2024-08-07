import type { GetContextMenuItemsParams, GridOptions, MenuItemDef } from '@frontend/ag-grid';
import { getSelectedRowsWithOrder } from '@frontend/ag-grid/src/utils.ts';
import { EDefaultContextMenuItemName } from '@frontend/common/src/components/AgTable/hooks/useGetContextMenuItems';
import { EBacktestingTaskStatus } from '@frontend/common/src/types/domain/backtestings';
import { createContextMenuIcon } from '@frontend/common/src/utils/contextMenu/contextMenu';
import { useFunction } from '@frontend/common/src/utils/React/useFunction.ts';
import { isEmpty, isNil } from 'lodash-es';

import type { TTableBacktestingTasksItem } from '../view';

const svgStop = createContextMenuIcon(
    require('@ant-design/icons-svg/inline-svg/outlined/stop.svg') as string,
);
const svgRunAgain = createContextMenuIcon(
    require('@ant-design/icons-svg/inline-svg/outlined/retweet.svg') as string,
);
const svgCopy = createContextMenuIcon(
    require('@ant-design/icons-svg/inline-svg/outlined/copy.svg') as string,
);
const svgDelete = createContextMenuIcon(
    require('@ant-design/icons-svg/inline-svg/outlined/delete.svg') as string,
);

type TUseContextMenuItemsProps = {
    onStop?: (id: TTableBacktestingTasksItem['id']) => unknown;
    onRunAgain?: (id: TTableBacktestingTasksItem['id']) => unknown;
    onClone?: (id: TTableBacktestingTasksItem['id']) => unknown;
    onDelete?: (id: TTableBacktestingTasksItem['id']) => unknown;
    onBulkDelete?: (ids: TTableBacktestingTasksItem['id'][]) => unknown;
};

type TParams = GetContextMenuItemsParams<TTableBacktestingTasksItem>;

export function useGetContextMenuItems(
    props: TUseContextMenuItemsProps,
): GridOptions<TTableBacktestingTasksItem>['getContextMenuItems'] {
    return useFunction(({ api, node }: TParams): (string | MenuItemDef)[] => {
        const tasks = getSelectedRowsWithOrder(api);
        const cursorTask = node?.data;
        const selectedTasks =
            isNil(cursorTask) || tasks.find(({ id }) => cursorTask.id === id)
                ? tasks
                : [cursorTask];

        const actions: (string | MenuItemDef)[] = [];

        if (isEmpty(selectedTasks)) {
            return actions;
        }

        if (selectedTasks.length === 1) {
            const [{ id, status }] = selectedTasks;

            if (!isNil(props.onStop)) {
                actions.push({
                    icon: svgStop,
                    name: 'Stop',
                    action: props.onStop.bind(null, id),
                    disabled: ![
                        EBacktestingTaskStatus.Running,
                        EBacktestingTaskStatus.Queued,
                        EBacktestingTaskStatus.Paused,
                    ].includes(status),
                });
            }

            if (!isNil(props.onRunAgain)) {
                actions.push({
                    icon: svgRunAgain,
                    name: 'Run again',
                    action: props.onRunAgain.bind(null, id),
                });
            }

            if (!isNil(props.onClone)) {
                actions.push({
                    icon: svgCopy,
                    name: 'Clone',
                    action: props.onClone.bind(null, id),
                });
            }

            if (!isNil(props.onDelete)) {
                actions.push({
                    icon: svgDelete,
                    name: 'Delete',
                    action: props.onDelete.bind(null, id),
                });
            }
        } else {
            if (!isNil(props.onBulkDelete)) {
                actions.push({
                    icon: svgDelete,
                    name: `Delete ${selectedTasks.length} tasks`,
                    action: props.onBulkDelete.bind(
                        null,
                        selectedTasks.map(({ id }) => id),
                    ),
                });
            }
        }

        if (actions.length > 0) {
            actions.push(EDefaultContextMenuItemName.Separator);
        }

        return actions;
    });
}
