import type { Milliseconds } from '@common/types';
import type { ColDef } from '@frontend/ag-grid';
import { BaseTimeContext } from '@frontend/common/src/components/BaseTimeContext';
import { Result } from '@frontend/common/src/components/Result';
import { useTimeZoneInfoSettings } from '@frontend/common/src/components/Settings/hooks/useTimeZoneSettings';
import { useModule } from '@frontend/common/src/di/react';
import { ETableIds } from '@frontend/common/src/modules/clientTableFilters/data';
import { ModuleCommunication } from '@frontend/common/src/modules/communication';
import type { TServer, TServerId } from '@frontend/common/src/types/domain/servers';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import {
    isFailValueDescriptor,
    isUnsyncedValueDescriptor,
} from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import type { ReactElement } from 'react';
import { memo, useMemo } from 'react';

import {
    getNameColumnWithTooltip,
    getStatusColumn,
    getVersionColumn,
} from '../components/Menu/columns';
import { ComponentsListView } from '../components/Menu/Components/view';
import { useComponents } from '../hooks/components.ts';
import { useRouteParams } from '../hooks/useRouteParams';
import { ETradingServersManagerRoutes } from '../modules/router/defs';
import { ModuleTradingServersManagerRouter } from '../modules/router/module';

export const WidgetServers = memo((): ReactElement | null => {
    const { navigate } = useModule(ModuleTradingServersManagerRouter);
    const { serverTime$ } = useModule(ModuleCommunication);

    const components = useComponents();
    const params = useRouteParams();
    const time = useSyncObservable(serverTime$, 0 as Milliseconds);
    const [{ timeZone }] = useTimeZoneInfoSettings();
    const cbSelect = useFunction((id: TServerId): void => {
        void navigate(ETradingServersManagerRoutes.Server, {
            ...params,
            server: id,
            gate: undefined,
            robot: undefined,
            createTab: undefined,
            config: undefined,
        });
    });

    const columns: ColDef<TServer>[] = useMemo(() => {
        return [
            getStatusColumn(timeZone) as unknown as ColDef<TServer>,
            getNameColumnWithTooltip(),
            getVersionColumn(),
        ];
    }, [timeZone]);

    if (isUnsyncedValueDescriptor(components)) {
        if (isFailValueDescriptor(components)) {
            return (
                <Result
                    status="warning"
                    title="There are no available servers"
                    subTitle="Perhaps you don't have enough permissions"
                />
            );
        }
        return null;
    }

    return (
        <BaseTimeContext.Provider value={time}>
            <ComponentsListView
                columns={columns}
                tableId={ETableIds.ServersMenu}
                components={components.value.servers}
                selectedId={params?.server}
                onSelect={cbSelect}
            />
        </BaseTimeContext.Provider>
    );
});
