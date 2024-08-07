import type { TimeZone } from '@common/types';
import { Error } from '@frontend/common/src/components/Error/view.tsx';
import { LoadingOverlay } from '@frontend/common/src/components/overlays/LoadingOverlay';
import { useTimeZoneInfoSettings } from '@frontend/common/src/components/Settings/hooks/useTimeZoneSettings';
import type { TGate } from '@frontend/common/src/types/domain/gates';
import {
    isLoadingValueDescriptor,
    isSyncedValueDescriptor,
} from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import { isNil } from 'lodash-es';
import type { ReactElement } from 'react';

import { useCurrentGate } from '../../../../hooks/gate.ts';
import { usePageComponentMetadata } from '../../../../hooks/usePageComponentMetadata';
import { GateStatusMessages } from './view';

export function ConnectedGateStatusMessages(): null | ReactElement {
    const gate = useCurrentGate();
    const [{ timeZone }] = useTimeZoneInfoSettings();

    switch (true) {
        case isLoadingValueDescriptor(gate):
            return <LoadingOverlay />;
        case isSyncedValueDescriptor(gate):
            return isNil(gate.value) ? (
                <Error status={404} />
            ) : (
                <InnerConnectedGateStatusMessages gate={gate.value} timeZone={timeZone} />
            );
        default:
            return null;
    }
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
