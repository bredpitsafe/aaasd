import { ColDef } from '@frontend/ag-grid';
import { BaseTimeContext } from '@frontend/common/src/components/BaseTimeContext';
import { Result } from '@frontend/common/src/components/Result';
import { useTimeZoneInfoSettings } from '@frontend/common/src/components/Settings/hooks/useTimeZoneSettings';
import { useModule } from '@frontend/common/src/di/react';
import { ETableIds } from '@frontend/common/src/modules/clientTableFilters/data';
import { ModuleCommunication } from '@frontend/common/src/modules/communication';
import { ModuleServers } from '@frontend/common/src/modules/servers';
import { EApplicationName } from '@frontend/common/src/types/app';
import type { TServer, TServerId } from '@frontend/common/src/types/domain/servers';
import type { Milliseconds } from '@frontend/common/src/types/time';
import { assertNever } from '@frontend/common/src/utils/assert';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { matchValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor';
import { isUndefined } from 'lodash-es';
import { memo, ReactElement, useMemo } from 'react';

import {
    getNameColumnWithTooltip,
    getStatusColumn,
    getVersionColumn,
} from '../components/Menu/columns';
import { ComponentsListView } from '../components/Menu/Components/view';
import { useRouteParams } from '../hooks/useRouteParams';
import { ETradingServersManagerRoutes } from '../modules/router/defs';
import { ModuleTradingServersManagerRouter } from '../modules/router/module';

export const WidgetServers = memo((): ReactElement | null => {
    const { serversList$ } = useModule(ModuleServers);
    const { navigate } = useModule(ModuleTradingServersManagerRouter);
    const { serverTime$ } = useModule(ModuleCommunication);

    const serverList = useSyncObservable(serversList$);
    const params = useRouteParams();
    const time = useSyncObservable(serverTime$, 0 as Milliseconds);
    const [{ timeZone }] = useTimeZoneInfoSettings(EApplicationName.TradingServersManager);
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
            getStatusColumn(timeZone) as ColDef<TServer>,
            getNameColumnWithTooltip(),
            getVersionColumn(),
        ];
    }, [timeZone]);

    if (isUndefined(serverList)) return null;

    return matchValueDescriptor(serverList, {
        idle: () => null,
        unsynchronized: () => null,
        fail: (f) => {
            switch (f.code) {
                case '[ServersList]: NOT_AVAILABLE':
                    return (
                        <Result
                            status="warning"
                            title="There are no available servers"
                            subTitle="Perhaps you don't have enough permissions"
                        />
                    );
                default:
                    assertNever(f.code);
            }
        },
        synchronized: (serverList) => (
            <BaseTimeContext.Provider value={time}>
                <ComponentsListView
                    columns={columns}
                    tableId={ETableIds.ServersMenu}
                    components={serverList}
                    selectedId={params?.server}
                    onSelect={cbSelect}
                />
            </BaseTimeContext.Provider>
        ),
    });
});
