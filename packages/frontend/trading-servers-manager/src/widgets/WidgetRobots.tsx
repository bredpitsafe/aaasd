import { useUpdatingComponentIds } from '@frontend/common/src/components/hooks/components/useUpdatingComponentIds';
import { useTimeZoneInfoSettings } from '@frontend/common/src/components/Settings/hooks/useTimeZoneSettings';
import { useModule } from '@frontend/common/src/di/react';
import { ETableIds } from '@frontend/common/src/modules/clientTableFilters/data';
import {
    ComponentMetadataType,
    ModuleComponentMetadata,
} from '@frontend/common/src/modules/componentMetadata';
import { ModuleRobots } from '@frontend/common/src/modules/robots';
import { ModuleServers } from '@frontend/common/src/modules/servers';
import { EApplicationName } from '@frontend/common/src/types/app';
import { EComponentType, TComponentId } from '@frontend/common/src/types/domain/component';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { isEmpty, isNil } from 'lodash-es';
import { memo, ReactElement, useMemo } from 'react';
import { EMPTY } from 'rxjs';

import { useMenuColumns } from '../components/Menu/columns';
import { ComponentsListView, TComponentDataType } from '../components/Menu/Components/view';
import { useGetContextMenuItems } from '../components/Menu/useGetContextMenuItems';
import { useRouteParams } from '../hooks/useRouteParams';
import { ETradingServersManagerRoutes } from '../modules/router/defs';
import { ModuleTradingServersManagerRouter } from '../modules/router/module';

export const WidgetRobots = memo((): ReactElement | null => {
    const { getServer$ } = useModule(ModuleServers);
    const { getRobots$, robotsRemovable$ } = useModule(ModuleRobots);
    const { navigate } = useModule(ModuleTradingServersManagerRouter);
    const { getComponentsMetadata$ } = useModule(ModuleComponentMetadata);

    const params = useRouteParams();
    const server = useSyncObservable(getServer$(params?.server));
    const robots = useSyncObservable(
        useMemo(
            () => getRobots$(server?.robotIds),
            // eslint-disable-next-line react-hooks/exhaustive-deps
            [getRobots$, server?.robotIds.join(',')],
        ),
    );
    const robotsRemovable = useSyncObservable(robotsRemovable$);

    const updatingIds = useUpdatingComponentIds(EComponentType.robot, robots);
    const [{ timeZone }] = useTimeZoneInfoSettings(EApplicationName.TradingServersManager);

    const cbSelect = useFunction((id: TComponentId): void => {
        navigate(ETradingServersManagerRoutes.Robot, {
            ...params,
            robot: id,
            gate: undefined,
            createTab: undefined,
            configDigest: undefined,
            configSelection: undefined,
        });
    });

    const dirtyMetadata = useSyncObservable(
        useMemo(
            () =>
                isNil(robots)
                    ? EMPTY
                    : getComponentsMetadata$(
                          ComponentMetadataType.Drafts,
                          robots.map(({ id }) => ({ id, type: EComponentType.robot })),
                      ),
            [getComponentsMetadata$, robots],
        ),
    );

    const components: TComponentDataType[] | undefined = useMemo(
        () =>
            robots?.map((robot) => ({
                ...robot,
                type: EComponentType.robot,
                updating: updatingIds.includes(robot.id),
                dirty:
                    !isNil(dirtyMetadata) &&
                    dirtyMetadata.some(({ id, meta }) => robot.id === id && !isEmpty(meta)),
            })),
        [robots, updatingIds, dirtyMetadata],
    );

    const getContextMenuItems = useGetContextMenuItems({ allowRemove: robotsRemovable });
    const columns = useMenuColumns(timeZone);

    return (
        <ComponentsListView
            tableId={ETableIds.RobotsMenu}
            columns={columns}
            components={components}
            selectedId={params?.robot}
            onSelect={cbSelect}
            getContextMenuItems={getContextMenuItems}
        />
    );
});
