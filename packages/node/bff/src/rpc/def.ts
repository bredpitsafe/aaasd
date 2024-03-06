import { Observable } from 'rxjs';

import { TRpcRequest, TRpcResponse, TRpcResponsePayload, TRpcRouteName } from '../def/rpc.ts';
import { TUserAuthState, TUserName } from '../def/user.ts';
import { TSessionId } from '../utils/sessionId.ts';
import { RpcRequestContext } from './context.ts';

export enum ERpcMethod {
    CALL = 'call',
    SUBSCRIBE = 'subscribe',
}

export type TRpcSession = {
    id: TSessionId;

    authenticate(authState: TUserAuthState): void;

    isAuthenticated$: Observable<boolean>;

    deauthenticate(): void;

    getUserName(): TUserName | undefined;

    getAuthState(): TUserAuthState | undefined;

    send(res: TRpcResponse, ctx: RpcRequestContext): Observable<void>;

    close(ctx: RpcRequestContext): Observable<void>;
};

/**
 * @public
 */
export type TRpcRouteOptions = {
    skipAuth?: boolean;
};

export type TRpcRouteTransformers<
    RouteName extends TRpcRouteName,
    Req extends object,
    Res extends object | undefined,
> = {
    fromRequestToGrpc(req: TRpcRequest<RouteName>): Req;
    fromGrpcToResponse(grpcRes: Res): TRpcResponsePayload<RouteName>;
};

export type TRpcRoute<T extends TRpcRouteName = TRpcRouteName> = {
    method: ERpcMethod;
    options?: TRpcRouteOptions;
    handler(req: TRpcRequest<T>, ctx: RpcRequestContext): Observable<TRpcResponsePayload<T>>;
};

export type TRpcRoutesMap = {
    [K in TRpcRouteName]: TRpcRoute<K>;
};

/**
 * @public
 */
export type TRpcRequestWithContext = { req: TRpcRequest; ctx: RpcRequestContext };
export type TRpcResponseWithContext = { res: TRpcResponse; ctx: RpcRequestContext };

export type TRoutesConfig<T extends TRpcRouteName> = {
    [P in T]: TRpcRoute<P>;
};
