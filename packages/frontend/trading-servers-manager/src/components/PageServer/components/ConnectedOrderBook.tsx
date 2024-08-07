import { generateTraceId } from '@common/utils';
import { ConnectedCommonOrderBook } from '@frontend/common/src/components/Pages/ConnectedCommonOrderBook';
import { useTimeZoneInfoSettings } from '@frontend/common/src/components/Settings/hooks/useTimeZoneSettings';
import { useModule } from '@frontend/common/src/di/react';
import { ModuleSubscribeToInstrumentsOnCurrentStage } from '@frontend/common/src/modules/actions/dictionaries/ModuleSubscribeToInstrumentsOnCurrentStage.ts';
import { ModuleCommunication } from '@frontend/common/src/modules/communication';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { useNotifiedValueDescriptorObservable } from '@frontend/common/src/utils/React/useValueDescriptorObservable.ts';
import { isNil } from 'lodash-es';
import { useMemo } from 'react';

import { useRouteParams } from '../../../hooks/useRouteParams';

export function ConnectedOrderBook() {
    const { currentSocketUrl$ } = useModule(ModuleCommunication);
    const subscribeToInstruments = useModule(ModuleSubscribeToInstrumentsOnCurrentStage);

    const routeParams = useRouteParams();

    const socketUrl = useSyncObservable(currentSocketUrl$);
    const instruments = useNotifiedValueDescriptorObservable(
        subscribeToInstruments(undefined, { traceId: generateTraceId() }),
    );

    const storageKey = useMemo(
        () =>
            isNil(routeParams?.server)
                ? undefined
                : `ORDER_BOOK_FILTERS_STATE_{server:[${routeParams?.server}]}`,
        [routeParams?.server],
    );

    const [{ timeZone }] = useTimeZoneInfoSettings();

    return isNil(socketUrl) || isNil(storageKey) ? null : (
        <ConnectedCommonOrderBook
            socketUrl={socketUrl}
            instruments={instruments.value ?? undefined}
            storageKey={storageKey}
            timeZone={timeZone}
        />
    );
}
