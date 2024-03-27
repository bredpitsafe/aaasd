import { TimeZoneSelector } from '@frontend/common/src/components/Settings/components/TimeZoneSelector';
import { EApplicationName } from '@frontend/common/src/types/app';
import { ReactElement } from 'react';

import { ConfirmProdSettings } from './ConfirmProdSettings';

export function AppSettings(): ReactElement {
    return (
        <>
            <TimeZoneSelector
                appName={EApplicationName.TradingServersManager}
                extendTimeZoneList={true}
            />
            <ConfirmProdSettings />
        </>
    );
}
