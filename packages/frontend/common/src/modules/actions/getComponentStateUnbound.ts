import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { getComponentStateEnvBox } from '../../actors/TradingServersManager/envelops';
import { TComponentId } from '../../types/domain/component';
import { TSocketURL } from '../../types/domain/sockets';
import { FailFactory } from '../../types/Fail';
import { ValueDescriptor } from '../../types/ValueDescriptor';
import { progressiveRetry } from '../../utils/Rx/progressiveRetry';
import { tapError } from '../../utils/Rx/tap';
import { TraceId } from '../../utils/traceId';
import { SyncDesc, UnscDesc } from '../../utils/ValueDescriptor';
import { IModuleActor } from '../actor';
import { IModuleNotifications } from '../notifications/def';

type TParams = { componentId: TComponentId; digest: string };
type TDIContainer = { actor: IModuleActor; notifications: IModuleNotifications; url: TSocketURL };
const ComponentStateFail = FailFactory('State');
const NOT_FOUND = ComponentStateFail('NOT_FOUND');
export type TComponentStateDescriptor = ValueDescriptor<string, typeof NOT_FOUND, null>;

export const getComponentStateUnbound = (
    { actor, notifications, url }: TDIContainer,
    { componentId, digest }: TParams,
    traceId: TraceId,
): Observable<TComponentStateDescriptor> => {
    return getComponentStateEnvBox
        .requestStream(actor, {
            url,
            componentId,
            digest,
            traceId,
        })
        .pipe(
            map((v): TComponentStateDescriptor => SyncDesc(v, null)),
            startWith(UnscDesc(null) as TComponentStateDescriptor),
            tapError((error) => {
                notifications.error({
                    traceId,
                    message: 'Failed to receive component state',
                    description: error.message,
                });
            }),
            progressiveRetry(),
        );
};
