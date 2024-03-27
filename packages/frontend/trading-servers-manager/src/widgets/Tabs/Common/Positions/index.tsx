import { useStmPositions } from '@frontend/common/src/components/hooks/useStmPositions.ts';
import { useTimeZoneInfoSettings } from '@frontend/common/src/components/Settings/hooks/useTimeZoneSettings';
import { useSyncedTableFilter } from '@frontend/common/src/components/Table/helpers/useSyncedTableFilter.ts';
import { useModule } from '@frontend/common/src/di/react';
import { useDeepEqualProp } from '@frontend/common/src/hooks/useDeepEqualProp';
import { ModuleBaseActions } from '@frontend/common/src/modules/actions';
import { ETableIds } from '@frontend/common/src/modules/clientTableFilters/data.ts';
import { ModuleRobots } from '@frontend/common/src/modules/robots';
import { ModuleServers } from '@frontend/common/src/modules/servers';
import { EApplicationName } from '@frontend/common/src/types/app';
import type { TVirtualAccountId } from '@frontend/common/src/types/domain/account.ts';
import type { TInstrumentId } from '@frontend/common/src/types/domain/instrument.ts';
import type { TRobot, TRobotId } from '@frontend/common/src/types/domain/robots';
import { EMPTY_ARRAY } from '@frontend/common/src/utils/const.ts';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { isNil } from 'lodash-es';
import { useMemo } from 'react';
import { Observable, of } from 'rxjs';

import { TablePositions } from '../../../../components/Tables/TablePositions/view';
import { useRouteParams } from '../../../../hooks/useRouteParams';
import { ModuleTradingServersManagerActions } from '../../../../modules/actions/module';

export function WidgetPositions({ robot }: { robot?: TRobot }) {
    const { getSocketInstrumentsDedobsed$ } = useModule(ModuleBaseActions);
    const { subscribeToVirtualAccounts } = useModule(ModuleTradingServersManagerActions);
    const { getServer$ } = useModule(ModuleServers);
    const { getRobots$ } = useModule(ModuleRobots);

    const params = useRouteParams();
    const server = useSyncObservable(getServer$(params?.server));
    const serverRobots = useDeepEqualProp(server?.robotIds ?? EMPTY_ARRAY);

    const virtualAccounts = useSyncObservable(
        useMemo(() => subscribeToVirtualAccounts(), [subscribeToVirtualAccounts]),
    );
    const instruments = useSyncObservable(getSocketInstrumentsDedobsed$());
    const robots = useSyncObservable(
        useMemo(
            (): Observable<TRobot[] | undefined | null> =>
                isNil(robot) ? getRobots$(serverRobots) : of(null),
            [getRobots$, robot, serverRobots],
        ),
    );

    const tableId = useMemo(
        () => (isNil(robot) ? ETableIds.Positions : ETableIds.RobotPositions),
        [robot],
    );

    const externalFiltersTableId = `${tableId}_external`;

    const [filterNonZeroPositions = true, setFilterNonZeroPositions] =
        useSyncedTableFilter<boolean>(externalFiltersTableId, 'NonZeroPositions');

    const [filterInstrumentIds = EMPTY_ARRAY as TInstrumentId[], setFilterInstrumentIds] =
        useSyncedTableFilter<TInstrumentId[]>(externalFiltersTableId, 'instruments');

    const [
        filterVirtualAccountIds = EMPTY_ARRAY as TVirtualAccountId[],
        setFilterVirtualAccountIds,
    ] = useSyncedTableFilter<TVirtualAccountId[]>(externalFiltersTableId, 'virtualAccounts');

    const [filterRobotIds = EMPTY_ARRAY as TRobotId[], setFilterRobotIds] = useSyncedTableFilter<
        TRobotId[]
    >(externalFiltersTableId, 'robots');

    const robotIds = useMemo(
        () => (isNil(robot) ? filterRobotIds : [robot.id]),
        [filterRobotIds, robot],
    );

    const stmPositionsDesc = useStmPositions({
        instrumentIds: filterInstrumentIds,
        virtualAccountIds: filterVirtualAccountIds,
        robotIds,
        nonZeroPositions: filterNonZeroPositions,
    });

    const [{ timeZone }] = useTimeZoneInfoSettings(EApplicationName.TradingServersManager);

    return (
        <TablePositions
            tableId={tableId}
            robot={robot}
            stmPositionsDesc={stmPositionsDesc}
            instruments={instruments}
            filterInstrumentIds={filterInstrumentIds}
            setFilterInstrumentIds={setFilterInstrumentIds}
            virtualAccounts={virtualAccounts}
            filterVirtualAccountIds={filterVirtualAccountIds}
            setFilterVirtualAccountIds={setFilterVirtualAccountIds}
            robots={robots}
            filterRobotIds={filterRobotIds}
            setFilterRobotIds={setFilterRobotIds}
            filterNonZeroPositions={filterNonZeroPositions}
            setFilterNonZeroPositions={setFilterNonZeroPositions}
            timeZone={timeZone}
        />
    );
}
