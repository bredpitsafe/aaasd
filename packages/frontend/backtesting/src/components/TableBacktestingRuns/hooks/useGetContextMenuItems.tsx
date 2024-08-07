import type { GetContextMenuItemsParams, GridOptions, MenuItemDef } from '@frontend/ag-grid';
import { EDefaultContextMenuItemName } from '@frontend/common/src/components/AgTable/hooks/useGetContextMenuItems';
import { createContextMenuIcon } from '@frontend/common/src/utils/contextMenu/contextMenu';
import {
    backtestingRunCanBePaused,
    backtestingRunCanBeResume,
} from '@frontend/common/src/utils/domain/backtesting';

import type { TTableBacktestingRunsItem } from '../../Layout/hooks/useBacktestingRunItems';

type TUseContextMenuItemsProps = {
    onPause?: (id: TTableBacktestingRunsItem['btRunNo']) => unknown;
    onResume?: (id: TTableBacktestingRunsItem['btRunNo']) => unknown;
};

type TParams = GetContextMenuItemsParams<TTableBacktestingRunsItem>;

const svgPause = createContextMenuIcon(
    require('@ant-design/icons-svg/inline-svg/outlined/pause.svg') as string,
);
const svgCaretRight = createContextMenuIcon(
    require('@ant-design/icons-svg/inline-svg/outlined/caret-right.svg') as string,
);

export function useGetContextMenuItems(
    props: TUseContextMenuItemsProps,
): GridOptions<TTableBacktestingRunsItem>['getContextMenuItems'] {
    return createActionsFactory(props);
}

function createActionsFactory(props: TUseContextMenuItemsProps) {
    return function getActions(params: TParams): (string | MenuItemDef)[] {
        const data = params.node?.data;
        const actions: (string | MenuItemDef)[] = [];

        if (data === undefined) return actions;

        if (props.onPause !== undefined) {
            actions.push({
                icon: svgPause,
                name: 'Pause',
                action: props.onPause.bind(null, data.btRunNo),
                disabled: !backtestingRunCanBePaused(data.status),
            });
        }

        if (props.onResume !== undefined) {
            actions.push({
                icon: `${svgCaretRight}`,
                name: 'Resume',
                action: props.onResume.bind(null, data.btRunNo),
                disabled: !backtestingRunCanBeResume(data.status),
            });
        }

        if (actions.length > 0) {
            actions.push(EDefaultContextMenuItemName.Separator);
        }

        return actions;
    };
}
