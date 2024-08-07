import type {
    ExtractServiceClientConstructorInstance,
    TGrpcClient,
    TGrpcClientConfig,
    TServiceClientConstructor,
} from './def.ts';
import { DEFAULT_GRPC_CREDENTIALS, DEFAULT_GRPC_OPTIONS } from './defaults.ts';
import {
    createDuplexStreamMethod,
    createRequestStreamMethod,
    createResponseStreamMethod,
    createUnaryMethod,
} from './methods.ts';

export function createGrpcClient<C extends TServiceClientConstructor>(
    ClientConstructor: C,
    url: string,
    config: TGrpcClientConfig = {},
): TGrpcClient<ExtractServiceClientConstructorInstance<C>> {
    const client = new ClientConstructor(
        url,
        config.credentials ?? DEFAULT_GRPC_CREDENTIALS,
        config.options ?? DEFAULT_GRPC_OPTIONS,
    );
    const serviceDefinition = ClientConstructor.service;

    const grpcClient = {} as TGrpcClient<ExtractServiceClientConstructorInstance<C>>;

    type TGrpcClientStub = Record<string, Function>;

    // Create reactive GRPC methods
    for (const [methodName, { requestStream, responseStream }] of Object.entries(
        serviceDefinition,
    )) {
        const method = (client as unknown as TGrpcClientStub)[methodName].bind(client);

        if (!requestStream && !responseStream) {
            (grpcClient as TGrpcClientStub)[methodName] = createUnaryMethod(method);
        } else if (requestStream && !responseStream) {
            (grpcClient as TGrpcClientStub)[methodName] = createRequestStreamMethod(method);
        } else if (!requestStream && responseStream) {
            (grpcClient as TGrpcClientStub)[methodName] = createResponseStreamMethod(method);
        } else {
            (grpcClient as TGrpcClientStub)[methodName] = createDuplexStreamMethod(method);
        }
    }

    return grpcClient;
}
