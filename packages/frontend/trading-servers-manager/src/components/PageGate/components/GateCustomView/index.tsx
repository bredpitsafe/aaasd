import { LoadingOverlay } from '@frontend/common/src/components/overlays/LoadingOverlay';
import { useModule } from '@frontend/common/src/di/react';
import { ModuleCommunication } from '@frontend/common/src/modules/communication';
import { TGate } from '@frontend/common/src/types/domain/gates';
import { TSocketName, TSocketURL } from '@frontend/common/src/types/domain/sockets';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { ReactElement } from 'react';

import { useCurrentGate } from '../../../../hooks/useCurrentGate';
import { usePageComponentMetadata } from '../../../../hooks/usePageComponentMetadata';
import { GateCustomView } from './view';

export function ConnectedGateCustomView(): ReactElement {
    const { currentSocketUrl$, currentSocketName$ } = useModule(ModuleCommunication);
    const socketUrl = useSyncObservable(currentSocketUrl$);
    const socketName = useSyncObservable(currentSocketName$);
    const gate = useCurrentGate();

    if (gate === undefined || socketUrl === undefined || socketName === undefined) {
        return <LoadingOverlay />;
    }

    return (
        <InnerConnectedGateCustomView gate={gate} socketName={socketName} socketUrl={socketUrl} />
    );
}

function InnerConnectedGateCustomView(props: {
    gate: TGate;
    socketUrl: TSocketURL;
    socketName: TSocketName;
}): ReactElement {
    const { gate, socketUrl, socketName } = props;

    const {
        customViewDraft,
        setCustomViewDraft,
        getCustomViewScrollPosition,
        setCustomViewScrollPosition,
    } = usePageComponentMetadata(gate.type, gate.id);

    return (
        <GateCustomView
            gate={gate}
            socketUrl={socketUrl}
            socketName={socketName}
            draft={customViewDraft}
            getScrollPosition={getCustomViewScrollPosition}
            setDraft={setCustomViewDraft}
            onSetScrollPosition={setCustomViewScrollPosition}
        />
    );
}
