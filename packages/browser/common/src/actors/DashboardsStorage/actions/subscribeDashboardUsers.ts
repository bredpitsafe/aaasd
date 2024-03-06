import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import type { TContextRef } from '../../../di';
import { subscribeDashboardUsersHandle } from '../../../handlers/dashboards/subscribeDashboardUsersHandle';
import type { TWithTraceId } from '../../../handlers/def';
import { ModuleCommunicationHandlersRemoted } from '../../../modules/communicationRemoteHandlers';
import type { TUserName } from '../../../modules/user';
import type { TSocketURL } from '../../../types/domain/sockets';

export type TSubscribeDashboardUsersArguments = TWithTraceId & {
    url: TSocketURL;
};

export type TSubscribeDashboardUsersReturnType = TUserName[];

export function subscribeDashboardUsers(
    ctx: TContextRef,
    props: TSubscribeDashboardUsersArguments,
): Observable<TSubscribeDashboardUsersReturnType> {
    const { requestStream } = ModuleCommunicationHandlersRemoted(ctx);

    return subscribeDashboardUsersHandle(requestStream, props.url, {
        traceId: props.traceId,
    }).pipe(map((envelope) => envelope.payload.list.map(({ user }) => user)));
}
