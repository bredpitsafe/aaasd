import { extractErrorMessage } from '@backend/utils/src/general.ts';
import type { TLoggerBasicMessage } from '@backend/utils/src/logger';
import { generateTraceId } from '@common/utils';
import type { ServerInterceptor } from '@grpc/grpc-js';
import { ServerInterceptingCall } from '@grpc/grpc-js';
import { Status } from '@grpc/grpc-js/build/src/constants.js';

import {
    appendMetadataWithUsernameFromToken,
    extractToken,
    extractTraceId,
} from './utils/metadata-utils.ts';

export const getAuthInterceptor =
    (logError: (loggerMessage: TLoggerBasicMessage) => void): ServerInterceptor =>
    (_, call) => {
        return new ServerInterceptingCall(call, {
            start: (next) => {
                next({
                    onReceiveMetadata: (metadata, nextCall) => {
                        const traceId = extractTraceId(metadata) ?? generateTraceId();

                        try {
                            const token = extractToken(metadata);
                            if (token) {
                                appendMetadataWithUsernameFromToken(metadata, token);
                                nextCall(metadata);
                            } else {
                                throw new Error('No token provided');
                            }
                        } catch (error) {
                            const message = extractErrorMessage(error);
                            call.sendStatus({
                                code: Status.UNAUTHENTICATED,
                                details: message,
                            });
                            logError({ message, traceId, error });
                        }
                    },
                });
            },
        });
    };
