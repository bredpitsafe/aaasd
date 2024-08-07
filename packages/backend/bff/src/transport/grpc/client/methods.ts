import type * as grpc from '@grpc/grpc-js';
import { Metadata } from '@grpc/grpc-js';
import type { Subscription } from 'rxjs';
import { Observable } from 'rxjs';

import type {
    TCallOptions,
    TGrpcClientDuplexStreamMethod,
    TGrpcClientRequestStreamMethod,
    TGrpcClientResponseStreamMethod,
    TGrpcClientUnaryMethod,
    TGrpcError,
    TGrpcResponse,
} from './def.ts';
import { GrpcClientError } from './error.ts';

/**
 * Wraps a single gRPC client method with unary request and response types
 * with its reactive counterpart.
 * @param method The gRPC client method to be wrapped.
 * @returns A reactive version of the standard method.
 */
export function createUnaryMethod<RequestType, ResponseType>(
    method: Function,
): TGrpcClientUnaryMethod<RequestType, ResponseType> {
    return (
        request: RequestType,
        metadata = new Metadata(),
        options: Partial<TCallOptions> = {},
    ) => {
        return new Observable((observer) => {
            let isCancelledByClient = false;

            const call: grpc.ClientUnaryCall = method(
                request,
                metadata,
                options,
                (err: TGrpcError, data: ResponseType) => {
                    if (isCancelledByClient) {
                        return;
                    }
                    if (err) {
                        observer.error(GrpcClientError.fromGrpcError(err));
                    }
                    observer.next({ data });
                    observer.complete();
                },
            );

            return function teardown() {
                isCancelledByClient = true;
                call.cancel();
            };
        });
    };
}

export function createRequestStreamMethod<RequestType, ResponseType>(
    method: Function,
): TGrpcClientRequestStreamMethod<RequestType, ResponseType> {
    return (
        request$: Observable<RequestType>,
        metadata = new Metadata(),
        options: Partial<TCallOptions> = {},
    ) => {
        return new Observable((observer) => {
            let isCancelledByClient = false;

            const call: grpc.ClientWritableStream<RequestType> = method(
                metadata,
                options,
                (err: TGrpcError, data: ResponseType) => {
                    if (isCancelledByClient) {
                        return;
                    }
                    if (err) {
                        return observer.error(GrpcClientError.fromGrpcError(err));
                    }
                    observer.next({ data });
                    observer.complete();
                },
            );

            const upstreamSubscription = observableToWritableStream(request$, call);

            return function teardown() {
                isCancelledByClient = true;
                call.cancel();
                upstreamSubscription.unsubscribe();
            };
        });
    };
}

export function createResponseStreamMethod<RequestType, ResponseType>(
    method: Function,
): TGrpcClientResponseStreamMethod<RequestType, ResponseType> {
    return (
        request: RequestType,
        metadata = new Metadata(),
        options: Partial<TCallOptions> = {},
    ) => {
        const call: grpc.ClientReadableStream<ResponseType> = method(request, metadata, options);
        return fromReadableStreamToObservable(call);
    };
}

export function createDuplexStreamMethod<RequestType, ResponseType>(
    method: Function,
): TGrpcClientDuplexStreamMethod<RequestType, ResponseType> {
    return (
        request$: Observable<RequestType>,
        metadata = new Metadata(),
        options: Partial<TCallOptions> = {},
    ) => {
        const call: grpc.ClientDuplexStream<RequestType, ResponseType> = method(metadata, options);
        const upstreamSubscription = observableToWritableStream(request$, call);
        return fromReadableStreamToObservable(call, upstreamSubscription);
    };
}

function observableToWritableStream<RequestType>(
    request$: Observable<RequestType>,
    call: grpc.ClientWritableStream<RequestType>,
): Subscription {
    return request$.subscribe({
        next: (value) => call.write(value),
        error: (error) => call.emit('error', error),
        complete: () => call.end(),
    });
}

function fromReadableStreamToObservable<
    ResponseType,
    T extends grpc.ClientReadableStream<ResponseType>,
>(call: T, upstreamSubscription?: Subscription): TGrpcResponse<ResponseType> {
    return new Observable((subscriber) => {
        let isCancelledByClient = false;

        function dataHandler(data: ResponseType) {
            subscriber.next({ data });
        }

        function errorHandler(err: TGrpcError) {
            if (isCancelledByClient) return;
            subscriber.error(GrpcClientError.fromGrpcError(err));
        }

        function endHandler() {
            subscriber.complete();
        }

        function statusHandler() {
            if (isCancelledByClient) return;
            upstreamSubscription?.unsubscribe();
        }

        call.on('data', dataHandler);
        call.on('error', errorHandler);
        call.on('end', endHandler);
        call.on('status', statusHandler);

        return function teardown() {
            isCancelledByClient = true;
            call.cancel();
            upstreamSubscription?.unsubscribe();
        };
    });
}
