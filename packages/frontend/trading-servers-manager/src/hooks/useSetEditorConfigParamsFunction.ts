import { useModule } from '@frontend/common/src/di/react';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import type { NavigationOptions } from 'router5';

import type { TTradingServersManagerParams } from '../modules/router/defs';
import type { ETradingServersManagerRouteParams } from '../modules/router/defs';
import { ModuleTradingServersManagerRouter } from '../modules/router/module';

export function useSetEditorConfigParamsFunction(
    currentTab: string,
): (
    params: Partial<
        Pick<
            TTradingServersManagerParams,
            | ETradingServersManagerRouteParams.ConfigDigest
            | ETradingServersManagerRouteParams.ConfigSelection
        >
    >,
) => void {
    const { setParams } = useModule(ModuleTradingServersManagerRouter);

    return useFunction((params: Partial<TTradingServersManagerParams>) => {
        void (
            setParams as (
                params: Partial<TTradingServersManagerParams>,
                options: NavigationOptions,
            ) => Promise<void>
        )(
            {
                tab: currentTab,
                createTab: true,
                configDigest: undefined,
                configSelection: undefined,
                ...params,
            },
            { replace: true },
        );
    });
}
