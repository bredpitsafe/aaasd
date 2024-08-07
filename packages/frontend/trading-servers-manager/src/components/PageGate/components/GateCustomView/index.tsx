import { Error } from '@frontend/common/src/components/Error/view.tsx';
import { LoadingOverlay } from '@frontend/common/src/components/overlays/LoadingOverlay';
import { useModule } from '@frontend/common/src/di/react';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import type { TGate } from '@frontend/common/src/types/domain/gates';
import type { TSocketStruct } from '@frontend/common/src/types/domain/sockets';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import {
    isLoadingValueDescriptor,
    isSyncedValueDescriptor,
} from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import { isNil } from 'lodash-es';
import type { ReactElement } from 'react';

import { useCurrentGate } from '../../../../hooks/gate.ts';
import { usePageComponentMetadata } from '../../../../hooks/usePageComponentMetadata';
import { GateCustomView } from './view';

export function ConnectedGateCustomView(): null | ReactElement {
    const { currentSocketStruct$ } = useModule(ModuleSocketPage);
    const socket = useSyncObservable(currentSocketStruct$);
    const gate = useCurrentGate();

    switch (true) {
        case isNil(socket):
        case isLoadingValueDescriptor(gate):
            return <LoadingOverlay />;
        case isSyncedValueDescriptor(gate): {
            return isNil(gate.value) ? (
                <Error status={404} />
            ) : (
                <InnerConnectedGateCustomView gate={gate.value} socket={socket} />
            );
        }
        default:
            return null;
    }
}

function InnerConnectedGateCustomView(props: { gate: TGate; socket: TSocketStruct }): ReactElement {
    const { gate, socket } = props;

    const {
        customViewDraft,
        setCustomViewDraft,
        getCustomViewScrollPosition,
        setCustomViewScrollPosition,
    } = usePageComponentMetadata(gate.type, gate.id);

    return (
        <GateCustomView
            gate={gate}
            socket={socket}
            draft={customViewDraft}
            getScrollPosition={getCustomViewScrollPosition}
            setDraft={setCustomViewDraft}
            onSetScrollPosition={setCustomViewScrollPosition}
        />
    );
}
