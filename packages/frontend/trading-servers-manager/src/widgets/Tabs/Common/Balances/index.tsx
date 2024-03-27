import { useStmBalances } from '@frontend/common/src/components/hooks/useStmBalances.ts';
import { useTimeZoneInfoSettings } from '@frontend/common/src/components/Settings/hooks/useTimeZoneSettings';
import { useSyncedTableFilter } from '@frontend/common/src/components/Table/helpers/useSyncedTableFilter.ts';
import { useModule } from '@frontend/common/src/di/react.tsx';
import { useDeepEqualProp } from '@frontend/common/src/hooks/useDeepEqualProp.ts';
import { ModuleBaseActions } from '@frontend/common/src/modules/actions';
import { ETableIds } from '@frontend/common/src/modules/clientTableFilters/data.ts';
import { ModuleRobots } from '@frontend/common/src/modules/robots';
import { ModuleServers } from '@frontend/common/src/modules/servers';
import { EApplicationName } from '@frontend/common/src/types/app';
import type { TVirtualAccountId } from '@frontend/common/src/types/domain/account.ts';
import type { TAssetId } from '@frontend/common/src/types/domain/asset.ts';
import type { TInstrumentId } from '@frontend/common/src/types/domain/instrument.ts';
import type { TRobot, TRobotId } from '@frontend/common/src/types/domain/robots';
import { EMPTY_ARRAY } from '@frontend/common/src/utils/const.ts';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable.ts';
import { isNil } from 'lodash-es';
import { useMemo } from 'react';
import { Observable, of } from 'rxjs';

import { TableBalances } from '../../../../components/Tables/TableBalances/view.tsx';
import { useRouteParams } from '../../../../hooks/useRouteParams.ts';
import { ModuleTradingServersManagerActions } from '../../../../modules/actions/module.ts';

export function WidgetBalances({ robot }: { robot?: TRobot }) {
    const { getSocketAssetsDedobsed$, getSocketInstrumentsDedobsed$ } =
        useModule(ModuleBaseActions);
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
    const assets = useSyncObservable(getSocketAssetsDedobsed$());
    const robots = useSyncObservable(
        useMemo(
            (): Observable<TRobot[] | undefined | null> =>
                isNil(robot) ? getRobots$(serverRobots) : of(null),
            [getRobots$, robot, serverRobots],
        ),
    );

    const tableId = useMemo(
        () => (isNil(robot) ? ETableIds.Balances : ETableIds.RobotBalances),
        [robot],
    );

    const externalFiltersTableId = `${tableId}_external`;

    const [filterNonZeroBalances = true, setFilterNonZeroBalances] = useSyncedTableFilter<boolean>(
        externalFiltersTableId,
        'NonZeroBalances',
    );

    const [filterInstrumentIds = EMPTY_ARRAY as TInstrumentId[], setFilterInstrumentIds] =
        useSyncedTableFilter<TInstrumentId[]>(externalFiltersTableId, 'instruments');

    const [
        filterVirtualAccountIds = EMPTY_ARRAY as TVirtualAccountId[],
        setFilterVirtualAccountIds,
    ] = useSyncedTableFilter<TVirtualAccountId[]>(externalFiltersTableId, 'virtualAccounts');

    const [filterRobotIds = EMPTY_ARRAY as TRobotId[], setFilterRobotIds] = useSyncedTableFilter<
        TRobotId[]
    >(externalFiltersTableId, 'robots');

    const [filterAssetIds = EMPTY_ARRAY as TAssetId[], setFilterAssetIds] = useSyncedTableFilter<
        TAssetId[]
    >(externalFiltersTableId, 'assets');

    const robotIds = useMemo(
        () => (isNil(robot) ? filterRobotIds : [robot.id]),
        [filterRobotIds, robot],
    );

    const stmBalancesDesc = useStmBalances({
        instrumentIds: filterInstrumentIds,
        virtualAccountIds: filterVirtualAccountIds,
        robotIds,
        assetIds: filterAssetIds,
        nonZeroBalances: filterNonZeroBalances,
    });

    const [{ timeZone }] = useTimeZoneInfoSettings(EApplicationName.TradingServersManager);

    return (
        <TableBalances
            tableId={tableId}
            robot={robot}
            stmBalancesDesc={stmBalancesDesc}
            instruments={instruments}
            filterInstrumentIds={filterInstrumentIds}
            setFilterInstrumentIds={setFilterInstrumentIds}
            virtualAccounts={virtualAccounts}
            filterVirtualAccountIds={filterVirtualAccountIds}
            setFilterVirtualAccountIds={setFilterVirtualAccountIds}
            robots={robots}
            filterRobotIds={filterRobotIds}
            setFilterRobotIds={setFilterRobotIds}
            assets={assets}
            filterAssetIds={filterAssetIds}
            setFilterAssetIds={setFilterAssetIds}
            filterNonZeroBalances={filterNonZeroBalances}
            setFilterNonZeroBalances={setFilterNonZeroBalances}
            timeZone={timeZone}
        />
    );
}
