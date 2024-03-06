import { EActorName } from '../def/actor.ts';
import { EGrpcClientName, grpcClients } from '../def/grpcClients.ts';
import { TRpcRequest } from '../def/rpc.ts';
import { TStageName } from '../def/stages.ts';
import { createGrpcClient } from '../transport/grpc/client/client.ts';
import { appConfig } from '../utils/appConfig.ts';
import { defaultLogger, TLogger } from '../utils/logger.ts';
import { TRpcRoute, TRpcSession } from './def.ts';

type TRpcRequestContextParams = {
    req: TRpcRequest;
    session: TRpcSession;
    route: TRpcRoute;
};

type TRpcRequestContextLogger = TLogger<
    'actor' | 'traceId' | 'correlationId' | 'sessionId' | 'type' | 'username'
>;

export class RpcRequestContext {
    static create(params: TRpcRequestContextParams): RpcRequestContext {
        return new RpcRequestContext(params);
    }

    public logger: TRpcRequestContextLogger;
    public req: TRpcRequest;
    public session: TRpcSession;
    public route: TRpcRoute;

    constructor(params: TRpcRequestContextParams) {
        this.route = params.route;
        this.session = params.session;
        this.req = params.req;
        this.logger = defaultLogger.child({
            actor: EActorName.Rpc,
            traceId: this.req.traceId,
            correlationId: this.req.correlationId,
            sessionId: this.session.id,
            type: this.req.payload.type,
            username: this.session.getUserName(),
            method: this.route.method,
        });
    }

    getGrpcClient<T extends EGrpcClientName>(clientName: T, stage: TStageName) {
        let url = appConfig.resources.grpc.services[clientName];
        url = url.replace('{stage}', stage);
        url = url.replace('{stage_hostname}', appConfig.stages[stage].hostname);
        if (!url.includes(':')) {
            const { defaultPort } = appConfig.resources.grpc;
            url = `${url}:${defaultPort}`;
        }
        return createGrpcClient(grpcClients[clientName], url);
    }
}
