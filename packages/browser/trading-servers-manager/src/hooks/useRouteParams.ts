import { useModule } from '@frontend/common/src/di/react';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { isNil } from 'lodash-es';

import type { TTradingServersManagerParams } from '../modules/router/defs';
import { ModuleTradingServersManagerRouter } from '../modules/router/module';
import { getTradingServersManagerParams } from '../utils/router';

export function useRouteParams(): TTradingServersManagerParams | undefined {
    const { state$ } = useModule(ModuleTradingServersManagerRouter);
    const routeState = useSyncObservable(state$);

    return isNil(routeState?.route?.params)
        ? undefined
        : getTradingServersManagerParams(routeState!.route!.params);
}
