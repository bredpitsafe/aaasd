import { useUpdatingComponentIds } from '@frontend/common/src/components/hooks/components/useUpdatingComponentIds';
import { useTimeZoneInfoSettings } from '@frontend/common/src/components/Settings/hooks/useTimeZoneSettings';
import { useModule } from '@frontend/common/src/di/react';
import { ETableIds } from '@frontend/common/src/modules/clientTableFilters/data';
import {
    ComponentMetadataType,
    ModuleComponentMetadata,
} from '@frontend/common/src/modules/componentMetadata';
import { ModuleGates } from '@frontend/common/src/modules/gates';
import { ModuleServers } from '@frontend/common/src/modules/servers';
import { EApplicationName } from '@frontend/common/src/types/app';
import { EComponentType, TComponentId } from '@frontend/common/src/types/domain/component';
import type { TGateType } from '@frontend/common/src/types/domain/gates';
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

type TConnectedGatesProps = {
    type: TGateType;
};

export const WidgetGates = memo((props: TConnectedGatesProps): ReactElement | null => {
    const { getServer$ } = useModule(ModuleServers);
    const { getGates$, gatesRemovable$ } = useModule(ModuleGates);
    const { navigate } = useModule(ModuleTradingServersManagerRouter);
    const { getComponentsMetadata$ } = useModule(ModuleComponentMetadata);

    const params = useRouteParams();
    const server = useSyncObservable(getServer$(params?.server));
    const gateIds = props.type === EComponentType.mdGate ? server?.mdGateIds : server?.execGateIds;
    const gates = useSyncObservable(
        useMemo(
            () => getGates$(gateIds),
            // eslint-disable-next-line react-hooks/exhaustive-deps
            [gateIds?.join(','), getGates$],
        ),
    );
    const gatesRemovable = useSyncObservable(gatesRemovable$);
    const [{ timeZone }] = useTimeZoneInfoSettings(EApplicationName.TradingServersManager);

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

    const updatingIds = useUpdatingComponentIds(props.type, gates);

    const dirtyMetadata = useSyncObservable(
        useMemo(
            () =>
                isNil(gates) ? EMPTY : getComponentsMetadata$(ComponentMetadataType.Drafts, gates),
            [getComponentsMetadata$, gates],
        ),
    );

    const components: TComponentDataType[] | undefined = useMemo(
        () =>
            gates?.map((gate) => ({
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

    const getContextMenuItems = useGetContextMenuItems({ allowRemove: gatesRemovable });
    const columns = useMenuColumns(timeZone);

    return (
        <ComponentsListView
            tableId={ETableIds.GatesMenu}
            columns={columns}
            components={components}
            selectedId={params?.gate}
            onSelect={cbSelect}
            getContextMenuItems={getContextMenuItems}
        />
    );
});
