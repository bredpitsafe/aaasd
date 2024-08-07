import { isNil, isUndefined, omitBy } from 'lodash-es';

import { EActorName } from '../def/actor.ts';
import { STAGE_MOCKS } from '../def/constants.ts';
import type { EGrpcClientName } from '../def/grpcClients.ts';
import { grpcClients } from '../def/grpcClients.ts';
import type { TRpcRequest, TRpcRouteName } from '../def/rpc.ts';
import { ERpcErrorCode } from '../def/rpc.ts';
import type { TStageConfig, TStageName } from '../def/stages.ts';
import { createGrpcClient } from '../transport/grpc/client/client.ts';
import { appConfig } from '../utils/appConfig.ts';
import type { TChildLogger } from '../utils/logger.ts';
import { defaultLogger } from '../utils/logger.ts';
import type { TRpcRoute, TRpcSession } from './def.ts';
import { RpcError } from './errors.ts';

type TRpcRequestContextParams<K extends TRpcRouteName> = {
    req: TRpcRequest<K>;
    session: TRpcSession;
    route: TRpcRoute<K> | undefined;
};

type TRpcRequestContextLogger = TChildLogger<
    'actor' | 'traceId' | 'correlationId' | 'sessionId' | 'type' | 'username'
>;

export class RpcRequestContext<T extends TRpcRouteName> {
    public logger: TRpcRequestContextLogger;
    public req: TRpcRequest<T>;
    public session: TRpcSession;
    public route: TRpcRoute<T> | undefined;

    public stage: TStageName | undefined;
    public stageConfig: TStageConfig | undefined;

    constructor(params: TRpcRequestContextParams<T>) {
        this.req = params.req;
        this.session = params.session;
        this.route = params.route;

        const stage = this.initStageName();
        this.logger = defaultLogger.createChildLogger(
            omitBy(
                {
                    actor: EActorName.Rpc,
                    traceId: this.req.traceId,
                    correlationId: this.req.correlationId,
                    sessionId: this.session.id,
                    type: this.req.payload.type,
                    username: this.session.getUserName(),
                    stage,
                    method: this.route?.method,
                },
                isUndefined,
            ),
        );

        this.stage = stage;
        this.stageConfig = this.initStageConfig();
    }

    private initStageName(): TStageName | undefined {
        let stage = this.route?.requestStage?.(this);

        // Route request to `mocks` service if requested by the client with `mock: true` in request payload
        if (this.req.payload?.mock === true && stage !== STAGE_MOCKS) {
            stage = STAGE_MOCKS;
        }

        return stage;
    }

    private initStageConfig(): TStageConfig | undefined {
        if (isNil(this.stage)) {
            return;
        }

        const stageConfig = appConfig.stages[this.stage];
        if (isNil(stageConfig)) {
            return;
        }
        return { ...stageConfig, name: this.stage };
    }

    shouldSkipAuth() {
        return this.stageConfig?.skipAuth || this.route?.options?.skipAuth;
    }

    getRpcRequestUrl<T extends EGrpcClientName>(clientName: T): string {
        if (
            !isNil(this.stageConfig) &&
            !isNil(this.stageConfig.grpcClients) &&
            !this.stageConfig.grpcClients.includes(clientName)
        ) {
            throw new RpcError(
                ERpcErrorCode.INTERNAL,
                `GRPC Client '${clientName}' is not enabled for stage '${this.stage}', check service configuration.`,
            );
        }

        let url = appConfig.resources.grpc.services[clientName];
        if (isNil(url)) {
            throw new RpcError(
                ERpcErrorCode.INVALID_ARGUMENT,
                `invalid client name '${clientName}', check service configuration`,
            );
        }

        const STAGE_PLACEHOLDER = '{stage}';
        if (url.includes(STAGE_PLACEHOLDER)) {
            if (isNil(this.stage)) {
                throw new RpcError(
                    ERpcErrorCode.INTERNAL,
                    `request calls for '${STAGE_PLACEHOLDER}' parameter but it was not provided`,
                );
            }
            url = url.replace(STAGE_PLACEHOLDER, this.stage);
        }

        const STAGE_HOSTNAME_PLACEHOLDER = '{stage_hostname}';
        if (url.includes(STAGE_HOSTNAME_PLACEHOLDER)) {
            if (isNil(this.stage)) {
                throw new RpcError(
                    ERpcErrorCode.INTERNAL,
                    `missing stage, check request parameters or service configuration`,
                );
            }

            if (isNil(this.stageConfig)) {
                throw new RpcError(
                    ERpcErrorCode.INTERNAL,
                    `missing stage configuration for '${this.stage}', check service configuration`,
                );
            }
            if (isNil(this.stageConfig.hostname)) {
                throw new RpcError(
                    ERpcErrorCode.INTERNAL,
                    `request calls for '${STAGE_HOSTNAME_PLACEHOLDER}' parameter but it was not provided`,
                );
            }
            url = url.replace(STAGE_HOSTNAME_PLACEHOLDER, this.stageConfig.hostname);
        }

        if (!url.includes(':')) {
            const { defaultPort } = appConfig.resources.grpc;
            url = `${url}:${defaultPort}`;
        }

        return url;
    }

    getGrpcClient<T extends EGrpcClientName>(clientName: T) {
        const url = this.getRpcRequestUrl(clientName);
        const clientConstructor = grpcClients[clientName];

        if (isNil(clientConstructor)) {
            throw new RpcError(
                ERpcErrorCode.INTERNAL,
                `Failed to create GRPC client for client name '${clientName}'`,
            );
        }

        return createGrpcClient(grpcClients[clientName], url);
    }
}
