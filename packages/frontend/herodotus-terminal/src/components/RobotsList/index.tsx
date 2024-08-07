import type { TimeZone } from '@common/types';
import { useUpdatingComponentIds } from '@frontend/common/src/components/hooks/components/useUpdatingComponentIds';
import { useModule } from '@frontend/common/src/di/react';
import { ETableIds } from '@frontend/common/src/modules/clientTableFilters/data';
import { ModuleRouter } from '@frontend/common/src/modules/router';
import type { TComponentId } from '@frontend/common/src/types/domain/component';
import { EComponentType } from '@frontend/common/src/types/domain/component';
import type { TRobot } from '@frontend/common/src/types/domain/robots';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useMenuColumns } from '@frontend/trading-servers-manager/src/components/Menu/columns';
import type { TComponentDataType } from '@frontend/trading-servers-manager/src/components/Menu/Components/view';
import { ComponentsListView } from '@frontend/trading-servers-manager/src/components/Menu/Components/view';
import { useGetContextMenuItems } from '@frontend/trading-servers-manager/src/components/Menu/useGetContextMenuItems';
import { useCurrentRobot } from '@frontend/trading-servers-manager/src/hooks/robot.ts';
import { isNil } from 'lodash-es';
import { useMemo } from 'react';

import { EHerodotusTerminalRoutes } from '../../modules/router/def';

type TRobotsListProps = {
    robots?: TRobot[];
    timeZone: TimeZone;
};
export function RobotsList(props: TRobotsListProps) {
    const { navigate, getState } = useModule(ModuleRouter);
    const robot = useCurrentRobot();
    const updatingIds = useUpdatingComponentIds(EComponentType.robot, props.robots);

    const cbSelect = useFunction((id: TComponentId) => {
        const state = getState();
        void navigate(EHerodotusTerminalRoutes.Robot, {
            ...state.route.params,
            robot: id,
        });
    });

    const components: TComponentDataType[] | undefined = useMemo(
        () =>
            props.robots?.map((robot) => ({
                ...robot,
                type: EComponentType.robot,
                updating: updatingIds.includes(robot.id),
            })),
        [props.robots],
    );

    const columns = useMenuColumns(props.timeZone);

    const getContextMenuItems = useGetContextMenuItems({
        allowStart: false,
        allowStop: false,
        allowRestart: false,
        allowUnblock: true,
        allowRemove: false,
    });

    if (isNil(props.robots)) {
        return null;
    }

    return (
        <ComponentsListView
            columns={columns}
            tableId={ETableIds.RobotsMenu}
            components={components}
            selectedId={robot.value?.id}
            onSelect={cbSelect}
            getContextMenuItems={getContextMenuItems}
        />
    );
}
