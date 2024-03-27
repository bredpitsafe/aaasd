import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { TGetComponentStateRevisionsReturnType } from '../../actors/TradingServersManager/actions/getComponentStateRevisions';
import { getComponentStateRevisionsEnvBox } from '../../actors/TradingServersManager/envelops';
import { TComponentId } from '../../types/domain/component';
import { TSocketURL } from '../../types/domain/sockets';
import { FailFactory } from '../../types/Fail';
import { ValueDescriptor } from '../../types/ValueDescriptor';
import { progressiveRetry } from '../../utils/Rx/progressiveRetry';
import { tapError } from '../../utils/Rx/tap';
import { TraceId } from '../../utils/traceId';
import { SyncDesc } from '../../utils/ValueDescriptor';
import { IModuleActor } from '../actor';
import { IModuleNotifications } from '../notifications/def';

type TParams = {
    componentId: TComponentId;
    btRunNo?: number;
    limit?: number;
};
type TDIContainer = { actor: IModuleActor; notifications: IModuleNotifications; url: TSocketURL };
const ComponentStateRevisionsUnboundGetterFail = FailFactory('getComponentStateRevisionsUnbound');
const UNKNOWN = ComponentStateRevisionsUnboundGetterFail('UNKNOWN');
export type TComponentStateRevisionsDesc = ValueDescriptor<
    TGetComponentStateRevisionsReturnType,
    typeof UNKNOWN,
    null
>;

export function getComponentStateRevisionsUnbound(
    { actor, notifications, url }: TDIContainer,
    { componentId, limit, btRunNo }: TParams,
    traceId: TraceId,
): Observable<TComponentStateRevisionsDesc> {
    return getComponentStateRevisionsEnvBox
        .requestStream(actor, {
            url,
            componentId,
            limit,
            traceId,
            btRunNo,
        })
        .pipe(
            map((v): TComponentStateRevisionsDesc => SyncDesc(v, null)),
            tapError((error) => {
                notifications.error({
                    traceId,
                    message: 'Failed to receive component state revisions',
                    description: error.message,
                });
            }),
            progressiveRetry(),
        );
}
