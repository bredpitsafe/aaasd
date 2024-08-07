import { EApplicationName } from '@common/types';
import type { TContextRef } from '@frontend/common/src/di';
import { ModuleFactory } from '@frontend/common/src/di';
import { ModuleSettings } from '@frontend/common/src/modules/settings';
import { ModuleNotifyErrorAndFail } from '@frontend/common/src/utils/Rx/ModuleNotify.ts';
import { extractSyncedValueFromValueDescriptor } from '@frontend/common/src/utils/Rx/ValueDescriptor2.ts';
import { isProdEnvironment } from '@frontend/common/src/utils/url.ts';
import { isNil } from 'lodash-es';
import type { Observable } from 'rxjs';
import { distinctUntilChanged, of, shareReplay } from 'rxjs';
import { filter, map, startWith, switchMap } from 'rxjs/operators';

import { ETradingServersManagerSettings } from '../../components/Settings/def.ts';
import { DEFAULT_CONFIRM_PROD_SETTINGS } from '../../components/Settings/hooks/useConfirmProdSettings.ts';
import { ModuleTradingServersManagerRouter } from '../router/module.ts';

export const ModuleConfirmProdAction$ = ModuleFactory((ctx: TContextRef): Observable<boolean> => {
    const { state$ } = ModuleTradingServersManagerRouter(ctx);
    const { getAppSettings$ } = ModuleSettings(ctx);

    const notifyErrorAndFail = ModuleNotifyErrorAndFail(ctx);

    return state$.pipe(
        map((state) => state?.route?.params?.socket),
        map((socket) => isProdEnvironment(socket)),
        filter((isProd): isProd is boolean => !isNil(isProd)),
        switchMap((isProd) =>
            isProd
                ? getAppSettings$(
                      EApplicationName.TradingServersManager,
                      ETradingServersManagerSettings.ConfirmProdSettings,
                  ).pipe(
                      notifyErrorAndFail(),
                      extractSyncedValueFromValueDescriptor(),
                      filter((confirm): confirm is boolean => !isNil(confirm)),
                      startWith(DEFAULT_CONFIRM_PROD_SETTINGS),
                  )
                : of(false),
        ),
        distinctUntilChanged(),
        shareReplay(1),
    );
});
