import { useTimeZoneInfoSettings } from '@frontend/common/src/components/Settings/hooks/useTimeZoneSettings';
import { EApplicationName } from '@frontend/common/src/types/app';
import { ReactElement } from 'react';

import { TableAllInstruments } from '../../Tables/TableAllInstruments/view';

export function ConnectedTableInstruments(): ReactElement {
    const [{ timeZone }] = useTimeZoneInfoSettings(EApplicationName.TradingServersManager);

    return <TableAllInstruments exportFilename={`All_instruments`} timeZone={timeZone} />;
}
