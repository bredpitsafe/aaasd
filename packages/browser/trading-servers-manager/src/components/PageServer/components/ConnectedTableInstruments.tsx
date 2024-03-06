import { useTimeZoneInfoSettings } from '@frontend/common/src/components/Settings/hooks/useTimeZoneSettings';
import { useModule } from '@frontend/common/src/di/react';
import { ModuleBaseActions } from '@frontend/common/src/modules/actions';
import { EApplicationName } from '@frontend/common/src/types/app';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { ReactElement } from 'react';

import { TableAllInstruments } from '../../Tables/TableAllInstruments/view';

export function ConnectedTableInstruments(): ReactElement {
    const { getSocketInstrumentsDedobsed$ } = useModule(ModuleBaseActions);

    const instruments = useSyncObservable(getSocketInstrumentsDedobsed$());
    const [{ timeZone }] = useTimeZoneInfoSettings(EApplicationName.TradingServersManager);

    return (
        <TableAllInstruments
            instruments={instruments}
            exportFilename={`All_instruments`}
            timeZone={timeZone}
        />
    );
}
