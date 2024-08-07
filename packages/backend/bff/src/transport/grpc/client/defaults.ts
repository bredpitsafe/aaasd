import * as grpc from '@grpc/grpc-js';

import type { TChannelCredentials, TChannelOptions } from './def.ts';
import { EGrpcStatus } from './def.ts';

export const DEFAULT_GRPC_OPTIONS: Partial<TChannelOptions> = {
    'grpc.keepalive_time_ms': 5_000,
    'grpc.keepalive_timeout_ms': 20_000,
    'grpc.keepalive_permit_without_calls': 1,
    'grpc.http2.max_pings_without_data': 0,
    'grpc.http2.min_time_between_pings_ms': 120_000,
    'grpc.enable_retries': 1,
    'grpc.service_config': JSON.stringify({
        methodConfig: [
            {
                // Applies to all methods
                name: [{ service: '' }],
                retryPolicy: {
                    maxAttempts: 3,
                    initialBackoff: '0.5s',
                    maxBackoff: '1s',
                    backoffMultiplier: 1.25,
                    retryableStatusCodes: [EGrpcStatus.UNAVAILABLE],
                },
            },
        ],
    }),
};

export const DEFAULT_GRPC_CREDENTIALS: TChannelCredentials = grpc.credentials.createInsecure();
