import type { Nil } from '@common/types';
import { generateTraceId } from '@common/utils';
import { useSyncedTableFilter } from '@frontend/common/src/components/AgTable/hooks/useSyncedTableFilter.ts';
import { useStmPositions } from '@frontend/common/src/components/hooks/useStmPositions.ts';
import { useTimeZoneInfoSettings } from '@frontend/common/src/components/Settings/hooks/useTimeZoneSettings';
import { useModule } from '@frontend/common/src/di/react';
import { ModuleSubscribeToVirtualAccountsSnapshotsOnCurrentStage } from '@frontend/common/src/modules/actions/accounts/ModuleSubscribeToVirtualAccountsSnapshotsOnCurrentStage.ts';
import { ModuleSubscribeToInstrumentsOnCurrentStage } from '@frontend/common/src/modules/actions/dictionaries/ModuleSubscribeToInstrumentsOnCurrentStage.ts';
import { ETableIds } from '@frontend/common/src/modules/clientTableFilters/data.ts';
import type { TVirtualAccountId } from '@frontend/common/src/types/domain/account.ts';
import type { TInstrumentId } from '@frontend/common/src/types/domain/instrument.ts';
import type { TRobot, TRobotId } from '@frontend/common/src/types/domain/robots';
import { EMPTY_ARRAY } from '@frontend/common/src/utils/const.ts';
import { useNotifiedValueDescriptorObservable } from '@frontend/common/src/utils/React/useValueDescriptorObservable.ts';
import { isNil } from 'lodash-es';
import { useMemo } from 'react';

import { TablePositions } from '../../../../components/Tables/TablePositions/view';
import { useRobots } from '../../../../hooks/robot.ts';
import { useCurrentServer } from '../../../../hooks/servers.ts';

export function WidgetPositions({ robot }: { robot?: Nil | TRobot }) {
    const subscribeToInstruments = useModule(ModuleSubscribeToInstrumentsOnCurrentStage);
    const subscribeToVirtualAccounts = useModule(
        ModuleSubscribeToVirtualAccountsSnapshotsOnCurrentStage,
    );

    const currentServer = useCurrentServer();
    const robots = useRobots(currentServer.value?.robotIds);

    const virtualAccounts = useNotifiedValueDescriptorObservable(
        subscribeToVirtualAccounts(undefined, { traceId: generateTraceId() }),
    );
    const instruments = useNotifiedValueDescriptorObservable(
        subscribeToInstruments(undefined, { traceId: generateTraceId() }),
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

    const [{ timeZone }] = useTimeZoneInfoSettings();

    return (
        <TablePositions
            tableId={tableId}
            robot={robot}
            stmPositionsDesc={stmPositionsDesc}
            instruments={instruments.value ?? undefined}
            filterInstrumentIds={filterInstrumentIds}
            setFilterInstrumentIds={setFilterInstrumentIds}
            virtualAccounts={virtualAccounts.value ?? undefined}
            filterVirtualAccountIds={filterVirtualAccountIds}
            setFilterVirtualAccountIds={setFilterVirtualAccountIds}
            robots={robots?.value}
            filterRobotIds={filterRobotIds}
            setFilterRobotIds={setFilterRobotIds}
            filterNonZeroPositions={filterNonZeroPositions}
            setFilterNonZeroPositions={setFilterNonZeroPositions}
            timeZone={timeZone}
        />
    );
}
