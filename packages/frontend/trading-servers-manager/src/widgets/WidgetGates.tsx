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
import type { TGateType } from '@frontend/common/src/types/domain/gates';
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
import { useGates } from '../hooks/gate.ts';
import { useCurrentServer } from '../hooks/servers.ts';
import { useRouteParams } from '../hooks/useRouteParams';
import { ETradingServersManagerRoutes } from '../modules/router/defs';
import { ModuleTradingServersManagerRouter } from '../modules/router/module';

type TConnectedGatesProps = {
    type: TGateType;
};

export const WidgetGates = memo((props: TConnectedGatesProps): ReactElement | null => {
    const { navigate } = useModule(ModuleTradingServersManagerRouter);
    const { getComponentsMetadata$ } = useModule(ModuleComponentMetadata);

    const params = useRouteParams();
    const componentRemovalEnabled = useComponents()?.value?.componentRemovalEnabled;
    const currentServer = useCurrentServer();
    const gateIds =
        props.type === EComponentType.mdGate
            ? currentServer.value?.mdGateIds
            : currentServer.value?.execGateIds;
    const gates = useGates(gateIds);
    const [{ timeZone }] = useTimeZoneInfoSettings();

    const cbSelect = useFunction((id: TComponentId): void => {
        void navigate(ETradingServersManagerRoutes.Gate, {
            ...params,
            gate: id,
            robot: undefined,
            createTab: undefined,
            configDigest: undefined,
            configSelection: undefined,
        });
    });

    const updatingIds = useUpdatingComponentIds(props.type, gates.value);

    const dirtyMetadata = useSyncObservable(
        useMemo(
            () =>
                isNil(gates.value)
                    ? EMPTY
                    : getComponentsMetadata$(ComponentMetadataType.Drafts, gates.value),
            [getComponentsMetadata$, gates],
        ),
    );

    const componentDataTypes: TComponentDataType[] | undefined = useMemo(
        () =>
            gates.value?.map((gate) => ({
                ...gate,
                updating: updatingIds.includes(gate.id),
                buildInfo: null,
                dirty:
                    !isNil(dirtyMetadata) &&
                    dirtyMetadata.some(
                        ({ id, type, meta }) =>
                            gate.id === id && gate.type === type && !isEmpty(meta),
                    ),
            })),
        [gates, updatingIds, dirtyMetadata],
    );

    const getContextMenuItems = useGetContextMenuItems({
        allowRemove: componentRemovalEnabled,
    });
    const columns = useMenuColumns(timeZone);

    return (
        <ComponentsListView
            tableId={ETableIds.GatesMenu}
            columns={columns}
            components={componentDataTypes}
            selectedId={params?.gate}
            onSelect={cbSelect}
            getContextMenuItems={getContextMenuItems}
        />
    );
});
