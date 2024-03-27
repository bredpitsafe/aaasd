import type { GetContextMenuItemsParams, GridOptions, MenuItemDef } from '@frontend/ag-grid';
import { EDefaultContextMenuItemName } from '@frontend/common/src/components/AgTable/hooks/useGetContextMenuItems';
import { EBacktestingTaskStatus } from '@frontend/common/src/types/domain/backtestings';
import { createContextMenuIcon } from '@frontend/common/src/utils/contextMenu/contextMenu';

import { TTableBacktestingTasksItem } from '../view';

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
};

type TParams = GetContextMenuItemsParams<TTableBacktestingTasksItem>;

export function useGetContextMenuItems(
    props: TUseContextMenuItemsProps,
): GridOptions<TTableBacktestingTasksItem>['getContextMenuItems'] {
    return createActionsFactory(props);
}

function createActionsFactory(props: TUseContextMenuItemsProps) {
    return function getActions(params: TParams): (string | MenuItemDef)[] {
        const data = params.node?.data;
        const actions: (string | MenuItemDef)[] = [];

        if (data === undefined) return actions;

        if (props.onStop !== undefined) {
            actions.push({
                icon: svgStop,
                name: 'Stop',
                action: props.onStop.bind(null, data.id),
                disabled: ![
                    EBacktestingTaskStatus.Running,
                    EBacktestingTaskStatus.Queued,
                    EBacktestingTaskStatus.Paused,
                ].includes(data.status),
            });
        }

        if (props.onRunAgain !== undefined) {
            actions.push({
                icon: svgRunAgain,
                name: 'Run again',
                action: props.onRunAgain.bind(null, data.id),
            });
        }

        if (props.onClone !== undefined) {
            actions.push({
                icon: svgCopy,
                name: 'Clone',
                action: props.onClone.bind(null, data.id),
            });
        }

        if (props.onDelete !== undefined) {
            actions.push({
                icon: svgDelete,
                name: 'Delete',
                action: props.onDelete.bind(null, data.id),
            });
        }

        if (actions.length > 0) {
            actions.push(EDefaultContextMenuItemName.Separator);
        }

        return actions;
    };
}
