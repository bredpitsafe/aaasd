import { LoadingOverlay } from '@frontend/common/src/components/overlays/LoadingOverlay';
import { useTimeZoneInfoSettings } from '@frontend/common/src/components/Settings/hooks/useTimeZoneSettings';
import { EApplicationName } from '@frontend/common/src/types/app';
import type { TGate } from '@frontend/common/src/types/domain/gates';
import type { TimeZone } from '@frontend/common/src/types/time';
import { ReactElement } from 'react';

import { useCurrentGate } from '../../../../hooks/useCurrentGate';
import { usePageComponentMetadata } from '../../../../hooks/usePageComponentMetadata';
import { GateStatusMessages } from './view';

export function ConnectedGateStatusMessages(): ReactElement {
    const gate = useCurrentGate();
    const [{ timeZone }] = useTimeZoneInfoSettings(EApplicationName.TradingServersManager);

    if (gate === undefined) {
        return <LoadingOverlay />;
    }

    return <InnerConnectedGateStatusMessages gate={gate} timeZone={timeZone} />;
}

function InnerConnectedGateStatusMessages({
    gate,
    timeZone,
}: {
    gate: TGate;
    timeZone: TimeZone;
}): ReactElement {
    const { statusMessageHistory } = usePageComponentMetadata(gate.type, gate.id);

    return <GateStatusMessages statusMessageHistory={statusMessageHistory} timeZone={timeZone} />;
}
