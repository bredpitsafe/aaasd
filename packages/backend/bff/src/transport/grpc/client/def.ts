import * as grpc from '@grpc/grpc-js';
import type { Observable } from 'rxjs';

export type TGrpcClientConfig = {
    credentials?: TChannelCredentials;
    options?: Partial<TChannelOptions>;
};

export type TServiceClientConstructor<
    T extends grpc.Client = grpc.Client,
    U extends grpc.ServiceDefinition = grpc.ServiceDefinition,
> = {
    new (address: string, credentials: TChannelCredentials, options?: Partial<TChannelOptions>): T;
    service: U;
};

export type ExtractServiceClientConstructorInstance<T> = T extends TServiceClientConstructor<
    infer U
>
    ? U
    : never;

export type TChannelCredentials = grpc.ChannelCredentials;

export type TChannelOptions = grpc.ChannelOptions;

export type TMetadata = grpc.Metadata;

export type TCallOptions = grpc.CallOptions;

/**
 * @public
 */
export type TStatusObject = grpc.StatusObject;

export type TGrpcError = TStatusObject & Error;

export const EGrpcStatus = grpc.status;
export type EGrpcStatus = grpc.status;

/**
 * Mapped type that transforms all gRPC method signatures within the gRPC client
 * into their reactive counterparts.
 */
export type TGrpcClient<T extends grpc.Client> = {
    [rpc in keyof T]: T[rpc] extends (
        metadata: TMetadata,
        options: Partial<TCallOptions>,
    ) => grpc.ClientDuplexStream<infer RequestType, infer ResponseType>
        ? TGrpcClientDuplexStreamMethod<RequestType, ResponseType>
        : T[rpc] extends (
                request: infer RequestType,
                metadata: TMetadata,
                options: Partial<TCallOptions>,
            ) => grpc.ClientReadableStream<infer ResponseType>
          ? TGrpcClientResponseStreamMethod<RequestType, ResponseType>
          : T[rpc] extends (
                  metadata: TMetadata,
                  options: Partial<TCallOptions>,
                  callback: (error: TGrpcError | null, response: infer ResponseType) => void,
              ) => grpc.ClientWritableStream<infer RequestType>
            ? TGrpcClientRequestStreamMethod<RequestType, ResponseType>
            : T[rpc] extends (
                    request: infer RequestType,
                    metadata: TMetadata,
                    options: Partial<TCallOptions>,
                    callback: (error: TGrpcError | null, response: infer ResponseType) => void,
                ) => grpc.ClientUnaryCall
              ? TGrpcClientUnaryMethod<RequestType, ResponseType>
              : unknown;
};

export type TGrpcResponse<ResponseType> = Observable<{
    data: ResponseType;
}>;

/**
 * { requestStream: false, responseStream: false }
 */
export type TGrpcClientUnaryMethod<RequestType, ResponseType> = (
    request: RequestType,
    metadata?: TMetadata,
    options?: Partial<TCallOptions>,
) => TGrpcResponse<ResponseType>;

/**
 * { requestStream: true, responseStream: false }
 */
export type TGrpcClientRequestStreamMethod<RequestType, ResponseType> = (
    request: Observable<RequestType>,
    metadata?: TMetadata,
    options?: Partial<TCallOptions>,
) => TGrpcResponse<ResponseType>;

/**
 * { requestStream: false, responseStream: true }
 */
export type TGrpcClientResponseStreamMethod<RequestType, ResponseType> = (
    request: RequestType,
    metadata?: TMetadata,
    options?: Partial<TCallOptions>,
) => TGrpcResponse<ResponseType>;

/**
 * { requestStream: true, responseStream: true }
 */
export type TGrpcClientDuplexStreamMethod<RequestType, ResponseType> = (
    request: Observable<RequestType>,
    metadata?: TMetadata,
    options?: Partial<TCallOptions>,
) => TGrpcResponse<ResponseType>;

/**
 * @public
 */
export type TGrpcClientMethod<RequestType, ResponseType> =
    | TGrpcClientUnaryMethod<RequestType, ResponseType>
    | TGrpcClientRequestStreamMethod<RequestType, ResponseType>
    | TGrpcClientResponseStreamMethod<RequestType, ResponseType>
    | TGrpcClientDuplexStreamMethod<RequestType, ResponseType>;
