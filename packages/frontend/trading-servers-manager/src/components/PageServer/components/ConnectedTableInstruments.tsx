import { useTimeZoneInfoSettings } from '@frontend/common/src/components/Settings/hooks/useTimeZoneSettings';
import type { ReactElement } from 'react';

import { TableAllInstruments } from '../../Tables/TableAllInstruments/view';

export function ConnectedTableInstruments(): ReactElement {
    const [{ timeZone }] = useTimeZoneInfoSettings();

    return <TableAllInstruments exportFilename={`All_instruments`} timeZone={timeZone} />;
}
