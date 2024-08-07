import { useUpdatingComponentIds } from '@frontend/common/src/components/hooks/components/useUpdatingComponentIds';
import { useTimeZoneInfoSettings } from '@frontend/common/src/components/Settings/hooks/useTimeZoneSettings';
import { useModule } from '@frontend/common/src/di/react';
import { ETableIds } from '@frontend/common/src/modules/clientTableFilters/data';
import {
    ComponentMetadataType,
    ModuleComponentMetadata,
} from '@frontend/common/src/modules/componentMetadata';
import type { TComponentId } from '@frontend/common/src/types/domain/component';
import { EComponentType } from '@frontend/common/src/types/domain/component';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { isEmpty, isNil } from 'lodash-es';
import type { ReactElement } from 'react';
import { memo, useMemo } from 'react';
import { EMPTY } from 'rxjs';

import { useMenuColumns } from '../components/Menu/columns';
import type { TComponentDataType } from '../components/Menu/Components/view';
import { ComponentsListView } from '../components/Menu/Components/view';
import { useGetContextMenuItems } from '../components/Menu/useGetContextMenuItems';
import { useComponents } from '../hooks/components.ts';
import { useRobots } from '../hooks/robot.ts';
import { useCurrentServer } from '../hooks/servers.ts';
import { useRouteParams } from '../hooks/useRouteParams';
import { ETradingServersManagerRoutes } from '../modules/router/defs';
import { ModuleTradingServersManagerRouter } from '../modules/router/module';

export const WidgetRobots = memo((): ReactElement | null => {
    const { navigate } = useModule(ModuleTradingServersManagerRouter);
    const { getComponentsMetadata$ } = useModule(ModuleComponentMetadata);

    const params = useRouteParams();
    const componentRemovalEnabled = useComponents()?.value?.componentRemovalEnabled;
    const currentServer = useCurrentServer();
    const robotIds = currentServer.value?.robotIds;
    const robots = useRobots(robotIds);

    const updatingIds = useUpdatingComponentIds(EComponentType.robot, robots.value);
    const [{ timeZone }] = useTimeZoneInfoSettings();

    const cbSelect = useFunction((id: TComponentId): void => {
        void navigate(ETradingServersManagerRoutes.Robot, {
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
                isNil(robots.value)
                    ? EMPTY
                    : getComponentsMetadata$(
                          ComponentMetadataType.Drafts,
                          robots.value.map(({ id }) => ({ id, type: EComponentType.robot })),
                      ),
            [getComponentsMetadata$, robots],
        ),
    );

    const componentDataTypes: TComponentDataType[] | undefined = useMemo(
        () =>
            robots.value?.map((robot) => ({
                ...robot,
                type: EComponentType.robot,
                updating: updatingIds.includes(robot.id),
                dirty:
                    !isNil(dirtyMetadata) &&
                    dirtyMetadata.some(({ id, meta }) => robot.id === id && !isEmpty(meta)),
            })),
        [robots, updatingIds, dirtyMetadata],
    );

    const getContextMenuItems = useGetContextMenuItems({
        allowRemove: componentRemovalEnabled,
    });
    const columns = useMenuColumns(timeZone);

    return (
        <ComponentsListView
            tableId={ETableIds.RobotsMenu}
            columns={columns}
            components={componentDataTypes}
            selectedId={params?.robot}
            onSelect={cbSelect}
            getContextMenuItems={getContextMenuItems}
        />
    );
});
