import { TCorrelationId } from '@backend/utils/src/correlationId.ts';
import { TraceId } from '@backend/utils/src/traceId/index.ts';
import { Opaque } from '@backend/utils/src/util-types.ts';

import type { Request } from './request.ts';
import { TUserName } from './user.ts';

export enum EActorName {
    Authentication = 'Authentication',
    Dashboards = 'Dashboards',
    Drafts = 'Drafts',
    Permissions = 'Permissions',
    Users = 'Users',
    Socket = 'Socket',
    Subscription = 'Subscription',
    Database = 'Database',
    Root = 'Root',
}

export type TActorSocketKey = Opaque<'TActorSocketKey', string>;
export type TActorSubscriptionKey = Opaque<'TActorSubscriptionKey', string>;

export type TActorRequest<T = Request['payload']> = {
    username: TUserName | undefined;
    socketKey: TActorSocketKey;
    traceId: TraceId;
    correlationId: TCorrelationId;
    payload: T;
};
