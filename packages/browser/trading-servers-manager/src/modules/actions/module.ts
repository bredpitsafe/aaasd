import { ModuleFactory, TContextRef } from '@frontend/common/src/di';
import { ModuleBaseActions } from '@frontend/common/src/modules/actions';
import { createComponentStateRevision } from '@frontend/common/src/modules/actions/createComponentStateRevision';
import { createRealAccounts } from '@frontend/common/src/modules/actions/createRealAccounts';
import { createVirtualAccounts } from '@frontend/common/src/modules/actions/createVirtualAccounts';
import { subscribeToRealAccounts } from '@frontend/common/src/modules/actions/subscribeToRealAccounts';
import { subscribeToVirtualAccounts } from '@frontend/common/src/modules/actions/subscribeToVirtualAccounts';
import { updateRealAccounts } from '@frontend/common/src/modules/actions/updateRealAccounts';
import { updateVirtualAccounts } from '@frontend/common/src/modules/actions/updateVirtualAccounts';
import { ModuleSettings } from '@frontend/common/src/modules/settings';
import { EApplicationName } from '@frontend/common/src/types/app';
import { isProdEnvironment } from '@frontend/common/src/utils/url';
import { isNil } from 'lodash-es';
import { distinctUntilChanged, Observable, of, shareReplay } from 'rxjs';
import { filter, map, startWith, switchMap } from 'rxjs/operators';

import { ETradingServersManagerSettings } from '../../components/Settings/def';
import { DEFAULT_CONFIRM_PROD_SETTINGS } from '../../components/Settings/hooks/useConfirmProdSettings';
import { ModuleTradingServersManagerRouter } from '../router/module';
import { getComponentStateRevisionDedobs } from './getComponentStateRevision';

function createModule(ctx: TContextRef) {
    return {
        subscribeToVirtualAccounts: subscribeToVirtualAccounts.bind(null, ctx),
        subscribeToRealAccounts: subscribeToRealAccounts.bind(null, ctx),
        updateVirtualAccounts: updateVirtualAccounts.bind(null, ctx),
        createVirtualAccounts: createVirtualAccounts.bind(null, ctx),
        updateRealAccounts: updateRealAccounts.bind(null, ctx),
        createRealAccounts: createRealAccounts.bind(null, ctx),
        createComponentStateRevision: createComponentStateRevision.bind(null, ctx),

        confirmProdAction$: getConfirmProdAction$(ctx),

        getComponentStateRevision: getComponentStateRevisionDedobs.bind(null, ctx),

        ...ModuleBaseActions(ctx),
    };
}

function getConfirmProdAction$(ctx: TContextRef): Observable<boolean> {
    const { state$ } = ModuleTradingServersManagerRouter(ctx);
    const { getAppSettings$ } = ModuleSettings(ctx);

    return state$.pipe(
        map((state) => state?.route?.params?.socket),
        map((socket) => isProdEnvironment(socket)),
        filter((isProd): isProd is boolean => !isNil(isProd)),
        switchMap((isProd) =>
            isProd
                ? getAppSettings$<boolean>(
                      EApplicationName.TradingServersManager,
                      ETradingServersManagerSettings.ConfirmProdSettings,
                  ).pipe(
                      filter((confirm): confirm is boolean => !isNil(confirm)),
                      startWith(DEFAULT_CONFIRM_PROD_SETTINGS),
                  )
                : of(false),
        ),
        distinctUntilChanged(),
        shareReplay(1),
    );
}

export const ModuleTradingServersManagerActions = ModuleFactory(createModule);
