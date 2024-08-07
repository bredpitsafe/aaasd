import { EApplicationName } from '@common/types';
import { getNowISO } from '@common/utils';
import { isNil } from 'lodash-es';
import type { Observable, ObservableInput } from 'rxjs';
import { from, throwError } from 'rxjs';

import type { TRpcResponsePayload } from '../../../def/rpc.ts';
import { ERpcErrorCode, ERpcSubscriptionEvent } from '../../../def/rpc.ts';
import { EStageCategory, EStageEnv } from '../../../def/stages.ts';
import type { RpcRequestContext } from '../../../rpc/context.ts';
import { RpcError } from '../../../rpc/errors.ts';
import { appConfig } from '../../../utils/appConfig.ts';
import { typedObjectEntries } from '../../../utils/types.ts';
import type { EStagesRouteName } from '../def.ts';
import type {
    TStageExternalConfig,
    TSubscribeToStagesResponsePayload,
} from '../schemas/SubscribeToStages.schema.ts';

export const subscribeToStagesHandler = (
    ctx: RpcRequestContext<EStagesRouteName.SubscribeToStages>,
): Observable<TRpcResponsePayload<EStagesRouteName.SubscribeToStages>> => {
    const appName = ctx.req.payload.filters.appName;

    if (isNil(appName) || !Object.values(EApplicationName).includes(appName)) {
        return from(
            throwError(
                () => new RpcError(ERpcErrorCode.INVALID_ARGUMENT, `invalid appName filter value`),
            ),
        );
    }

    const stages = typedObjectEntries(appConfig.stages)
        .filter(([, config]) => {
            // Skip stages that are not meant for the clients
            if (![EStageCategory.Platform, EStageCategory.Client].includes(config.category)) {
                return false;
            }

            // Skip stages that have `clientApps` field that does not appear in `include.appName`
            return !(!isNil(config.clientApps) && !config.clientApps.includes(appName));
        })
        .map<TStageExternalConfig>(([name, config]) => {
            return {
                name,
                isProduction: config.env === EStageEnv.Prod,
                skipAuthentication: config.skipAuth ?? false,
                socket: config.clientSocket ?? `/${name}/`,
                isBacktesting:
                    config.clientApps?.includes(EApplicationName.BacktestingManager) ?? false,
            };
        });

    return from<ObservableInput<TSubscribeToStagesResponsePayload>>([
        {
            type: ERpcSubscriptionEvent.Ok,
            platformTime: getNowISO(),
        },
        {
            type: ERpcSubscriptionEvent.Snapshot,
            snapshot: stages,
            total: stages.length,
            platformTime: getNowISO(),
        },
    ]);
};
