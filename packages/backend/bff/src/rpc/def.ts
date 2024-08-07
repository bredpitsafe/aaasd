import type { Observable } from 'rxjs';

import type { TRpcRequest, TRpcResponse, TRpcResponsePayload, TRpcRouteName } from '../def/rpc.ts';
import type { TStageName } from '../def/stages.ts';
import type { TUserAuthState, TUserName } from '../def/user.ts';
import type { TSessionId } from '../utils/sessionId.ts';
import type { RpcRequestContext } from './context.ts';

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

    send<T extends TRpcRouteName>(res: TRpcResponse, ctx?: RpcRequestContext<T>): Observable<void>;

    close<T extends TRpcRouteName>(ctx: RpcRequestContext<T>): Observable<void>;
};

/**
 * @public
 */
export type TRpcRouteOptions = {
    skipAuth?: boolean;
    emitResponse?: boolean;
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
    requestStage?: (ctx: RpcRequestContext<T>) => TStageName;
    handler(ctx: RpcRequestContext<T>): Observable<TRpcResponsePayload<T>>;
};

export type TRpcRoutesMap = {
    [K in TRpcRouteName]: TRpcRoute<K> | undefined;
};

/**
 * @public
 */
export type TRpcRequestWithContext<T extends TRpcRouteName> = {
    req: TRpcRequest;
    ctx: RpcRequestContext<T>;
};
export type TRpcResponseWithContext<T extends TRpcRouteName> = {
    res: TRpcResponse;
    ctx: RpcRequestContext<T>;
};

export type TRoutesConfig<T extends TRpcRouteName> = {
    [P in T]: TRpcRoute<P>;
};
