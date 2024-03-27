import { isNull } from 'lodash-es';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { getComponentStateRevisionEnvBox } from '../../../actors/TradingServersManager/envelops';
import { TComponentId } from '../../../types/domain/component';
import { TComponentStateRevision } from '../../../types/domain/ComponentStateRevision';
import { TSocketURL } from '../../../types/domain/sockets';
import { FailFactory } from '../../../types/Fail';
import { ISO } from '../../../types/time';
import { ValueDescriptor } from '../../../types/ValueDescriptor';
import { progressiveRetry } from '../../../utils/Rx/progressiveRetry';
import { tapError } from '../../../utils/Rx/tap';
import { TraceId } from '../../../utils/traceId';
import { FailDesc, SyncDesc, UnscDesc } from '../../../utils/ValueDescriptor';
import { IModuleActor } from '../../actor';
import { IModuleNotifications } from '../../notifications/def';

type TDIContainer = { actor: IModuleActor; notifications: IModuleNotifications; url: TSocketURL };
type TProps = { platformTime: ISO; componentId: TComponentId };
const ComponentStateRevisionGetterFail = FailFactory('getComponentStateRevisionUnbound');
const NOT_FOUND = ComponentStateRevisionGetterFail('NOT_FOUND');
type Fails = typeof NOT_FOUND;
type TResultDescriptor = ValueDescriptor<TComponentStateRevision, Fails, null>;

export function getComponentStateRevisionUnbound(
    { actor, notifications, url }: TDIContainer,
    { platformTime, componentId }: TProps,
    traceId: TraceId,
): Observable<TResultDescriptor> {
    return getComponentStateRevisionEnvBox
        .requestStream(actor, {
            url,
            platformTime,
            componentId,
            traceId,
        })
        .pipe(
            map((v): TResultDescriptor => (isNull(v) ? FailDesc(NOT_FOUND) : SyncDesc(v, null))),
            startWith(UnscDesc(null) as TResultDescriptor),
            tapError((error) => {
                notifications.error({
                    traceId,
                    message: 'Failed to receive component state revision',
                    description: error.message,
                });
            }),
            progressiveRetry(),
        );
}
