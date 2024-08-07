import type { ISO } from '@common/types';
import { useSyncedTableFilter } from '@frontend/common/src/components/AgTable/hooks/useSyncedTableFilter';
import { ConnectedCommonSnapshotIndicators } from '@frontend/common/src/components/Pages/ConnectedCommonSnapshotIndicators';
import { useTimeZoneInfoSettings } from '@frontend/common/src/components/Settings/hooks/useTimeZoneSettings';
import { useModule } from '@frontend/common/src/di/react';
import { ETableIds } from '@frontend/common/src/modules/clientTableFilters/data';
import { ModuleCommunication } from '@frontend/common/src/modules/communication';
import { ModuleLayouts } from '@frontend/common/src/modules/layouts';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { isNil } from 'lodash-es';

import { EDefaultLayoutComponents } from '../../../layouts/default';

export const ConnectedTableIndicators = () => {
    const { currentSocketUrl$, currentSocketName$ } = useModule(ModuleCommunication);
    const socketUrl = useSyncObservable(currentSocketUrl$);
    const socketName = useSyncObservable(currentSocketName$);

    const { upsertTabFrame } = useModule(ModuleLayouts);

    const cbDashboardLinkClick = useFunction((url: string, name: string) => {
        upsertTabFrame(EDefaultLayoutComponents.IndicatorsDashboard, name, url);
    });

    const [date, setDate] = useSyncedTableFilter<ISO>(ETableIds.AllIndicators, 'date');

    const [{ timeZone }] = useTimeZoneInfoSettings();

    return isNil(socketUrl) || isNil(socketName) ? null : (
        <ConnectedCommonSnapshotIndicators
            socketUrl={socketUrl}
            socketName={socketName}
            onDashboardLinkClick={cbDashboardLinkClick}
            date={date}
            onChangeDate={setDate}
            timeZone={timeZone}
        />
    );
};
