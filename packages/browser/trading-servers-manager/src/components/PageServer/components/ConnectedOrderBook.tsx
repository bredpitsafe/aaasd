import { ConnectedCommonOrderBook } from '@frontend/common/src/components/Pages/ConnectedCommonOrderBook';
import { useTimeZoneInfoSettings } from '@frontend/common/src/components/Settings/hooks/useTimeZoneSettings';
import { useModule } from '@frontend/common/src/di/react';
import { ModuleBaseActions } from '@frontend/common/src/modules/actions';
import { ModuleCommunication } from '@frontend/common/src/modules/communication';
import { EApplicationName } from '@frontend/common/src/types/app';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { isNil } from 'lodash-es';
import { useMemo } from 'react';

import { useRouteParams } from '../../../hooks/useRouteParams';

export function ConnectedOrderBook() {
    const { currentSocketUrl$ } = useModule(ModuleCommunication);
    const { getSocketInstrumentsDedobsed$ } = useModule(ModuleBaseActions);

    const routeParams = useRouteParams();

    const socketUrl = useSyncObservable(currentSocketUrl$);
    const instruments = useSyncObservable(getSocketInstrumentsDedobsed$());

    const storageKey = useMemo(
        () =>
            isNil(routeParams?.server)
                ? undefined
                : `ORDER_BOOK_FILTERS_STATE_{server:[${routeParams?.server}]}`,
        [routeParams?.server],
    );

    const [{ timeZone }] = useTimeZoneInfoSettings(EApplicationName.TradingServersManager);

    return isNil(socketUrl) || isNil(storageKey) ? null : (
        <ConnectedCommonOrderBook
            socketUrl={socketUrl}
            instruments={instruments}
            storageKey={storageKey}
            timeZone={timeZone}
        />
    );
}
