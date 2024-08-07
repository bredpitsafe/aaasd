import type { Nil } from '@common/types';
import { generateTraceId } from '@common/utils';
import { useSyncedTableFilter } from '@frontend/common/src/components/AgTable/hooks/useSyncedTableFilter.ts';
import { useStmBalances } from '@frontend/common/src/components/hooks/useStmBalances.ts';
import { useTimeZoneInfoSettings } from '@frontend/common/src/components/Settings/hooks/useTimeZoneSettings';
import { useModule } from '@frontend/common/src/di/react.tsx';
import { ModuleSubscribeToVirtualAccountsSnapshotsOnCurrentStage } from '@frontend/common/src/modules/actions/accounts/ModuleSubscribeToVirtualAccountsSnapshotsOnCurrentStage.ts';
import { ModuleSubscribeToAssetsOnCurrentStage } from '@frontend/common/src/modules/actions/dictionaries/ModuleSubscribeToAssetsOnCurrentStage.ts';
import { ModuleSubscribeToInstrumentsOnCurrentStage } from '@frontend/common/src/modules/actions/dictionaries/ModuleSubscribeToInstrumentsOnCurrentStage.ts';
import { ETableIds } from '@frontend/common/src/modules/clientTableFilters/data.ts';
import type { TVirtualAccountId } from '@frontend/common/src/types/domain/account.ts';
import type { TAssetId } from '@frontend/common/src/types/domain/asset.ts';
import type { TInstrumentId } from '@frontend/common/src/types/domain/instrument.ts';
import type { TRobot, TRobotId } from '@frontend/common/src/types/domain/robots';
import { EMPTY_ARRAY } from '@frontend/common/src/utils/const.ts';
import { useNotifiedValueDescriptorObservable } from '@frontend/common/src/utils/React/useValueDescriptorObservable.ts';
import { isNil } from 'lodash-es';
import { useMemo } from 'react';

import { TableBalances } from '../../../../components/Tables/TableBalances/view.tsx';
import { useRobots } from '../../../../hooks/robot.ts';
import { useCurrentServer } from '../../../../hooks/servers.ts';

export function WidgetBalances({ robot }: { robot?: Nil | TRobot }) {
    const subscribeToAssets = useModule(ModuleSubscribeToAssetsOnCurrentStage);
    const subscribeToInstruments = useModule(ModuleSubscribeToInstrumentsOnCurrentStage);

    const subscribeToVirtualAccounts = useModule(
        ModuleSubscribeToVirtualAccountsSnapshotsOnCurrentStage,
    );

    const server = useCurrentServer();
    const robots = useRobots(server.value?.robotIds);

    const assets = useNotifiedValueDescriptorObservable(
        subscribeToAssets(undefined, { traceId: generateTraceId() }),
    );
    const instruments = useNotifiedValueDescriptorObservable(
        subscribeToInstruments({}, { traceId: generateTraceId() }),
    );
    const virtualAccounts = useNotifiedValueDescriptorObservable(
        subscribeToVirtualAccounts(undefined, { traceId: generateTraceId() }),
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

    const [{ timeZone }] = useTimeZoneInfoSettings();

    return (
        <TableBalances
            tableId={tableId}
            robot={robot}
            stmBalancesDesc={stmBalancesDesc}
            assets={assets.value ?? undefined}
            instruments={instruments.value ?? undefined}
            filterInstrumentIds={filterInstrumentIds}
            setFilterInstrumentIds={setFilterInstrumentIds}
            virtualAccounts={virtualAccounts.value ?? undefined}
            filterVirtualAccountIds={filterVirtualAccountIds}
            setFilterVirtualAccountIds={setFilterVirtualAccountIds}
            robots={robots?.value}
            filterRobotIds={filterRobotIds}
            setFilterRobotIds={setFilterRobotIds}
            filterAssetIds={filterAssetIds}
            setFilterAssetIds={setFilterAssetIds}
            filterNonZeroBalances={filterNonZeroBalances}
            setFilterNonZeroBalances={setFilterNonZeroBalances}
            timeZone={timeZone}
        />
    );
}
